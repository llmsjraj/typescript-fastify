import { z } from 'zod';

export const UserItem = z.object({
  id: z
    .string({
      invalid_type_error: 'User id must be a string',
    })
    .uuid()
    .optional(),
  customerId: z
    .string({
      required_error: 'Customer id is required',
      invalid_type_error: 'Customer id must be a string',
    })
    .uuid(),
  status: z.number({
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a number',
  }),
  createdOn: z.date().optional(),
  modifiedOn: z.date().optional(),
  createdBy: z
    .string({
      invalid_type_error: 'Id must be a string',
    })
    .uuid()
    .optional(),
  modifiedBy: z
    .string({
      invalid_type_error: 'Id must be a string',
    })
    .uuid()
    .optional(),
  username: z
    .string({
      invalid_type_error: 'User name must be a string',
    })
    .optional(),
  password: z
    .string({
      invalid_type_error: 'Password must be a string',
    })
    .optional(),
  activatedOn: z
    .date({
      invalid_type_error: 'Datetime must be a string',
    })
    .optional(),
  fbLinked: z
    .boolean({
      invalid_type_error: 'fblinked must be a boolean',
    })
    .optional(),
  fbId: z
    .string({
      invalid_type_error: 'fbid must be a string',
    })
    .optional(),
  fbToken: z
    .string({
      invalid_type_error: 'fbtoken must be a string',
    })
    .optional(),
  googleLinked: z
    .boolean({
      invalid_type_error: 'googlelinked must be a boolean',
    })
    .optional(),
  googleId: z
    .string({
      invalid_type_error: 'Google id must be a string',
    })
    .optional(),
  googleToken: z
    .string({
      invalid_type_error: 'Google token must be a string',
    })
    .optional(),
});
