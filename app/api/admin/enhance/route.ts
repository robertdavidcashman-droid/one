import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth-helpers';

// Safe content enhancer - improves content without destructive changes
export async function POST(request: NextRequest) {
  const session = await verifyAdminSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Safe content enhancement - non-destructive improvements
    let enhanced = content;

    // Improve readability: ensure proper spacing
    enhanced = enhanced.replace(/\n{3,}/g, '\n\n');

    // Ensure proper paragraph structure
    enhanced = enhanced.replace(/<p>\s*<\/p>/g, '');

    // Add suggestions for improvement (non-destructive)
    const suggestions: string[] = [];

    // Check for SEO improvements
    if (!enhanced.match(/<h[1-6]/)) {
      suggestions.push('Consider adding headings for better structure');
    }

    if (enhanced.length < 300) {
      suggestions.push('Consider expanding content for better SEO');
    }

    // Return enhanced content with suggestions
    return NextResponse.json({
      success: true,
      enhanced,
      suggestions,
      note: 'Content enhanced safely. Original content preserved.',
    });
  } catch (error) {
    console.error('Enhancement error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance content' },
      { status: 500 }
    );
  }
}

