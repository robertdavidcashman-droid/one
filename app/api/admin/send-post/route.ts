import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import db from '@/lib/db';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

/**
 * Email/SMS Sending API
 * 
 * Provides hooks for sending blog posts via Email or SMS
 * NO WhatsApp integration - Email and SMS only
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin session using simple password auth
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { postId, method, recipient } = await request.json();
    
    if (!postId || !method || !recipient) {
      return NextResponse.json(
        { error: 'postId, method, and recipient are required' },
        { status: 400 }
      );
    }
    
    if (method !== 'email' && method !== 'sms') {
      return NextResponse.json(
        { error: 'Method must be "email" or "sms"' },
        { status: 400 }
      );
    }
    
    // Get blog post
    const post = db.prepare(`
      SELECT id, title, slug, content, excerpt, meta_title, meta_description
      FROM blog_posts
      WHERE id = ?
    `).get(postId) as BlogPost | undefined;
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://criminaldefencekent.co.uk';
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    
    // Generate shareable content
    const shareContent = {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      url: postUrl,
    };
    
    if (method === 'email') {
      // Email sending hook
      // Note: Currently returns mailto link for client-side sending. 
      // For server-side email integration, add SendGrid, AWS SES, or similar service here.
      const emailSubject = shareContent.title;
      const emailBody = `
${shareContent.description}

Read the full article: ${postUrl}

---
CriminalDefenceKent.co.uk
Qualified Duty Solicitor & Higher Court Advocate
Expert Police Station Representation in Kent
      `.trim();
      
      // Return email data for client-side mailto link or server-side sending
      return NextResponse.json({
        success: true,
        method: 'email',
        mailto: `mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
        data: {
          to: recipient,
          subject: emailSubject,
          body: emailBody,
        },
      });
    } else if (method === 'sms') {
      // SMS sending hook
      // Note: Currently returns sms: link for client-side sending.
      // For server-side SMS integration, add Twilio, AWS SNS, or similar service here.
      const smsBody = `${shareContent.title}\n\n${shareContent.url}`;
      
      // Return SMS data for client-side sms: link or server-side sending
      return NextResponse.json({
        success: true,
        method: 'sms',
        smsLink: `sms:${recipient}?body=${encodeURIComponent(smsBody)}`,
        data: {
          to: recipient,
          body: smsBody,
        },
      });
    }
    
    return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
  } catch (error) {
    console.error('Send post error:', error);
    return NextResponse.json(
      { error: 'Failed to prepare send data' },
      { status: 500 }
    );
  }
}
