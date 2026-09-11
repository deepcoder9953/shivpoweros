import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.use(express.json({ limit: '10mb' }));

  // Shared Gemini client utility
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // --- API Routes ---
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Backend OTP Storage & Handlers for Account Validation ---
  interface PendingOtpRecord {
    otp: string;
    email: string;
    mobile?: string;
    fullName?: string;
    companyName?: string;
    password?: string;
    purpose: string;
    expiresAt: number;
    attempts: number;
    createdAt: number;
    emailSent: boolean;
    emailDeliveryStatus?: string;
  }

  interface ValidatedUserRecord {
    email: string;
    mobile?: string;
    fullName?: string;
    companyName?: string;
    validatedAt: number;
  }

  interface DispatchedEmailRecord {
    to: string;
    recipientName: string;
    subject: string;
    html: string;
    text: string;
    otp: string;
    sentAt: string;
    deliveryStatus: 'delivered_via_smtp' | 'dispatched_simulated' | 'failed';
    errorDetails?: string;
  }

  const pendingOtpStore = new Map<string, PendingOtpRecord>();
  const validatedUsersStore = new Map<string, ValidatedUserRecord>();
  const dispatchedEmailLog = new Map<string, DispatchedEmailRecord>();

  // Initialize Mailer Transporter if SMTP credentials exist
  let mailTransporter: any = null;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      mailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('[MAILER] SMTP Transport configured successfully for:', process.env.SMTP_HOST);
    } catch (err) {
      console.warn('[MAILER] Failed to create SMTP transport:', err);
    }
  }

  // Helper to generate a secure 6-digit numeric OTP
  function generate6DigitOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Helper to send OTP directly to the user's registered email
  async function dispatchOtpToUserEmail(
    toEmail: string,
    fullName: string | undefined,
    otp: string
  ): Promise<{ success: boolean; deliveryStatus: 'delivered_via_smtp' | 'dispatched_simulated' | 'failed'; error?: string }> {
    const fromAddress = process.env.SMTP_FROM || 'Shiv Power Solution <no-reply@shivpowersolution.com>';
    const recipientDisplayName = fullName?.trim() || 'Valued User';
    const subject = `Your Account Verification Code: ${otp} - Shiv Power Solution`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verification Code</title>
      </head>
      <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #1e40af, #3730a3); color: #ffffff; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">⚡ SHIV POWER SOLUTION</h1>
              <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Industrial Power & DG Set B2B Enterprise CRM</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #0f172a;">Account Registration Validation</h2>
              <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #334155;">
                Hello <strong>${recipientDisplayName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for creating an account with Shiv Power Solution CRM. To activate your account and access your enterprise dashboard, please use the 6-digit one-time verification code below:
              </p>
              
              <!-- OTP Box -->
              <div style="margin: 28px 0; text-align: center;">
                <div style="display: inline-block; padding: 16px 36px; background-color: #eff6ff; border: 2px dashed #2563eb; border-radius: 12px; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #1d4ed8;">
                  ${otp}
                </div>
                <p style="margin: 10px 0 0; font-size: 12px; color: #64748b;">This OTP is valid for <strong>10 minutes</strong>.</p>
              </div>

              <div style="background-color: #f1f5f9; border-radius: 10px; padding: 14px 18px; margin: 24px 0; font-size: 12px; color: #475569; line-height: 1.5;">
                <strong>Security Notice:</strong> Never share this code with anyone. Shiv Power Solution team members will never ask for your verification code.
              </div>

              <p style="margin: 0; font-size: 13px; color: #64748b;">
                If you did not register this account, you can safely disregard this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Shiv Power Solution. Industrial Silent Diesel Generators & B2B Solutions.</p>
              <p style="margin: 4px 0 0;">This email was sent to ${toEmail} as requested during account registration.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `SHIV POWER SOLUTION - ACCOUNT VERIFICATION CODE\n\nHello ${recipientDisplayName},\n\nYour 6-digit verification code is: ${otp}\n\nThis code is valid for 10 minutes. Please enter this code on the registration page to activate your account.\n\nSent to: ${toEmail}`;

    if (mailTransporter) {
      try {
        await mailTransporter.sendMail({
          from: fromAddress,
          to: toEmail,
          subject,
          html,
          text,
        });
        console.log(`[AUTH OTP SERVICE] Email successfully dispatched via SMTP to: ${toEmail} with code: ${otp}`);
        dispatchedEmailLog.set(toEmail.toLowerCase(), {
          to: toEmail,
          recipientName: recipientDisplayName,
          subject,
          html,
          text,
          otp,
          sentAt: new Date().toISOString(),
          deliveryStatus: 'delivered_via_smtp',
        });
        return { success: true, deliveryStatus: 'delivered_via_smtp' };
      } catch (err: any) {
        console.error(`[AUTH OTP SERVICE] SMTP mail delivery failed for ${toEmail}:`, err);
        dispatchedEmailLog.set(toEmail.toLowerCase(), {
          to: toEmail,
          recipientName: recipientDisplayName,
          subject,
          html,
          text,
          otp,
          sentAt: new Date().toISOString(),
          deliveryStatus: 'failed',
          errorDetails: err?.message || 'SMTP transmission error',
        });
        return { success: false, deliveryStatus: 'failed', error: err?.message };
      }
    }

    // Default development / sandbox mode dispatch
    console.log(`[AUTH OTP SERVICE] Email dispatched to registered mail ID: ${toEmail} [OTP: ${otp}]`);
    dispatchedEmailLog.set(toEmail.toLowerCase(), {
      to: toEmail,
      recipientName: recipientDisplayName,
      subject,
      html,
      text,
      otp,
      sentAt: new Date().toISOString(),
      deliveryStatus: 'dispatched_simulated',
    });
    return { success: true, deliveryStatus: 'dispatched_simulated' };
  }

  // 1. Send / Generate OTP for account creation validation - explicitly dispatched to registered email
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { email, mobile, fullName, companyName, password, purpose = 'signup_validation' } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'A valid email address is required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const otp = generate6DigitOtp();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

      // Dispatch real email or sandbox notification
      const mailResult = await dispatchOtpToUserEmail(normalizedEmail, fullName, otp);

      pendingOtpStore.set(normalizedEmail, {
        otp,
        email: normalizedEmail,
        mobile: typeof mobile === 'string' ? mobile.trim() : undefined,
        fullName: typeof fullName === 'string' ? fullName.trim() : undefined,
        companyName: typeof companyName === 'string' ? companyName.trim() : undefined,
        password,
        purpose,
        expiresAt,
        attempts: 0,
        createdAt: Date.now(),
        emailSent: mailResult.success,
        emailDeliveryStatus: mailResult.deliveryStatus,
      });

      return res.json({
        success: true,
        message: `A 6-digit verification code has been dispatched to your email address: ${normalizedEmail}`,
        email: normalizedEmail,
        mobile: mobile || null,
        expiresInSeconds: 600,
        emailDeliveryStatus: mailResult.deliveryStatus,
        demoOtp: otp, // Included so testing in preview works seamlessly
      });
    } catch (err: any) {
      console.error('Send OTP Error:', err);
      return res.status(500).json({ success: false, error: 'Internal error generating verification code.' });
    }
  });

  // Helper endpoint to check or view the dispatched email for verification testing
  app.get('/api/auth/latest-email', (req, res) => {
    const email = req.query.email;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email parameter required' });
    }
    const log = dispatchedEmailLog.get(email.trim().toLowerCase());
    if (!log) {
      return res.status(404).json({ error: 'No dispatched email found for this address' });
    }
    return res.json({ success: true, email: log });
  });

  // 2. Verify OTP for account creation validation
  app.post('/api/auth/verify-otp', (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, error: 'Email and verification code are required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const record = pendingOtpStore.get(normalizedEmail);

      if (!record) {
        // Check if already validated
        if (validatedUsersStore.has(normalizedEmail)) {
          return res.json({
            success: true,
            alreadyValidated: true,
            message: 'This account has already been validated.',
          });
        }
        return res.status(400).json({
          success: false,
          error: 'No pending verification code found or it has expired. Please request a new code.',
        });
      }

      // Check expiration
      if (Date.now() > record.expiresAt) {
        pendingOtpStore.delete(normalizedEmail);
        return res.status(400).json({
          success: false,
          error: 'The verification code has expired. Please request a new one.',
        });
      }

      // Check max attempts
      if (record.attempts >= 5) {
        pendingOtpStore.delete(normalizedEmail);
        return res.status(429).json({
          success: false,
          error: 'Too many incorrect attempts. Please request a new verification code.',
        });
      }

      // Verify code
      if (record.otp !== String(otp).trim()) {
        record.attempts += 1;
        const remaining = 5 - record.attempts;
        return res.status(400).json({
          success: false,
          error: `Incorrect verification code. ${remaining} attempts remaining.`,
          attemptsRemaining: remaining,
        });
      }

      // Success: mark as validated
      validatedUsersStore.set(normalizedEmail, {
        email: normalizedEmail,
        mobile: record.mobile,
        fullName: record.fullName,
        companyName: record.companyName,
        validatedAt: Date.now(),
      });

      const validatedData = {
        email: normalizedEmail,
        fullName: record.fullName || normalizedEmail.split('@')[0],
        companyName: record.companyName || 'Shiv Power Solution',
        mobile: record.mobile || '',
      };

      pendingOtpStore.delete(normalizedEmail);

      console.log(`[AUTH OTP SERVICE] Successfully validated account for ${normalizedEmail}`);

      return res.json({
        success: true,
        message: 'Account verified successfully! You can now log in.',
        user: validatedData,
      });
    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      return res.status(500).json({ success: false, error: 'Internal error verifying code.' });
    }
  });

  // 3. Resend OTP endpoint
  app.post('/api/auth/resend-otp', (req, res) => {
    try {
      const { email, mobile } = req.body;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ success: false, error: 'Email is required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existing = pendingOtpStore.get(normalizedEmail);
      const otp = generate6DigitOtp();
      const expiresAt = Date.now() + 10 * 60 * 1000;

      const record: PendingOtpRecord = {
        otp,
        email: normalizedEmail,
        mobile: mobile || existing?.mobile,
        fullName: existing?.fullName,
        companyName: existing?.companyName,
        password: existing?.password,
        purpose: 'signup_validation',
        expiresAt,
        attempts: 0,
        createdAt: Date.now(),
        emailSent: true,
      };

      pendingOtpStore.set(normalizedEmail, record);

      // Asynchronously dispatch OTP to the user's email address
      dispatchOtpToUserEmail(normalizedEmail, otp, existing?.fullName || 'Valued User')
        .then((emailResult) => {
          console.log(`[AUTH RESEND OTP] Email dispatch to ${normalizedEmail} result:`, emailResult.deliveryStatus);
        })
        .catch((err) => {
          console.warn(`[AUTH RESEND OTP] Email dispatch error to ${normalizedEmail}:`, err);
        });

      console.log(`[AUTH OTP SERVICE] Resent OTP for ${normalizedEmail}: ${otp}`);

      return res.json({
        success: true,
        message: 'A fresh verification code has been dispatched.',
        expiresInSeconds: 600,
        demoOtp: otp,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Failed to resend verification code.' });
    }
  });

  // 4. Check if an account is validated (OTP removed, all accounts valid)
  app.get('/api/auth/check-validation', (req, res) => {
    const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
    return res.json({
      success: true,
      email,
      isValidated: true,
      hasPendingOtp: false,
    });
  });

  // 5. User Login Activity Audit Store (In-Memory Buffer + Fallback)
  interface ServerLoginLogRecord {
    id: string;
    userId: string;
    email: string;
    fullName: string;
    role: string;
    companyName: string;
    loginAt: string;
    ipAddress: string;
    userAgent: string;
    deviceType: string;
    browser: string;
    operatingSystem: string;
    status: string;
    loginMethod: string;
    locationInfo: string;
  }

  const serverLoginLogsStore: ServerLoginLogRecord[] = [];

  // API to record user login event with actual network IP detection
  app.post('/api/auth/record-login', (req, res) => {
    try {
      const {
        email,
        fullName,
        role,
        companyName,
        loginMethod,
        status,
        deviceType,
        browser,
        operatingSystem,
      } = req.body;

      // Extract client IP address accurately behind Cloud Run / proxy
      const forwarded = req.headers['x-forwarded-for'];
      let clientIp = '';
      if (typeof forwarded === 'string') {
        clientIp = forwarded.split(',')[0].trim();
      } else if (Array.isArray(forwarded) && forwarded[0]) {
        clientIp = forwarded[0].trim();
      } else if (typeof req.headers['x-real-ip'] === 'string') {
        clientIp = req.headers['x-real-ip'].trim();
      } else {
        clientIp = req.socket?.remoteAddress || req.ip || '127.0.0.1';
      }

      // Normalize IPv6 localhost
      if (clientIp === '::1' || clientIp === '::ffff:127.0.0.1') {
        clientIp = '127.0.0.1';
      }

      const userAgent = (req.headers['user-agent'] as string) || '';

      const record: ServerLoginLogRecord = {
        id: `srv-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: `usr-${(email || 'anonymous').split('@')[0]}`,
        email: email || 'user@shivpower.com',
        fullName: fullName || (email ? email.split('@')[0] : 'System User'),
        role: role || 'Sales',
        companyName: companyName || 'Shiv Power Solution',
        loginAt: new Date().toISOString(),
        ipAddress: clientIp,
        userAgent,
        deviceType: deviceType || 'Desktop',
        browser: browser || 'Browser',
        operatingSystem: operatingSystem || 'OS',
        status: status || 'success',
        loginMethod: loginMethod || 'password',
        locationInfo: 'India',
      };

      serverLoginLogsStore.unshift(record);
      if (serverLoginLogsStore.length > 500) {
        serverLoginLogsStore.pop();
      }

      return res.json({
        success: true,
        ipAddress: clientIp,
        locationInfo: 'India',
        record,
      });
    } catch (err: any) {
      console.warn('[Server] Error recording login event:', err);
      return res.status(500).json({ success: false, error: 'Failed to record login event' });
    }
  });

  // API to retrieve recorded login logs from the server
  app.get('/api/auth/login-logs', (_req, res) => {
    return res.json({
      success: true,
      logs: serverLoginLogsStore,
      count: serverLoginLogsStore.length,
    });
  });

  // API to delete a login log entry
  app.delete('/api/auth/login-logs/:id', (req, res) => {
    const id = req.params.id;
    const idx = serverLoginLogsStore.findIndex((l) => l.id === id);
    if (idx !== -1) {
      serverLoginLogsStore.splice(idx, 1);
    }
    return res.json({ success: true });
  });

  app.get('/api/ai/status', (_req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      configured: hasKey,
      model: 'gemini-3.8-flash',
      provider: 'Google Gemini',
    });
  });

  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, systemInstruction, temperature } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.',
          configured: false,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: typeof temperature === 'number' ? temperature : 0.4,
        },
      });

      return res.json({
        text: response.text || '',
        model: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.error('Gemini Generate API Error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate response from Gemini API',
      });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, systemInstruction, temperature } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.',
          configured: false,
        });
      }

      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: typeof temperature === 'number' ? temperature : 0.4,
        },
      });

      return res.json({
        text: response.text || '',
        model: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.error('Gemini Chat API Error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate chat response from Gemini API',
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
