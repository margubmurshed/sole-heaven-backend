/* eslint-disable no-console */
import { createTransport } from "nodemailer";
import { envVariables } from "../app/config/env";
import path from "path";
import ejs from "ejs";
import AppError from "../app/errorHelpers/AppError";

const transporter = createTransport({
    secure: true,
    auth: {
        user: envVariables.SMTP.SMTP_USER,
        pass: envVariables.SMTP.SMTP_PASS
    },
    port: Number(envVariables.SMTP.SMTP_PORT),
    host: envVariables.SMTP.SMTP_HOST,
})

interface sendEmailProps {
    to: string;
    subject: string;
    templateName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    templateData: Record<string, any>
    attachments?: {
        filename: string;
        content: Buffer | string,
        contentType: string
    }[]
}

export const sendEmail = async ({ to, subject, attachments, templateName, templateData }: sendEmailProps) => {
    try {
        const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, templateData)
        const info = await transporter.sendMail({
            from: envVariables.SMTP.SMTP_FROM,
            to,
            subject,
            attachments,
            html
        })
        console.log(`\u2709\uFE0F Email sent to ${to} : ${info.messageId}`);
    } catch (error) {
        console.log(error);
        throw new AppError("Email sending error", 500)
    }
}