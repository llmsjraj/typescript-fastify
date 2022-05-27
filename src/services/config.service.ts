import path from 'path';
import envSchema from 'env-schema';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import { ConfigItem } from '../models/config';

type ConfigType = z.infer<typeof ConfigItem>;

export class ConfigService {
  loadConfig(): ConfigType {
    const result = require('dotenv').config({
      path: path.join(__dirname, `../../.env.${process.env.NODE_ENV ?? 'development'}`),
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return envSchema<ConfigType>({
      schema: zodToJsonSchema(ConfigItem),
    });
  }
}
