import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Image, UploadOptions } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { ImageProcessor } from '@/lib/storage/image-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const optionsString = formData.get('options') as string;
    const uploadOptions: UploadOptions = optionsString ? JSON.parse(optionsString) : {};

    // Process image
    const imageProcessor = new ImageProcessor();
    const { image, thumbnail } = await imageProcessor.processImage(file, uploadOptions);

    // Set user ID (will be replaced with actual user ID when auth is implemented)
    image.user_id = 'anonymous';

    // Create image record in database
    const { data, error } = await supabaseAdmin
      .from('images')
      .insert({
        ...image,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save image data' },
        { status: 500 }
      );
    }

    // Schedule auto-deletion if specified
    if (imageData.auto_delete_at) {
      // This would typically be handled by a background job or cron
      // For now, we'll just store the deletion time
      console.log(`Image ${id} scheduled for deletion at ${imageData.auto_delete_at}`);
    }

    return NextResponse.json({
      success: true,
      data: data as Image,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: images, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch images' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: images,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
