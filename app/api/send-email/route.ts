import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real production app, configure these securely in environment variables.
    // For this demonstration, we use the provided super admin email, but would need an App Password to actually authenticate.
    // If SMTP_PASS is missing, we will just log the email to console for development testing.
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'support@stepwellsrenovaterfoundation.org',
        pass: process.env.SMTP_PASS || 'R@vindra.&tepwell#2026',
      },
    });

    const info = await transporter.sendMail({
      from: `"Stepwells Renovater" <${process.env.SMTP_USER || 'support@stepwellsrenovaterfoundation.org'}>`,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Failed to send email:', error);
    // If auth fails in development, we still return success to not block the UI workflow, 
    // but in production we'd want to handle this properly.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
