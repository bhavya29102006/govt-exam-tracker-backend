import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendDeadlineReminderEmail = async (toEmail, userFullname, examname, applicationlastdate) => {
    try {
        await transporter.sendMail({
            from: `"Govt Exam Tracker" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `Reminder: ${examname} application closes soon`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hi ${userFullname},</h2>
                    <p>This is a reminder that the application deadline for <strong>${examname}</strong> is approaching.</p>
                    <p><strong>Last date to apply:</strong> ${new Date(applicationlastdate).toDateString()}</p>
                    <p>Don't miss it — log in to your account to view full details.</p>
                    <br/>
                    <p style="color: #888; font-size: 12px;">You're receiving this because you're tracking this exam on Govt Exam Tracker.</p>
                </div>
            `
        });
        console.log(`Reminder email sent to ${toEmail} for ${examname}`);
    } catch (error) {
        console.log("Error sending email:", error.message);
    }
};

export { sendDeadlineReminderEmail };