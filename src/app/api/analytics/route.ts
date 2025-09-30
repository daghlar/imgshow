import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { AnalyticsData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const analyticsData: AnalyticsData = await request.json();

    // Validate required fields
    if (!analyticsData.image_id || !analyticsData.session_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert analytics data
    const { data, error } = await supabaseAdmin
      .from('analytics')
      .insert(analyticsData)
      .select()
      .single();

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save analytics data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('image_id');
    const userId = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (imageId) {
      query = query.eq('image_id', imageId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: analytics, error, count } = await query;

    if (error) {
      console.error('Analytics fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: analytics,
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
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
