import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendResetPasswordEmail(email: string, token: string, name: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/admin/reset-password?token=${token}`

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset Password - Admin Desa Sukobubuk',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: #15803d; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Desa Sukobubuk</h1>
          <p style="color: #bbf7d0; margin: 4px 0 0; font-size: 13px;">Admin Panel</p>
        </div>
        <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827; font-size: 18px; margin: 0 0 8px;">Halo, ${name}!</h2>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Kami menerima permintaan untuk mereset password akun admin Anda. 
            Klik tombol di bawah untuk membuat password baru.
          </p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: #15803d; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
            Reset Password
          </a>
          <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0; line-height: 1.6;">
            Link ini hanya berlaku selama <strong>1 jam</strong>. 
            Jika Anda tidak meminta reset password, abaikan email ini.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            Jika tombol tidak berfungsi, salin link berikut ke browser:<br/>
            <a href="${resetUrl}" style="color: #15803d; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
      </div>
    `,
  })
}
