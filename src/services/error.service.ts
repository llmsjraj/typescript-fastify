import { z, ZodError, ZodIssue } from 'zod';
import data from '../config/app-settings.json';
import { Constants } from '../config/constants';
import _ from 'lodash';
import { ErrorArgs } from '../models/error-args';

export class ErrorService {
  getMessages(errorArgs: ErrorArgs): string[] {
    let messages: string[] = [];
    if (errorArgs.error instanceof ZodError) {
      if (!errorArgs.locale) {
        errorArgs.locale = Constants.DefaultLocale;
      }

      const errors = (errorArgs.error.errors as ZodIssue[]).map((x) => x.message);
      _.forIn(_.get(data, Constants.DefaultLocale), (value, key) => {
        if (errors.includes(key)) {
          messages.push(value);
        }
      });
    } else if (errorArgs.errorKey) {
      _.forIn(_.get(data, Constants.DefaultLocale), (value, key) => {
        if (key == errorArgs.errorKey) {
          messages.push(value);
        }
      });
    }
    return messages;
  }

  createError(errorMessage: string[]): ZodError {
    let error = new z.ZodError([]);
    errorMessage.forEach((x) => {
      error.addIssue({
        message: x,
      } as ZodIssue);
    });
    return error;
  }
}
