/**
 * Univo Professional & Dope Email Template Engine
 * Optimized for Light and Dark theme email clients with high contrast readability.
 */

export function generateOTPEmailHTML({ name, email, otp, expiresMinutes = 10 }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Univo Verification Code</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #090d10 !important; }
      .email-card { background-color: #121a20 !important; border-color: #1e2d36 !important; }
      .text-heading { color: #f8fafc !important; }
      .text-body { color: #cbd5e1 !important; }
      .text-subtle { color: #94a3b8 !important; }
      .otp-box { background-color: #18252d !important; border-color: #2dd4bf !important; color: #2dd4bf !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;" class="email-bg">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);" class="email-card">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); text-align: center;">
              <span style="font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">🎓 Univo</span>
              <p style="margin: 6px 0 0 0; color: #ccfbf1; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Identity Verification</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a;" class="text-heading">
                Hey ${name || email.split('@')[0]} 👋
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;" class="text-body">
                Use the following 6-digit verification code to complete your security check on <strong>Univo College Planner</strong>.
              </p>

              <!-- OTP Code Display Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #0d9488; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;" class="otp-box">
                <span style="font-size: 11px; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 8px;">One-Time Password</span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; color: #0f172a; letter-spacing: 10px; display: inline-block;">${otp}</span>
              </div>

              <!-- Expiry Alert -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 12px 16px; color: #92400e; font-size: 12px; font-weight: 600;">
                    ⏰ <strong>Timer Notice:</strong> This code expires in <strong>${expiresMinutes} minutes</strong>. Do not share this code with anyone.
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8;" class="text-subtle">
                If you didn't request this verification code, your account is safe and you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;" class="text-subtle">
              &copy; ${new Date().getFullYear()} Univo Platform. All rights reserved. &middot; Autonomous College Ecosystem
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function generatePasswordResetEmailHTML({ name, email, resetLink, token }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Univo Password</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #090d10 !important; }
      .email-card { background-color: #121a20 !important; border-color: #1e2d36 !important; }
      .text-heading { color: #f8fafc !important; }
      .text-body { color: #cbd5e1 !important; }
      .text-subtle { color: #94a3b8 !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" class="email-bg">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);" class="email-card">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); text-align: center;">
              <span style="font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">🎓 Univo</span>
              <p style="margin: 6px 0 0 0; color: #bae6fd; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Security & Password Recovery</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a;" class="text-heading">
                Reset Your Password 🔒
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;" class="text-body">
                Hello <strong>${name || email.split('@')[0]}</strong>,<br>
                We received a password reset request for your Univo student account associated with <strong>${email}</strong>.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetLink}" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(2,132,199,0.35);">
                  Reset Password Now &rarr;
                </a>
              </div>

              <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b;" class="text-subtle">
                Or copy and paste this link into your browser:
              </p>
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; font-size: 11px; word-break: break-all; color: #0284c7; font-family: monospace; margin-bottom: 24px;">
                ${resetLink}
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8;" class="text-subtle">
                This reset link is valid for <strong>20 minutes</strong>. If you didn't request a password reset, you can safely ignore this message.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;" class="text-subtle">
              &copy; ${new Date().getFullYear()} Univo Platform Security Team
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function generateFriendRequestEmailHTML({ toName, fromName, fromEmail, acceptLink }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Friend Request on Univo</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #090d10 !important; }
      .email-card { background-color: #121a20 !important; border-color: #1e2d36 !important; }
      .text-heading { color: #f8fafc !important; }
      .text-body { color: #cbd5e1 !important; }
      .text-subtle { color: #94a3b8 !important; }
      .profile-box { background-color: #18252d !important; border-color: #263843 !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" class="email-bg">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);" class="email-card">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); text-align: center;">
              <span style="font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">🎓 Univo Social</span>
              <p style="margin: 6px 0 0 0; color: #d1fae5; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">New Classmate Connection</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a;" class="text-heading">
                Hey ${toName} 👋
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;" class="text-body">
                <strong>${fromName}</strong> (${fromEmail}) has sent you a friend request on Univo! Connect to share class notes, study groups, and campus updates.
              </p>

              <!-- Profile Snapshot Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; display: flex; align-items: center; margin-bottom: 24px;" class="profile-box">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; font-size: 18px; font-weight: 800; line-height: 48px; text-align: center; margin-right: 16px;">
                  ${fromName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span style="font-size: 16px; font-weight: 800; color: #0f172a; display: block;" class="text-heading">${fromName}</span>
                  <span style="font-size: 12px; color: #64748b;" class="text-subtle">${fromEmail} &middot; Student Peer</span>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 24px 0;">
                <a href="${acceptLink || '#'}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(16,185,129,0.35);">
                  Accept Friend Request &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;" class="text-subtle">
              &copy; ${new Date().getFullYear()} Univo Social Messenger &middot; Connecting Students Everywhere
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function generateProductUpdateEmailHTML({ name, updateTitle, version = 'v2.4', releaseHighlights = [] }) {
  const highlightsList = releaseHighlights.length > 0 ? releaseHighlights : [
    '⚡ <strong>Expense Tracker Multi-Month History:</strong> View & log spending across past months.',
    '📊 <strong>Attendance Safe Bunk Calculator:</strong> Smart consecutive class warning alerts.',
    '✨ <strong>Dope Task Manager Animations:</strong> Smooth completion exit effects & Kanban view.',
    '💬 <strong>Real-time Social Messenger:</strong> Email request notifications & instant peer chat.'
  ]

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${updateTitle || 'New Features on Univo'}</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #090d10 !important; }
      .email-card { background-color: #121a20 !important; border-color: #1e2d36 !important; }
      .text-heading { color: #f8fafc !important; }
      .text-body { color: #cbd5e1 !important; }
      .text-subtle { color: #94a3b8 !important; }
      .update-item { background-color: #18252d !important; border-color: #263843 !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" class="email-bg">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);" class="email-card">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); text-align: center;">
              <span style="font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">🎓 Univo Release Notes</span>
              <p style="margin: 6px 0 0 0; color: #ddd6fe; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Release ${version} &middot; Subscribed Product Update</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a;" class="text-heading">
                ${updateTitle || 'Fresh Features Just Dropped! ✨'}
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;" class="text-body">
                Hey <strong>${name || 'Univo Student'}</strong>,<br>
                Here is what's new in your Univo college planner workspace this week. We've introduced major performance and usability upgrades designed to keep your semester smooth and stress-free!
              </p>

              <!-- Features Breakdown List -->
              <div style="margin-bottom: 28px;">
                ${highlightsList.map((item) => `
                  <div style="background-color: #f8fafc; border-left: 4px solid #8b5cf6; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; font-size: 13px; color: #334155; line-height: 1.5;" class="update-item">
                    ${item}
                  </div>
                `).join('')}
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0 12px 0;">
                <a href="#" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(139,92,246,0.35);">
                  Explore New Features Now &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;" class="text-subtle">
              You are receiving this product update because you subscribed to Univo platform notifications.
              <br><a href="#" style="color: #8b5cf6; text-decoration: underline;">Manage email preferences</a> or <a href="#" style="color: #64748b;">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
