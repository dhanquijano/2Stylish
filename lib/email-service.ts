import config from "@/lib/config";

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  type: "feedback" | "suggestion" | "complaint" | "general";
  subject: string;
  message: string;
  priority: "low" | "medium" | "high";
}

export async function sendContactEmail(data: ContactEmailData): Promise<boolean> {
  try {
    const { name, email, phone, type, subject, message, priority } = data;

    // Check if Resend token is available
    if (!config.env.resendToken) {
      console.error('RESEND_TOKEN not configured. Please add RESEND_TOKEN to your environment variables.');
      return false;
    }

    // Format the email content
    const emailContent = `
New Contact Form Submission

Type: ${type.toUpperCase()}
Priority: ${priority.toUpperCase()}
Submitted: ${new Date().toLocaleString()}

Contact Information:
- Name: ${name}
- Email: ${email}
- Phone: ${phone || 'Not provided'}

Subject: ${subject}

Message:
${message}

---
Reply to this email to respond directly to the customer.
Customer Email: ${email}
    `.trim();

    // Get priority emoji for subject
    const priorityEmoji = priority === "high" ? "🚨" : priority === "medium" ? "⚠️" : "ℹ️";

    // Use custom verified domain
    const fromEmail = 'Sanbry Grooming <noreply@dhanq.site>';
    
    console.log('Attempting to send email via Resend API...');
    console.log('From:', fromEmail);
    console.log('To:', 'dhanquijano6@gmail.com');
    console.log('Subject:', `${priorityEmoji} [${type.toUpperCase()}] ${subject}`);

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.env.resendToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: 'dhanquijano6@gmail.com',
        reply_to: email, // Allow direct reply to customer
        subject: `${priorityEmoji} [${type.toUpperCase()}] ${subject}`,
        text: emailContent,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Type:</strong> <span style="background-color: ${priority === 'high' ? '#dc3545' : priority === 'medium' ? '#ffc107' : '#28a745'}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">${type.toUpperCase()}</span></p>
              <p><strong>Priority:</strong> <span style="color: ${priority === 'high' ? '#dc3545' : priority === 'medium' ? '#ffc107' : '#28a745'};">${priority.toUpperCase()}</span></p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Contact Information</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 5px 0;"><strong>Name:</strong> ${name}</li>
                <li style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
                <li style="margin: 5px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</li>
              </ul>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Subject</h3>
              <p style="background-color: #f8f9fa; padding: 10px; border-left: 4px solid #007bff;">${subject}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Message</h3>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</div>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Reply to this email to respond directly to the customer.<br>
              Customer Email: <a href="mailto:${email}">${email}</a>
            </p>
          </div>
        `,
      }),
    });

    console.log('Resend API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error response:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Email sent successfully via Resend:', result);
    return true;

  } catch (error) {
    console.error('Error sending contact email via Resend:', error);
    return false;
  }
}

// Alternative email service using EmailJS (client-side) or webhook
export async function sendContactEmailAlternative(data: ContactEmailData): Promise<boolean> {
  try {
    const { name, email, phone, type, subject, message, priority } = data;

    // Try using a simple email webhook service like Formspree or EmailJS
    // For now, we'll use a mock webhook that could be replaced with a real service
    
    const emailPayload = {
      to: 'dhanquijano6@gmail.com',
      from: email,
      subject: `[${type.toUpperCase()}] ${subject}`,
      message: `
New Contact Form Submission

Type: ${type.toUpperCase()}
Priority: ${priority.toUpperCase()}
From: ${name} (${email})
Phone: ${phone || 'Not provided'}

Subject: ${subject}

Message:
${message}

Submitted: ${new Date().toLocaleString()}
      `.trim()
    };

    console.log('=== ATTEMPTING ALTERNATIVE EMAIL SERVICE ===');
    console.log('Payload:', emailPayload);
    
    // You could replace this with services like:
    // - Formspree: https://formspree.io/
    // - EmailJS: https://www.emailjs.com/
    // - Netlify Forms
    // - Webhook.site for testing
    
    /*
    // Example with Formspree:
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });
    
    if (response.ok) {
      console.log('Email sent via Formspree successfully');
      return true;
    }
    */

    // For now, just log the attempt
    console.log('Alternative email service would send:', emailPayload);
    return true;

  } catch (error) {
    console.error('Error in alternative email service:', error);
    return false;
  }
}

// Fallback email service using console logging and potential webhook
export async function sendContactEmailFallback(data: ContactEmailData): Promise<boolean> {
  try {
    const { name, email, phone, type, subject, message, priority } = data;

    // Simple email content for fallback
    const emailContent = `
New Contact Form Submission

Type: ${type.toUpperCase()}
Priority: ${priority.toUpperCase()}
From: ${name} (${email})
Phone: ${phone || 'Not provided'}

Subject: ${subject}

Message:
${message}

Submitted: ${new Date().toLocaleString()}
    `.trim();

    // Log to console as fallback
    console.log('=== CONTACT FORM SUBMISSION (FALLBACK) ===');
    console.log('To: dhanquijano6@gmail.com');
    console.log('Subject:', `[${type.toUpperCase()}] ${subject}`);
    console.log('Content:', emailContent);
    console.log('==========================================');

    // Try to send to a webhook for testing (you can use webhook.site)
    try {
      const webhookUrl = 'https://webhook.site/unique-id'; // Replace with actual webhook URL
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'dhanquijano6@gmail.com',
          subject: `[${type.toUpperCase()}] ${subject}`,
          content: emailContent,
          timestamp: new Date().toISOString(),
        }),
      });

      if (webhookResponse.ok) {
        console.log('Webhook notification sent successfully');
      }
    } catch (webhookError) {
      console.log('Webhook failed, but form data logged to console');
    }

    return true;
  } catch (error) {
    console.error('Error in fallback email service:', error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetLink: string, userName?: string): Promise<boolean> {
  try {
    // Check if Resend token is available
    if (!config.env.resendToken) {
      console.error('RESEND_TOKEN not configured. Please add RESEND_TOKEN to your environment variables.');
      return false;
    }

    // Use custom verified domain
    const fromEmail = 'Sanbry Grooming <noreply@dhanq.site>';
    
    console.log('Sending password reset email via Resend...');
    console.log('To:', email);

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.env.resendToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: '🔐 Reset Your Password - Sanbry Men Grooming House',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #c96e06; margin: 0;">Sanbry Men Grooming House</h1>
            </div>

            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
              <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
              
              ${userName ? `<p style="color: #666;">Hi ${userName},</p>` : ''}
              
              <p style="color: #666; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #c96e06; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </div>

              <p style="color: #666; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #007bff; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px; font-size: 14px;">
                ${resetLink}
              </p>

              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
                </p>
              </div>

              <p style="color: #666; line-height: 1.6; font-size: 14px;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                This is an automated email from Sanbry Men Grooming House
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                If you have any questions, please contact our support team
              </p>
            </div>
          </div>
        `,
        text: `
Reset Your Password - Sanbry Men Grooming House

${userName ? `Hi ${userName},` : 'Hello,'}

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
Sanbry Men Grooming House
        `.trim(),
      }),
    });

    console.log('Resend API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error response:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Password reset email sent successfully:', result);
    return true;

  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}


