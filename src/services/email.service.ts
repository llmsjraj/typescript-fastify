import { diContainer } from 'fastify-awilix';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { Constants } from '../config/constants';
import { ConfigService } from './config.service';
import { z } from 'zod';
import { ConfigItem } from '../models/config';
import { EmailMessage } from '../models/email-message';
import { EmailTemplate, EmailTemplateType, PrismaClient } from '@prisma/client';

type ConfigType = z.infer<typeof ConfigItem>;
export class EmailService {
  private _configType!: ConfigType;
  private _prisma!: PrismaClient;

  constructor() {
    this._configType = diContainer
      .resolve<ConfigService>(Constants.Type.ConfigService)
      .loadConfig();
    this._prisma = new PrismaClient();
  }

  async sendEmail(emailMessage: EmailMessage): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this._configType.SMTP_USER,
          pass: this._configType.SMTP_PASSWORD,
        },
        logger: true,
      });

      const info = await transporter.sendMail({
        from: emailMessage.from,
        to: emailMessage.to,
        subject: emailMessage.subject,
        text: emailMessage.text,
        html: emailMessage.html,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getEmailTemplate(templateType: EmailTemplateType): Promise<EmailTemplate | null> {
    let data: EmailTemplate | null;
    try {
      data = await this._prisma.emailTemplate.findFirst({
        where: {
          emailTemplateType: templateType
        }
      });
      return data;
    } catch (error) {
      return null;
    }
  }
}
