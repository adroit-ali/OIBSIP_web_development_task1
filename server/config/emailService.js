import nodemailer from 'nodemailer';

let transporter = null;
export const recentEmailsLog = [];

export const initEmailTransporter = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('📧 Custom SMTP Transporter initialized');
  } else {
    try {
      // Use Ethereal test account with 1500ms timeout or fallback to console simulation
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Ethereal setup timed out')), 1500)
      );
      const testAccount = await Promise.race([
        nodemailer.createTestAccount(),
        timeoutPromise,
      ]);
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Ethereal test mail transporter ready for local testing');
    } catch {
      console.log('📧 Instant simulated email engine active');
      transporter = null;
    }
  }
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const emailRecord = {
    to,
    subject,
    html,
    text,
    sentAt: new Date().toISOString(),
    previewUrl: null,
  };

  try {
    if (transporter) {
      const info = await transporter.sendMail({
        from: '"SliceCraft Artisan Pizza" <no-reply@slicecraft.com>',
        to,
        subject,
        html,
        text,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      emailRecord.previewUrl = previewUrl || null;
      if (previewUrl) {
        console.log(`✉️ Test Email Preview URL: ${previewUrl}`);
      }
    } else {
      console.log(`✉️ [SIMULATED EMAIL to ${to}]: ${subject}`);
    }
  } catch (err) {
    console.error('Email dispatch error (logging fallback):', err.message);
  }

  recentEmailsLog.unshift(emailRecord);
  if (recentEmailsLog.length > 50) recentEmailsLog.pop();
  return emailRecord;
};

export const sendVerificationEmail = async (email, name, verificationToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyLink = `${clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
      <div style="background: linear-gradient(135deg, #e11d48, #f97316); padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: -0.5px;">🍕 SliceCraft Artisan Pizza</h1>
        <p style="margin: 8px 0 0; color: #ffe4e6; font-size: 15px;">Welcome to the Gourmet Pizza Experience</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #f1f5f9; font-size: 20px; margin-top: 0;">Hi ${name}, verify your email address</h2>
        <p style="color: #94a3b8; line-height: 1.6; font-size: 15px;">
          Thank you for joining SliceCraft! Please confirm your email address by clicking the button below to activate your account and start ordering custom artisan pizzas.
        </p>
        <div style="text-align: center; margin: 36px 0;">
          <a href="${verifyLink}" style="background: linear-gradient(135deg, #e11d48, #ea580c); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);">
            Verify My Email
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          Or copy and paste this verification URL into your browser:<br/>
          <span style="color: #f43f5e; word-break: break-all;">${verifyLink}</span>
        </p>
        <p style="color: #475569; font-size: 12px; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px;">
          Verification token: <strong style="color: #cbd5e1;">${verificationToken}</strong><br/>
          This link will expire in 24 hours. If you did not create an account, you can ignore this email.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: '🍕 Verify your email - SliceCraft Pizza',
    html,
    text: `Welcome ${name}! Please verify your email with this link: ${verifyLink} or token: ${verificationToken}`,
  });
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
      <div style="background: linear-gradient(135deg, #e11d48, #f97316); padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🍕 SliceCraft Artisan Pizza</h1>
        <p style="margin: 8px 0 0; color: #ffe4e6; font-size: 15px;">Password Reset Request</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #f1f5f9; font-size: 20px; margin-top: 0;">Reset your SliceCraft password</h2>
        <p style="color: #94a3b8; line-height: 1.6; font-size: 15px;">
          We received a request to reset your password. Click the button below to choose a new password. This reset link is valid for 1 hour.
        </p>
        <div style="text-align: center; margin: 36px 0;">
          <a href="${resetLink}" style="background: linear-gradient(135deg, #e11d48, #ea580c); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          Direct link:<br/>
          <span style="color: #f43f5e; word-break: break-all;">${resetLink}</span>
        </p>
        <p style="color: #475569; font-size: 12px; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px;">
          Reset token: <strong style="color: #cbd5e1;">${resetToken}</strong><br/>
          If you didn't request a password reset, you can safely disregard this email.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: '🔒 Reset your SliceCraft password',
    html,
    text: `Reset your password at: ${resetLink} or use token: ${resetToken}`,
  });
};

export const sendLowStockAlertEmail = async (adminEmail, lowStockItems, threshold) => {
  const rows = lowStockItems.map(
    (item) => `
      <tr style="border-bottom: 1px solid #334155;">
        <td style="padding: 12px 16px; font-weight: 600; color: #f8fafc;">${item.name}</td>
        <td style="padding: 12px 16px; text-transform: capitalize; color: #cbd5e1;">${item.category}</td>
        <td style="padding: 12px 16px; font-weight: bold; color: #ef4444;">${item.stock} ${item.unit || 'units'}</td>
        <td style="padding: 12px 16px; color: #94a3b8;">${item.threshold || threshold} units</td>
      </tr>
    `
  ).join('');

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #ef4444;">
      <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 28px 24px; text-align: left;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px;">⚠️ Inventory Alert: Low Stock Warning</h1>
        <p style="margin: 6px 0 0; color: #fee2e2; font-size: 14px;">Automated Inventory Monitor Report</p>
      </div>
      <div style="padding: 24px;">
        <p style="color: #e2e8f0; font-size: 15px; margin-top: 0;">
          The automated cron scheduler detected that <strong>${lowStockItems.length}</strong> ingredient(s) have dropped below the inventory threshold (&lt; ${threshold} units). Please replenish promptly to avoid order fulfillment disruption.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #1e293b; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #334155; text-align: left; color: #94a3b8; font-size: 13px; text-transform: uppercase;">
              <th style="padding: 12px 16px;">Ingredient</th>
              <th style="padding: 12px 16px;">Category</th>
              <th style="padding: 12px 16px;">Current Stock</th>
              <th style="padding: 12px 16px;">Threshold</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/inventory" style="background: #ef4444; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Open Admin Inventory Panel
          </a>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: adminEmail,
    subject: `⚠️ Low Stock Alert: ${lowStockItems.length} items below threshold`,
    html,
    text: `Low stock alert: ${lowStockItems.map(i => `${i.name} (${i.stock} left)`).join(', ')}`,
  });
};
