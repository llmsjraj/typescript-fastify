import { z } from 'zod';

export const ResendEmailActivationItem = z.object({
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
});
