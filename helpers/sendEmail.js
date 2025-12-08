import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

const emailService = process.env.EMAIL_SERVICE || 'nodemailer';

let transporter = null;

if (emailService === 'nodemailer') {
    const config = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    };
    transporter = nodemailer.createTransport(config);
} else if (emailService === 'sendgrid') {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendVerificationEmail = async (email, verificationToken) => {
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${verificationToken}`;

    const emailContent = {
        subject: 'Email Verification',
        html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>If you did not register for this account, please ignore this email.</p>
    `,
    };

    try {
        if (emailService === 'nodemailer') {
            const emailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: emailContent.subject,
                html: emailContent.html,
            };

            const info = await transporter.sendMail(emailOptions);
            console.log('Verification email sent via Nodemailer:', info.messageId);
            return info;
        } else if (emailService === 'sendgrid') {
            const msg = {
                to: email,
                from: process.env.EMAIL,
                subject: emailContent.subject,
                html: emailContent.html,
            };

            const info = await sgMail.send(msg);
            console.log('Verification email sent via SendGrid');
            return info;
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};
