// EmailSender.ts - Gửi OTP qua email
// ⚠️ QUAN TRỌNG: Code này CHỈ để tham khảo
// React Native KHÔNG THỂ gửi email trực tiếp từ client vì lý do bảo mật
// Bạn CẦN tạo backend API hoặc Firebase Cloud Function để gửi email

import axios from 'axios';
import { NativeModules, Platform } from 'react-native';

const SENDER_EMAIL = 'phongtt.23it@vku.udn.vn';
const APP_PASSWORD = 'olrq gqil nyxe mbci';

// TODO: Thay YOUR_BACKEND_API bằng URL backend thực tế của bạn
// Ví dụ: 'https://your-backend.com/api' hoặc Firebase Cloud Function URL
const BACKEND_API = 'YOUR_BACKEND_API';

// Chế độ development - mock OTP nếu backend không khả dụng
const DEVELOPMENT_MODE = false;

export class EmailSender {
  /**
   * Tạo mã OTP ngẫu nhiên 6 chữ số
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Gửi OTP qua email
   * ⚠️ YÊU CẦU: Phải có backend API để xử lý
   * 
   * @param recipientEmail Email người nhận
   * @param otp Mã OTP
   * @param onSuccess Callback khi thành công
   * @param onFailure Callback khi thất bại
   */
  static async sendOTP(
    recipientEmail: string,
    otp: string,
    onSuccess: () => void,
    onFailure: (error: Error) => void
  ): Promise<void> {
    console.log('[EmailSender] Attempting to send OTP...');
    console.log('[EmailSender] Recipient:', recipientEmail);
    console.log('[EmailSender] OTP:', otp);
    console.log('[EmailSender] Backend URL:', BACKEND_API);
    console.log('[EmailSender] Development Mode:', DEVELOPMENT_MODE);

    // Try native Android sender first (if available)
    try {
      if (Platform.OS === 'android' && (NativeModules as any).EmailSender && (NativeModules as any).EmailSender.sendOTP) {
        console.log('[EmailSender] Native Android EmailSender detected, calling native module');
        try {
          await (NativeModules as any).EmailSender.sendOTP(recipientEmail, otp);
          console.log('[EmailSender] ✅ Native Android OTP sent successfully');
          onSuccess();
          return;
        } catch (nativeErr) {
          console.warn('[EmailSender] Native Android sendOTP failed, falling back to JS/back-end/mock:', nativeErr);
          // fallthrough to JS/backend/mock
        }
      }
    } catch (err) {
      console.warn('[EmailSender] Error while attempting native sendOTP', err);
    }

    // If not using native or native failed, continue with existing JS/back-end logic
    try {
      // Nếu không có backend API hoặc ở chế độ development
      if (BACKEND_API === 'YOUR_BACKEND_API' || DEVELOPMENT_MODE) {
        console.log('[EmailSender] ⚠️ Backend API not configured or in development mode');
        console.log('[EmailSender] Using mock OTP - In production, setup real backend API');
        
        // Mock gửi OTP thành công (delay 1 giây để giả lập network request)
        setTimeout(() => {
          console.log('[EmailSender] ✅ Mock OTP sent successfully to:', recipientEmail);
          console.log('[EmailSender] OTP Code for testing:', otp);
          onSuccess();
        }, 1000);
        return;
      }

      // Gửi thực tế qua backend API
      console.log('[EmailSender] Sending OTP via backend API...');
      const response = await axios.post(`${BACKEND_API}/send-otp`, {
        recipientEmail: recipientEmail,
        otp: otp,
        senderEmail: SENDER_EMAIL
      }, {
        timeout: 10000 // 10 giây timeout
      });

      console.log('[EmailSender] Backend response:', response.data);

      if (response.data.success) {
        console.log('[EmailSender] ✅ OTP sent successfully');
        onSuccess();
      } else {
        console.error('[EmailSender] ❌ Backend returned error:', response.data);
        onFailure(new Error(response.data.error || 'Failed to send OTP'));
      }
    } catch (error) {
      console.error('[EmailSender] ❌ Error occurred:', error);
      if (error instanceof Error) {
        console.error('[EmailSender] Error message:', error.message);
        console.error('[EmailSender] Error stack:', error.stack);
        onFailure(error);
      } else {
        onFailure(new Error('Unknown error occurred'));
      }
    }
  }
}

// ========== MẪU BACKEND API (Node.js/Express) ==========
/*
const nodemailer = require('nodemailer');

app.post('/send-otp', async (req, res) => {
  const { recipientEmail, otp, senderEmail } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderEmail,
      pass: 'olrq gqil nyxe mbci' // Sử dụng App Password của Gmail
    }
  });

  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 24px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #4CAF50;">🎉 Chào mừng bạn đến với Nihongo App!</h2>
          <p style="color: #333;">Bạn vừa yêu cầu đăng nhập với email <strong>${recipientEmail}</strong>.</p>
          <p style="color: #333;">Dưới đây là mã OTP của bạn:</p>

          <div style="margin: 20px 0; text-align: center;">
            <span style="font-size: 28px; font-weight: bold; color: #ffffff; background-color: #4CAF50; padding: 12px 24px; border-radius: 8px; display: inline-block; letter-spacing: 2px;">${otp}</span>
          </div>

          <p style="color: #333;">Mã này sẽ hết hạn sau <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          <p style="color: #666; font-size: 14px;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này hoặc đổi mật khẩu nếu nghi ngờ có truy cập trái phép.</p>

          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">

          <p style="color: #888; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Nihongo App. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Nihongo App" <${senderEmail}>`,
      to: recipientEmail,
      subject: '🔒 Mã OTP đăng nhập - Nihongo App',
      html: htmlContent
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
*/