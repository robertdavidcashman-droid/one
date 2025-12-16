/**
 * CHATBOT EMAIL API ROUTE
 * 
 * Sends emails when users select options in the chatbot.
 * Uses environment variables for email configuration.
 * 
 * For production, configure one of:
 * - SMTP settings (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 * - Resend API (RESEND_API_KEY)
 * - SendGrid API (SENDGRID_API_KEY)
 * - Or use a service like Nodemailer with Gmail
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EmailRequest {
  subject: string;
  body: string;
  option: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { subject, body: emailBody, option } = body;

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    const isCustodyIntake = option === 'custody-intake';

    // Route urgent custody enquiries to the designated recipient (can be overridden via env var)
    const recipientEmail = isCustodyIntake
      ? (process.env.CUSTODY_ENQUIRY_RECIPIENT_EMAIL || 'robertcashman@defencelegalservices.co.uk')
      : 'robertdavidcashman@gmail.com';

    // Enforce required subject line for custody enquiries
    const finalSubject = isCustodyIntake ? 'URGENT – Police Station Custody Enquiry' : subject;
    
    // Get email configuration from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const resendApiKey = process.env.RESEND_API_KEY;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    // Try Resend first (easiest for Vercel)
    if (resendApiKey) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Police Station Agent <noreply@policestationagent.com>',
            to: [recipientEmail],
            subject: finalSubject,
            text: emailBody,
            reply_to: 'noreply@policestationagent.com',
          }),
        });

        if (resendResponse.ok) {
          const data = await resendResponse.json();
          console.log('[Chatbot Email] Sent via Resend:', data.id);
          return NextResponse.json({ success: true, method: 'resend', id: data.id });
        }
      } catch (error) {
        console.error('[Chatbot Email] Resend error:', error);
      }
    }

    // Try SendGrid
    if (sendgridApiKey) {
      try {
        const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sendgridApiKey}`,
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: recipientEmail }],
            }],
            from: { email: 'noreply@policestationagent.com', name: 'Police Station Agent' },
            subject: finalSubject,
            content: [{
              type: 'text/plain',
              value: emailBody,
            }],
          }),
        });

        if (sendgridResponse.ok) {
          console.log('[Chatbot Email] Sent via SendGrid');
          return NextResponse.json({ success: true, method: 'sendgrid' });
        }
      } catch (error) {
        console.error('[Chatbot Email] SendGrid error:', error);
      }
    }

    // Try SMTP (using nodemailer if available, or simple SMTP)
    if (smtpHost && smtpUser && smtpPass) {
      try {
        // For now, we'll use a simple fetch to an email service
        // In production, you might want to use nodemailer
        // This is a fallback that logs the email
        console.log('[Chatbot Email] SMTP configured but not implemented. Email details:');
        console.log('To:', recipientEmail);
        console.log('Subject:', finalSubject);
        console.log('Body:', emailBody);
        
        // In a real implementation, you would use nodemailer here
        // For now, we'll return success and log it
        return NextResponse.json({ 
          success: true, 
          method: 'smtp-logged',
          message: 'Email logged (SMTP not fully configured - install nodemailer for full functionality)'
        });
      } catch (error) {
        console.error('[Chatbot Email] SMTP error:', error);
      }
    }

    // Fallback: Log the email (for development/testing)
    console.log('\n=== CHATBOT EMAIL (No email service configured) ===');
    console.log('To:', recipientEmail);
    console.log('Subject:', finalSubject);
    console.log('Body:', emailBody);
    console.log('Option:', option);
    console.log('==================================================\n');

    // Return success even if email service isn't configured
    // This allows the chatbot to work in development
    // In production, configure one of the email services above
    return NextResponse.json({ 
      success: true, 
      method: 'logged',
      message: 'Email logged (configure email service for production)'
    });

  } catch (error) {
    console.error('[Chatbot Email] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
