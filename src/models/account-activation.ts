import { z } from 'zod';

export const AccountActivationItem = z.object({
  emailActivationToken: z
    .string({
      required_error: 'EMAIL_ACTIVATION_TOKEN_REQUIRED',
      invalid_type_error: 'INVALID_EMAIL_ACTIVATION_TOKEN',
    })
    .nonempty({
      message: 'EMAIL_ACTIVATION_TOKEN_REQUIRED',
    }),
});
