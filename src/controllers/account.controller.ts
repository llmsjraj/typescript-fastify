import { FastifyReply, FastifyRequest, FastifySchema } from 'fastify';
import { Controller, POST, ErrorHandler, GET } from 'fastify-decorators';
import { CustomerItem } from '../models/customer';
import { Constants } from '../config/constants';
import { AccountService } from '../services/account.service';
import { ErrorService } from '../services/error.service';
import { z, ZodError } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import { diContainer } from 'fastify-awilix';
import { IApiResponse } from '../models/api-response';
import { ErrorArgs } from '../models/error-args';
import { ApiResponseItem } from '../models/api-response-item';
import { AccountActivationItem } from '../models/account-activation';
import { EmailService } from '../services/email.service';
import { EmailMessage } from '../models/email-message';
import { EmailTemplateType } from '@prisma/client';
import * as Handlebars from 'handlebars';
import { ResendEmailActivationItem } from '../models/resend-email-activation';

type CustomerModel = z.infer<typeof CustomerItem>;
type AccountActivationModel = z.infer<typeof AccountActivationItem>;
type ResendEmailActivationModel = z.infer<typeof ResendEmailActivationItem>;

@Controller(Constants.Routes.Account)
export default class AccountController {
  constructor(
    private _accountService: AccountService,
    private _errorService: ErrorService,
    private _emailService: EmailService,
  ) {
    this._accountService = diContainer.resolve<AccountService>(Constants.Type.AccountService);
    this._errorService = diContainer.resolve<ErrorService>(Constants.Type.ErrorService);
    this._emailService = diContainer.resolve<EmailService>(Constants.Type.EmailService);
  }

  @POST({
    url: Constants.Routes.AccountRegistration,
    options: {
      schema: {
        tags: [Constants.Registration],
        body: zodToJsonSchema(CustomerItem),
        response: {
          400: zodToJsonSchema(ApiResponseItem),
          401: zodToJsonSchema(ApiResponseItem),
          500: zodToJsonSchema(ApiResponseItem),
        },
      } as FastifySchema,
      attachValidation: true,
    },
  })
  async RegisterHandler(request: FastifyRequest<{ Body: CustomerModel }>, reply: FastifyReply) {
    try {
      const response = await this._accountService.createAccount(request.body);
      if (response.status) {
        const emailTemplate = await this._emailService.getEmailTemplate(EmailTemplateType.Registration);

        if (emailTemplate) {
          const template = Handlebars.compile(emailTemplate.html);
          const tempObj = {
            activationCode: response.messages[0]
          };
          let html = template(tempObj);
          const emailMessage: EmailMessage = {
            from: emailTemplate.from,
            to: request.body.email,
            subject: emailTemplate.subject,
            text: emailTemplate.text!,
            html: html
          };

          const success = await this._emailService.sendEmail(emailMessage);
        }

        response.messages = [];
        return reply.send(response);
      } else {
        return reply.status(400).send(response);
      }
    } catch (error) {
      let response: IApiResponse<object> = {
        status: false,
        messages: this._errorService.getMessages({ errorKey: Constants.ErrorMessages.ErrorKey } as ErrorArgs),
        data: {}
      }
      return reply.status(400).send(response);
    }
  }

  @POST({
    url: Constants.Routes.AccountActivation,
    options: {
      schema: {
        tags: [Constants.Registration],
        body: zodToJsonSchema(AccountActivationItem),
        response: {
          400: zodToJsonSchema(ApiResponseItem),
          401: zodToJsonSchema(ApiResponseItem),
          500: zodToJsonSchema(ApiResponseItem),
        },
      } as FastifySchema,
      attachValidation: true,
    },
  })
  async ActivateHandler(
    request: FastifyRequest<{ Body: AccountActivationModel }>,
    reply: FastifyReply,
  ) {
    try {
      const response = await this._accountService.activateAccount(request.body);
      if (response.status) {
        const emailTemplate = await this._emailService.getEmailTemplate(EmailTemplateType.Activation);

        if (emailTemplate) {
          const template = Handlebars.compile(emailTemplate.html);
          const tempObj = {
            userName: response.data?.username,
            password: response.messages[0]
          };
          let html = template(tempObj);
          const emailMessage: EmailMessage = {
            from: emailTemplate.from,
            to: response.data?.username!,
            subject: emailTemplate.subject,
            text: emailTemplate.text!,
            html: html
          };
          const success = await this._emailService.sendEmail(emailMessage);
        }

        response.data!.password = undefined;
        response.messages = [];
        return reply.send(response);
      } else {
        return reply.status(400).send(response);
      }
    } catch (error) {
      return reply.status(400).send({
        status: false,
        messages: this._errorService.getMessages({
          errorKey: Constants.ErrorMessages.ErrorKey,
        } as ErrorArgs),
      } as IApiResponse<object>);
    }
  }

  @POST({
    url: Constants.Routes.ResendEmailActivation,
    options: {
      schema: {
        tags: [Constants.Registration],
        body: zodToJsonSchema(ResendEmailActivationItem),
        response: {
          400: zodToJsonSchema(ApiResponseItem),
          401: zodToJsonSchema(ApiResponseItem),
          500: zodToJsonSchema(ApiResponseItem),
        },
      } as FastifySchema,
      attachValidation: true,
    },
  })
  async ResendEmailActivationHandler(
    request: FastifyRequest<{ Body: ResendEmailActivationModel }>,
    reply: FastifyReply,
  ) {
    try {
      const response = await this._accountService.resendEmailActivationToken(request.body);
      if (response.status) {
        const emailTemplate = await this._emailService.getEmailTemplate(EmailTemplateType.Registration);

        if (emailTemplate) {
          const template = Handlebars.compile(emailTemplate.html);
          const tempObj = {
            activationCode: response.messages[0]
          };
          let html = template(tempObj);
          const emailMessage: EmailMessage = {
            from: emailTemplate.from,
            to: request.body.email,
            subject: emailTemplate.subject,
            text: emailTemplate.text!,
            html: html
          };

          const success = await this._emailService.sendEmail(emailMessage);
        }

        response.messages = [];
        return reply.send(response);
      } else {
        return reply.status(400).send(response);
      }
    } catch (error) {
      return reply.status(400).send({
        status: false,
        messages: this._errorService.getMessages({
          errorKey: Constants.ErrorMessages.ErrorKey,
        } as ErrorArgs),
      } as IApiResponse<object>);
    }
  }
}
