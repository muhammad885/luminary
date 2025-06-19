import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL_USERNAME,
    pass: process.env.GOOGLE_EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const logoUrl = `${baseUrl}/logo.png`;

  const mailOptions = {
    from: process.env.GOOGLE_EMAIL_USERNAME,
    to: email,
    subject: "Verify Your Luminary Gifts Store Account",
    text: `Welcome to Luminary Gifts Store! Please verify your email by clicking this link: ${confirmLink}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="
          margin: 0;
          padding: 0;
          font-family: 'Helvetica', 'Arial', sans-serif;
          background-color: #f4f4f4;
          color: #333;
        ">
          <table width="100%" cellpadding="0" cellspacing="0" style="
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            border-top: 5px solid #b8860b;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          ">
            <!-- Header -->
            <tr>
              <td style="padding: 30px 0; text-align: center; background-color: #fffaf0;">
                <img src="${logoUrl}" alt="Luminary Gifts Store" style="max-width: 200px; height: auto;">
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 30px 40px;">
                <h1 style="margin: 0 0 20px; color: #b8860b; font-size: 24px;">Welcome to Luminary Gifts Store!</h1>
                <p style="font-size: 16px; margin-bottom: 20px;">Thank you for signing up. To start your journey with us, please verify your email by clicking the button below.</p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmLink}" style="
                    display: inline-block;
                    padding: 12px 30px;
                    background-color: #b8860b;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: bold;
                    font-size: 16px;
                  ">Verify My Email</a>
                </div>

                <p style="font-size: 14px; color: #888;">If the button doesn't work, copy and paste the following link into your browser:</p>
                <p style="font-size: 14px; color: #888; word-break: break-word;">
                  <a href="${confirmLink}" style="color: #b8860b;">${confirmLink}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="
                padding: 20px 40px;
                background-color: #fffaf0;
                text-align: center;
                font-size: 14px;
                color: #666;
              ">
                <p style="margin: 0 0 10px;">
                  <strong style="color: #b8860b;">Luminary Gifts Store</strong><br>
                  Where thoughtful gifts shine bright
                </p>
                <p style="margin: 0;">
                  <a href="mailto:contact@luminarygiftshop.com" style="color: #b8860b; text-decoration: none;">contact@luminarygiftshop.com</a>
                </p>
                <p style="margin: 10px 0 0; font-size: 12px;">
                  © ${new Date().getFullYear()} Luminary Gifts Store. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};


export const sendPasswordResetEmail = async (email, token) => {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/new-password?token=${token}`;
    const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`;
  
    const mailOptions = {
      from: process.env.GOOGLE_EMAIL_USERNAME,
      to: email,
      subject: "Reset Your Luminary Gifts Store Password",
      text: `You requested a password reset. Please click this link to reset your password: ${resetLink}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Request</title>
          </head>
          <body style="
            margin: 0;
            padding: 0;
            font-family: 'Helvetica', 'Arial', sans-serif;
            background-color: #f4f4f4;
            color: #333;
          ">
            <table width="100%" cellpadding="0" cellspacing="0" style="
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              border-top: 5px solid #b8860b;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            ">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 0; text-align: center; background-color: #fffaf0;">
                  <img src="${logoUrl}" alt="Luminary Gifts Store" style="max-width: 200px; height: auto;">
                </td>
              </tr>
  
              <!-- Main Content -->
              <tr>
                <td style="padding: 30px 40px;">
                  <h1 style="margin: 0 0 20px; color: #b8860b; font-size: 24px;">Password Reset Request</h1>
                  <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.</p>
  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="
                      display: inline-block;
                      padding: 12px 30px;
                      background-color: #b8860b;
                      color: #ffffff;
                      text-decoration: none;
                      border-radius: 4px;
                      font-weight: bold;
                      font-size: 16px;
                    ">Reset My Password</a>
                  </div>
  
                  <p style="font-size: 14px; color: #888;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                  <p style="font-size: 14px; color: #888;">If the button doesn't work, copy and paste this link into your browser:</p>
                  <p style="font-size: 14px; color: #888; word-break: break-word;">
                    <a href="${resetLink}" style="color: #b8860b;">${resetLink}</a>
                  </p>
                </td>
              </tr>
  
              <!-- Footer -->
              <tr>
                <td style="
                  padding: 20px 40px;
                  background-color: #fffaf0;
                  text-align: center;
                  font-size: 14px;
                  color: #666;
                ">
                  <p style="margin: 0 0 10px;">
                    <strong style="color: #b8860b;">Luminary Gifts Store</strong><br>
                    Where thoughtful gifts shine bright
                  </p>
                  <p style="margin: 0;">
                    <a href="mailto:support@luminarygiftshop.com" style="color: #b8860b; text-decoration: none;">support@luminarygiftshop.com</a>
                  </p>
                  <p style="margin: 10px 0 0; font-size: 12px;">
                    © ${new Date().getFullYear()} Luminary Gifts Store. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Password reset email sent:", info.response);
      return { success: true, message: "Password reset email sent successfully" };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return { 
        success: false, 
        error: "Failed to send password reset email",
        details: error.message 
      };
    }
  };