// Send new account credentials email
export async function sendAccountCredentialsEmail(
  email: string,
  temporaryPassword: string,
  fullName: string,
  role: string
): Promise<boolean> {
  try {
    // Check if Resend token is available
    if (!config.env.resendToken) {
      console.error('RESEND_TOKEN not configured. Please add RESEND_TOKEN to your environment variables.');
      return false;
    }

    // Use custom verified domain
    const fromEmail = 'Sanbry Grooming <noreply@dhanq.site>';
    
    // Get the app URL from environment or use production URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   "http://localhost:3000";
    const loginLink = `${appUrl}/sign-in`;
    
    console.log('Sending account credentials email via Resend...');
    console.log('To:', email);
    console.log('App URL:', appUrl);

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.env.resendToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: '🎉 Welcome to Sanbry Men Grooming House - Your Account Details',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #c96e06; margin: 0;">Sanbry Men Grooming House</h1>
            </div>

            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
              <h2 style="color: #333; margin-top: 0;">Welcome to the Team!</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Hi ${fullName},
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                Your account has been created successfully. Below are your login credentials:
              </p>

              <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #c96e06;">
                <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Temporary Password:</strong> <code style="background-color: #f0f0f0; padding: 4px 8px; border-radius: 3px; font-size: 14px;">${temporaryPassword}</code></p>
                <p style="margin: 5px 0; color: #333;"><strong>Role:</strong> ${role}</p>
              </div>

              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⚠️ Important:</strong> You will be required to change your password upon first login for security reasons.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginLink}" 
                   style="background-color: #c96e06; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Login to Your Account
                </a>
              </div>

              <p style="color: #666; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #007bff; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px; font-size: 14px;">
                ${loginLink}
              </p>

              <div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p style="color: #0d47a1; margin: 0; font-size: 14px;">
                  <strong>🔒 Security Tips:</strong>
                </p>
                <ul style="color: #0d47a1; margin: 10px 0; padding-left: 20px; font-size: 14px;">
                  <li>Change your password immediately after first login</li>
                  <li>Use a strong password with at least 8 characters</li>
                  <li>Never share your password with anyone</li>
                  <li>Keep your login credentials secure</li>
                </ul>
              </div>

              <p style="color: #666; line-height: 1.6; font-size: 14px;">
                If you have any questions or need assistance, please contact your administrator.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                This is an automated email from Sanbry Men Grooming House
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                Please do not reply to this email
              </p>
            </div>
          </div>
        `,
        text: `
Welcome to Sanbry Men Grooming House!

Hi ${fullName},

Your account has been created successfully. Below are your login credentials:

Email: ${email}
Temporary Password: ${temporaryPassword}
Role: ${role}

IMPORTANT: You will be required to change your password upon first login for security reasons.

Login here: ${loginLink}

Security Tips:
- Change your password immediately after first login
- Use a strong password with at least 8 characters
- Never share your password with anyone
- Keep your login credentials secure

If you have any questions or need assistance, please contact your administrator.

---
Sanbry Men Grooming House
        `.trim(),
      }),
    });

    console.log('Resend API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error response:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Account credentials email sent successfully:', result);
    return true;

  } catch (error) {
    console.error('Error sending account credentials email:', error);
    return false;
  }
}
