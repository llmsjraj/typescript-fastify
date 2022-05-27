import fastify, { FastifyInstance } from 'fastify';
import swagger from 'fastify-swagger';
import { bootstrap } from 'fastify-decorators';
import { resolve, dirname } from 'path';
import { buildJsonSchemas, withRefResolver } from 'fastify-zod';
import { UserItem } from './models/user';
import { CustomerItem } from './models/customer';
import { ApiResponseItem } from './models/api-response-item';
import { z } from 'zod';
import { Constants } from './config/constants';
import { fastifyAwilixPlugin, diContainer } from 'fastify-awilix';
import { asClass, Lifetime } from 'awilix';
import { AccountService } from './services/account.service';
import { ErrorService } from './services/error.service';
import { ConfigService } from './services/config.service';
import { EmailService } from './services/email.service';
import { AccountActivationItem } from './models/account-activation';
import { ResendEmailActivationItem } from './models/resend-email-activation';

export const createServer = (): FastifyInstance => {
  const server: FastifyInstance = fastify();

  const { schemas, $ref } = buildJsonSchemas({
    UserItem,
    CustomerItem,
    ApiResponseItem: ApiResponseItem,
    AccountActivationItem,
    ResendEmailActivationItem
  });

  schemas.forEach((schema) => {
    server.addSchema(schema);
  });

  server.register(
    swagger,
    withRefResolver({
      routePrefix: Constants.Swagger.Route,
      exposeRoute: true,
      staticCSP: true,
      openapi: {
        info: {
          title: Constants.Swagger.Title,
          description: Constants.Swagger.Description,
          version: Constants.Swagger.Version,
        },
      },
    }),
  );

  server.register(bootstrap, {
    // Specify directory with our controllers
    directory: resolve(__dirname, `controllers`),

    // Specify mask to match only our controllers
    mask: /\.controller\./,
  });

  server.register(fastifyAwilixPlugin, { disposeOnClose: true, disposeOnResponse: true });
  diContainer.register({
    AccountService: asClass(AccountService, {
      lifetime: Lifetime.SINGLETON,
    }),
    ErrorService: asClass(ErrorService, {
      lifetime: Lifetime.SINGLETON,
    }),
    ConfigService: asClass(ConfigService, {
      lifetime: Lifetime.SINGLETON,
    }),
    EmailService: asClass(EmailService, {
      lifetime: Lifetime.SINGLETON,
    }),
  });

  return server;
};