export const sendTwoFactorEmail = async (email, token) => {
    const verificationCode = token;
    const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`;
  
    const mailOptions = {
      from: process.env.GOOGLE_EMAIL_USERNAME,
      to: email,
      subject: "Your Two-Factor Authentication Code",
      text: `Your verification code is: ${verificationCode}\nThis code will expire in 5 minutes.`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Two-Factor Authentication</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Helvetica', 'Arial', sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 0; text-align: center; background-color: #fffaf0;">
                  <img src="${logoUrl}" alt="Company Logo" style="max-width: 200px; height: auto;">
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 30px 40px; background-color: #ffffff;">
                  <h1 style="margin: 0 0 20px; color: #b8860b; font-size: 24px; text-align: center;">
                    Two-Factor Authentication Code
                  </h1>
                  
                  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
                    <p style="margin-bottom: 15px; font-size: 16px;">
                      Enter this code to complete your login:
                    </p>
                    <div style="
                      display: inline-block;
                      padding: 15px 25px;
                      background-color: #fff;
                      color: #b8860b;
                      font-size: 28px;
                      font-weight: bold;
                      letter-spacing: 3px;
                      border: 2px solid #b8860b;
                      border-radius: 6px;
                      margin: 10px 0;
                    ">${verificationCode}</div>
                    <p style="font-size: 14px; color: #666;">
                      <strong>Expires in:</strong> 5 minutes
                    </p>
                  </div>

                  <p style="font-size: 14px; color: #777; margin-top: 25px;">
                    If you didn't request this code, please secure your account immediately.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; background-color: #fffaf0; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #888;">
                    © ${new Date().getFullYear()} Luminary Gifts Store. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("2FA email sent to", email);
      return { 
        success: true, 
        message: "Verification code sent",
        code: verificationCode // Optional: return the code for testing
      };
    } catch (error) {
      console.error("2FA email failed for", email, ":", error.message);
      return { 
        success: false, 
        error: "Failed to send verification email",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
};


export const sendOrderStatusEmail = async (email, orderId, oldStatus, newStatus) => {
  const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`;
  const orderLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/my-order/${orderId}`;

  const statusMessages = {
    pending: "is being prepared",
    processing: "is now being processed",
    shipped: "has been shipped",
    delivered: "has been delivered",
    cancelled: "has been cancelled",
    refunded: "has been refunded"
  };

  const mailOptions = {
    from: process.env.GOOGLE_EMAIL_USERNAME,
    to: email,
    subject: `Order #${orderId} Status Update: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica', 'Arial', sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <tr>
              <td style="padding: 30px 0; text-align: center; background-color: #fffaf0;">
                <img src="${logoUrl}" alt="Company Logo" style="max-width: 200px; height: auto;">
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 30px 40px; background-color: #ffffff;">
                <h1 style="margin: 0 0 20px; color: #b8860b; font-size: 24px; text-align: center;">
                  Your Order Status Has Changed
                </h1>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                  <p style="margin-bottom: 10px; font-size: 16px;">
                    <strong>Order #:</strong> ${orderId}
                  </p>
                  <p style="margin-bottom: 10px; font-size: 16px;">
                    <strong>Previous Status:</strong> ${oldStatus.charAt(0).toUpperCase() + oldStatus.slice(1)}
                  </p>
                  <p style="margin-bottom: 15px; font-size: 16px;">
                    <strong>New Status:</strong> <span style="color: #b8860b; font-weight: bold;">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span>
                  </p>
                  
                  <p style="font-size: 16px; margin: 20px 0 10px;">
                    Your order ${statusMessages[newStatus]}.
                  </p>
                  
                  <div style="text-align: center; margin-top: 20px;">
                    <a href="${orderLink}" style="
                      display: inline-block;
                      padding: 12px 24px;
                      background-color: #b8860b;
                      color: white;
                      text-decoration: none;
                      border-radius: 4px;
                      font-weight: bold;
                    ">View Order Details</a>
                  </div>
                </div>

                <p style="font-size: 14px; color: #777; margin-top: 25px;">
                  If you have any questions about your order, please reply to this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 40px; background-color: #fffaf0; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #888;">
                  © ${new Date().getFullYear()} Luminary Gifts Store. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Order status email sent to", email);
    return true;
  } catch (error) {
    console.error("Failed to send order status email to", email, ":", error.message);
    return false;
  }
};


