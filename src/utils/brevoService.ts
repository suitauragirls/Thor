// Brevo Direct REST API Integration Service for Suit Bliss Aura OTP Emails

export interface SendOtpParams {
  email: string;
  code: string;
  name?: string;
}

const DEFAULT_BREVO_API_KEY = '';

export const getStoredBrevoKey = (): string => {
  return (
    import.meta.env.VITE_BREVO_API_KEY ||
    localStorage.getItem('SUITBLISS_BREVO_API_KEY') ||
    DEFAULT_BREVO_API_KEY
  );
};

export const setStoredBrevoKey = (key: string): void => {
  if (key && key.trim()) {
    localStorage.setItem('SUITBLISS_BREVO_API_KEY', key.trim());
  }
};

export const sendBrevoOtpEmail = async ({
  email,
  code,
  name = 'Valued Customer',
}: SendOtpParams): Promise<{ success: boolean; message: string }> => {
  const apiKey = getStoredBrevoKey();

  if (!apiKey) {
    console.warn('Brevo API key not configured yet.');
    return {
      success: false,
      message: 'Brevo API key missing. Please configure your Brevo Key.',
    };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Suit Bliss Aura',
          email: 'starkhell69@gmail.com',
        },
        to: [
          {
            email: email.trim().toLowerCase(),
            name: name,
          },
        ],
        subject: `${code} is your Suit Bliss Aura Verification Code`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF5EB; margin: 0; padding: 20px; }
                .container { max-width: 520px; margin: 0 auto; background-color: #3D0F1F; border-radius: 16px; padding: 32px; border: 1px solid #B8935A; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                .brand-title { color: #DFBE65; font-size: 26px; font-weight: bold; text-align: center; margin: 0 0 4px 0; letter-spacing: 2px; text-transform: uppercase; }
                .brand-sub { color: #FAF5EB; font-size: 12px; text-align: center; margin: 0 0 24px 0; letter-spacing: 3px; text-transform: uppercase; opacity: 0.8; }
                .divider { height: 1px; background: linear-gradient(90deg, transparent, #B8935A, transparent); margin: 20px 0; }
                .content-box { background-color: #FAF5EB; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #B8935A; margin: 20px 0; }
                .otp-title { color: #3D0F1F; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
                .otp-code { font-family: monospace; font-size: 36px; font-weight: bold; color: #3D0F1F; letter-spacing: 8px; background-color: #ffffff; border: 2px dashed #B8935A; padding: 12px 20px; border-radius: 8px; display: inline-block; }
                .instructions { color: #FAF5EB; font-size: 13px; text-align: center; line-height: 1.6; margin-top: 16px; opacity: 0.9; }
                .footer { color: #B8935A; font-size: 11px; text-align: center; margin-top: 24px; opacity: 0.7; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="brand-title">Suit Bliss Aura</div>
                <div class="brand-sub">Jaipur Royal Couture</div>
                <div class="divider"></div>
                <p style="color: #FAF5EB; text-align: center; font-size: 15px;">Namaste ${name},</p>
                <div class="content-box">
                  <div class="otp-title">Your Verification OTP Code</div>
                  <div class="otp-code">${code}</div>
                </div>
                <p class="instructions">Enter this 6-digit code on the website to sign in and complete your order. This code is valid for 10 minutes.</p>
                <div class="divider"></div>
                <div class="footer">&copy; Suit Bliss Aura • Jaipur, Rajasthan, India</div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Brevo Email sent successfully:', data);
      return { success: true, message: 'OTP Email sent successfully via Brevo!' };
    } else {
      const errData = await response.json().catch(() => ({}));
      console.error('Brevo API Error:', response.status, errData);
      return {
        success: false,
        message: errData.message || `Brevo Error (${response.status})`,
      };
    }
  } catch (err: any) {
    console.error('Failed to call Brevo API:', err);
    return {
      success: false,
      message: err.message || 'Network error connecting to Brevo.',
    };
  }
};
