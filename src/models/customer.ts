import { z } from 'zod';
import { CustomerStatus } from './customer-status';

export const CustomerItem = z.object({
  id: z
    .string({
      invalid_type_error: 'INVALID_ID',
    })
    .uuid({
      message: 'INVALID_ID',
    })
    .nullish(),
  firstName: z
    .string({
      required_error: 'FIRSTNAME_REQUIRED',
      invalid_type_error: 'INVALID_FIRSTNAME',
    })
    .nonempty({
      message: 'FIRSTNAME_REQUIRED',
    }),
  lastName: z
    .string({
      required_error: 'LASTNAME_REQUIRED',
      invalid_type_error: 'INVALID_LASTNAME',
    })
    .nonempty({
      message: 'LASTNAME_REQUIRED',
    }),
  email: z
    .string({
      required_error: 'EMAIL_REQUIRED',
    })
    .nonempty({
      message: 'EMAIL_REQUIRED',
    })
    .email({
      message: 'INVALID_EMAIL',
    }),
  mobile: z
    .number({
      required_error: 'MOBILE_REQUIRED',
      invalid_type_error: 'INVALID_MOBILE',
    })
    .nonnegative({
      message: 'INVALID_MOBILE',
    }),
  phone: z
    .string({
      invalid_type_error: 'INVALID_PHONE',
    })
    .optional(),
  status: z.nativeEnum(CustomerStatus, {
    required_error: 'CUSTOMER_STATUS_REQUIRED',
    invalid_type_error: 'INVALID_CUSTOMER_STATUS',
  }),
  country: z
    .number({
      invalid_type_error: 'INVALID_COUNTRY',
    })
    .optional(),
  city: z
    .number({
      invalid_type_error: 'INVALID_CITY',
    })
    .optional(),
  address: z
    .string({
      invalid_type_error: 'INVALID_ADDRESS',
    })
    .optional(),
  createdOn: z
    .date({
      invalid_type_error: 'INVALID_CREATED_ON',
    })
    .nullish(),
  modifiedOn: z
    .date({
      invalid_type_error: 'INVALID_MODIFIED_ON',
    })
    .nullish(),
  createdBy: z
    .string({
      invalid_type_error: 'INVALID_CREATED_BY',
    })
    .uuid({ message: 'INVALID_CREATED_BY' })
    .nullish(),
  modifiedBy: z
    .string({
      invalid_type_error: 'INVALID_MODIFIED_BY',
    })
    .uuid({
      message: 'INVALID_MODIFIED_BY',
    })
    .nullish(),
  emailActivationToken: z.string().optional(),
});
