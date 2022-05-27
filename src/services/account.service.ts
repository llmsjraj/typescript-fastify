import { PrismaClient, Prisma, Customer } from '@prisma/client';
import { CustomerItem } from '../models/customer';
import { UserItem } from '../models/user';
import { IApiResponse } from '../models/api-response';
import { z } from 'zod';
import _ from 'lodash';
import { Constants } from '../config/constants';
import { diContainer } from 'fastify-awilix';
import { ErrorService } from './error.service';
import { ErrorArgs } from '../models/error-args';
import { v4 as uuidv4 } from 'uuid';
import { CustomerStatus } from '../models/customer-status';
import { AccountActivationItem } from '../models/account-activation';
import { ResendEmailActivationItem } from '../models/resend-email-activation';
import { UserStatus } from '../models/user-status';
import * as generator from 'generate-password';
import * as bcrypt from 'bcrypt';

type CustomerModel = z.infer<typeof CustomerItem>;
type UserModel = z.infer<typeof UserItem>;
type AccountActivationModel = z.infer<typeof AccountActivationItem>;
type ResendEmailActivationModel = z.infer<typeof ResendEmailActivationItem>;
export class AccountService {
  private _prisma!: PrismaClient;
  private _errorService!: ErrorService;

  constructor() {
    this._prisma = new PrismaClient();
    this._errorService = diContainer.resolve<ErrorService>(Constants.Type.ErrorService);
  }

  async createAccount(customerModel: CustomerModel): Promise<IApiResponse<CustomerModel>> {
    const response = {
      status: false,
      messages: [],
      data: null,
    } as IApiResponse<CustomerModel>;

    try {
      CustomerItem.parse(customerModel);
      if (await this.customerExistByEmail(customerModel.email)) {
        const error = this._errorService.createError([Constants.ErrorMessages.EmailAlreadyExist]);
        throw error;
      }

      if (await this.customerExistByMobile(customerModel.mobile)) {
        const error = this._errorService.createError([Constants.ErrorMessages.MobileAlreadyExist]);
        throw error;
      }

      if (customerModel.country && (await this.isValidCountry(customerModel.country))) {
        const error = this._errorService.createError([Constants.ErrorMessages.InvalidCountry]);
        throw error;
      }

      if (
        customerModel.city &&
        (await this.isValidCity(customerModel.country!, customerModel.city))
      ) {
        const error = this._errorService.createError([Constants.ErrorMessages.InvalidCity]);
        throw error;
      }

      if (await this.customerExistByMobile(customerModel.mobile)) {
        const error = this._errorService.createError([Constants.ErrorMessages.MobileAlreadyExist]);
        throw error;
      }

      customerModel.emailActivationToken = uuidv4();
      customerModel.status = CustomerStatus.Prospect;
      let customer: Prisma.CustomerCreateInput;
      let rawCustomer = {};
      _.assign(rawCustomer, customerModel);
      customer = rawCustomer as Prisma.CustomerCreateInput;
      const createCustomer = await this._prisma.customer.create({
        data: customer,
      });
      response.messages = [createCustomer.emailActivationToken!];
      createCustomer.emailActivationToken = null;
      response.status = true;
      response.data = createCustomer as CustomerModel;
      return response;
    } catch (error) {
      response.messages = this._errorService.getMessages({ error: error } as ErrorArgs);
      response.data = null;
      return response;
    }
  }

  async activateAccount(
    accountActivationModel: AccountActivationModel,
  ): Promise<IApiResponse<UserModel>> {
    const response = {
      status: false,
      messages: [],
      data: null,
    } as IApiResponse<UserModel>;

    try {
      AccountActivationItem.parse(accountActivationModel);
      let [exist, dbCustomer] = await this.isEmailActivationTokenExist(
        accountActivationModel.emailActivationToken,
      );

      if (!dbCustomer) {
        const error = this._errorService.createError([
          Constants.ErrorMessages.EmailActivationTokenNotFound,
        ]);
        throw error;
      }

      if (await this.userExistByUsername(dbCustomer.email)) {
        const error = this._errorService.createError([
          Constants.ErrorMessages.AccountAlreadyActivated,
        ]);
        throw error;
      }

      let password = generator.generate({
        length: Constants.PasswordLength,
        numbers: true,
      });

      const salt = await bcrypt.genSalt(Constants.SaltRound);
      const hashPassword = await bcrypt.hash(password, salt);

      let user: Prisma.UserCreateInput = {
        status: UserStatus.Active,
        activatedOn: new Date(),
        username: dbCustomer.email,
        password: hashPassword,
        customer: {
          connect: {
            id: dbCustomer.id,
          },
        },
      };

      const createUser = await this._prisma.user.create({
        data: user,
      });
      response.status = true;
      response.data = createUser as UserModel;
      response.messages = [password];
      return response;
    } catch (error) {
      response.messages = this._errorService.getMessages({ error: error } as ErrorArgs);
      response.data = null;
      return response;
    }
  }

  async resendEmailActivationToken(
    resendEmailActivationModel: ResendEmailActivationModel,
  ): Promise<IApiResponse<object>> {
    const response: IApiResponse<object> = {
      status: false,
      messages: [],
      data: null,
    };

    try {
      ResendEmailActivationItem.parse(resendEmailActivationModel);
      let customerExist = await this.customerExistByEmail(resendEmailActivationModel.email);

      if (!customerExist) {
        const error = this._errorService.createError([
          Constants.ErrorMessages.AccountNotFound,
        ]);
        throw error;
      }

      if (await this.userExistByUsername(resendEmailActivationModel.email)) {
        const error = this._errorService.createError([
          Constants.ErrorMessages.AccountAlreadyActivated,
        ]);
        throw error;
      }

      const updateCustomer = await this._prisma.customer.update({
        where: {
          email: resendEmailActivationModel.email
        },
        data: {
          emailActivationToken: uuidv4()
        }
      });

      response.status = true;
      response.messages = [updateCustomer.emailActivationToken!]
      return response;
    } catch (error) {
      response.messages = this._errorService.getMessages({ error: error } as ErrorArgs);
      response.data = null;
      return response;
    }
  }

  async customerExistByEmail(email: string): Promise<boolean> {
    try {
      const customer = await this._prisma.customer.findUnique({
        where: {
          email: email,
        },
      });
      if (customer) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async customerExistByMobile(mobile: number): Promise<boolean> {
    try {
      const customer = await this._prisma.customer.findUnique({
        where: {
          mobile: mobile,
        },
      });
      if (customer) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async isValidCountry(countryId: number): Promise<boolean> {
    try {
      const country = await this._prisma.country.findFirst({
        where: {
          id: countryId,
        },
      });
      if (country) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async isValidCity(countryId: number, cityId: number): Promise<boolean> {
    try {
      const city = await this._prisma.city.findFirst({
        where: {
          countryId: countryId,
          id: cityId,
        },
      });
      if (city) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async userExistByUsername(userName: string): Promise<boolean> {
    try {
      const user = await this._prisma.user.findFirst({
        where: {
          username: userName,
        },
      });
      if (user) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async isEmailActivationTokenExist(
    emailActivationToken: string,
  ): Promise<[boolean, Customer | null]> {
    try {
      const user = await this._prisma.customer.findFirst({
        where: {
          emailActivationToken: emailActivationToken,
        },
      });
      if (user) {
        return [true, user];
      } else {
        return [false, null];
      }
    } catch (error) {
      return [false, null];
    }
  }
}
