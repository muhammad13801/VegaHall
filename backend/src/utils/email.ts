import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationCode = async (
  email: string,
  first_name: string,
  last_name: string,
  code: string,
) => {
  await transporter.sendMail({
    from: `"VegaHall" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "رمز التحقق لحسابك في VegaHall",
    html: `
    <!DOCTYPE html>
    <html>
      <body dir="rtl" style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f9;">
        
        <div style="max-width:600px; margin:40px auto; background:#ffffff; padding:30px; border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,0.05); text-align:center;">
          
          <h2 style="color:#2c3e50; margin-top:0;">
            مرحباً ${first_name} ${last_name}
          </h2>
          
          <p style="font-size:16px; color:#555;">
            شكراً لتسجيلك في <strong>VegaHall</strong>.
          </p>

          <p style="font-size:16px; color:#555;">
            استخدم رمز التحقق التالي لإكمال عملية التسجيل:
          </p>

          <div style="margin:30px 0;">
            <span style="
              display:inline-block;
              padding:15px 30px;
              font-size:24px;
              font-weight:bold;
              letter-spacing:5px;
              background-color:#2c3e50;
              color:#ffffff;
              border-radius:8px;
            ">
              ${code}
            </span>
          </div>

          <p style="font-size:14px; color:#777;">
            هذا الرمز صالح لمدة 10 دقائق.
          </p>

          <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

          <p style="font-size:12px; color:#aaa;">
            إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان.
          </p>

          <p style="font-size:12px; color:#aaa; margin-bottom:0;">
            © ${new Date().getFullYear()} VegaHall. جميع الحقوق محفوظة.
          </p>

        </div>

      </body>
    </html>
    `,
  });
};