export const sendNewArrivalsEmail = async (email, name, products) => {
  const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`;
  
  // Format price in Naira
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Generate HTML for products
  const productsHtml = products.map(product => `
    <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="100" valign="top">
            <img 
              src="${product.image || '/placeholder.png'}" 
              alt="${product.name}" 
              style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
            >
          </td>
          <td style="padding-left: 20px;" valign="top">
            <h3 style="margin: 0 0 5px; color: #b8860b;">${product.name}</h3>
            <p style="margin: 0 0 8px; color: #666; font-size: 14px;">
              ${product.category}
            </p>
            <p style="margin: 0 0 8px; color: #333;">
              ${product.description.substring(0, 100)}...
            </p>
            <p style="margin: 0; font-weight: bold; color: #222;">
              ${formatPrice(product.price)}
            </p>
          </td>
        </tr>
      </table>
    </div>
  `).join('');

  const mailOptions = {
    from: `Luminary Gifts Store <${process.env.GOOGLE_EMAIL_USERNAME}>`,
    to: email,
    subject: "New Arrivals You'll Love!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Arrivals at Luminary Gifts</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica', 'Arial', sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <tr>
              <td style="padding: 30px 0; text-align: center; background-color: #fffaf0;">
                <img src="${logoUrl}" alt="Luminary Gifts" style="max-width: 200px; height: auto;">
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 30px 40px; background-color: #ffffff;">
                <h1 style="margin: 0 0 20px; color: #b8860b; font-size: 24px;">
                  Hello ${name},
                </h1>
                
                <p style="font-size: 16px; line-height: 1.6;">
                  We're excited to share our latest arrivals with you! These new products 
                  have just been added to our collection and we think you'll love them.
                </p>

                <h2 style="color: #b8860b; font-size: 20px; margin: 30px 0 15px;">
                  New Arrivals
                </h2>
                
                ${productsHtml}

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                    style="
                      display: inline-block;
                      padding: 12px 30px;
                      background-color: #b8860b;
                      color: white;
                      text-decoration: none;
                      font-weight: bold;
                      border-radius: 4px;
                      font-size: 16px;
                    ">
                    Shop Now
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 40px; background-color: #fffaf0; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #888;">
                  © ${new Date().getFullYear()} Luminary Gifts Store. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("New arrivals email sent to", email);
    return true;
  } catch (error) {
    console.error("Failed to send new arrivals email to", email, ":", error.message);
    return false;
  }
};