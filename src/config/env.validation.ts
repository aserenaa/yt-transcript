import * as Joi from 'joi';

export const validationSchema = Joi.object({
  YT_OAUTH_CLIENT_ID: Joi.string().required(),
  YT_OAUTH_CLIENT_SECRET: Joi.string().required(),
  YT_OAUTH_REFRESH_TOKEN: Joi.string().required(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_TTL_SECONDS: Joi.number().default(3600),
  PORT: Joi.number().default(3000),
});
