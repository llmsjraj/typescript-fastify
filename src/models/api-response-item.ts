import { z } from 'zod';

export const ApiResponseItem = z.object({
  status: z.boolean(),
  messages: z.array(z.string()),
  data: z.object({}),
});
