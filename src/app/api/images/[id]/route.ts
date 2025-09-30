import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { AnalyticsCollector } from '@/lib/analytics/collector';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = params.id;

    // Get image data
    const { data: image, error } = await supabaseAdmin
      .from('images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (error || !image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Check if image has expired
    if (image.auto_delete_at && new Date(image.auto_delete_at) < new Date()) {
      // Delete expired image
      await supabaseAdmin
        .from('images')
        .delete()
        .eq('id', imageId);

      return NextResponse.json(
        { success: false, error: 'Image has expired' },
        { status: 410 }
      );
    }

    // Check if image is password protected
    if (image.password) {
      const providedPassword = request.headers.get('x-image-password');
      if (!providedPassword || providedPassword !== image.password) {
        return NextResponse.json(
          { success: false, error: 'Password required', requiresPassword: true },
          { status: 401 }
        );
      }
    }

    // Increment view count
    await supabaseAdmin
      .from('images')
      .update({ 
        view_count: image.view_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId);

    // Collect analytics data
    try {
      const analyticsCollector = new AnalyticsCollector();
      const analyticsData = await analyticsCollector.collectAnalyticsData(imageId);
      await analyticsCollector.sendAnalyticsData(analyticsData);
    } catch (analyticsError) {
      console.error('Analytics collection failed:', analyticsError);
      // Don't fail the request if analytics fails
    }

    return NextResponse.json({
      success: true,
      data: image,
    });

  } catch (error) {
    console.error('Image fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = params.id;

    // Get image data first
    const { data: image, error: fetchError } = await supabaseAdmin
      .from('images')
      .select('url, thumbnail_url')
      .eq('id', imageId)
      .single();

    if (fetchError || !image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('images')
      .delete()
      .eq('id', imageId);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete image from database' },
        { status: 500 }
      );
    }

    // Delete from blob storage (this would be handled by a separate API route)
    try {
      await fetch('/api/images/delete-blob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: [image.url, image.thumbnail_url].filter(Boolean),
        }),
      });
    } catch (blobError) {
      console.error('Blob deletion failed:', blobError);
      // Don't fail the request if blob deletion fails
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
