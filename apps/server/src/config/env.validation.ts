import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DB_HOST: Joi.string().hostname().required(),
  DB_PORT: Joi.number().port().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),
  REDIS_HOST: Joi.string().hostname().required(),
  REDIS_PORT: Joi.number().port().required(),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  SESSION_SECRET: Joi.string().min(16).required(),
  SESSION_COOKIE_NAME: Joi.string().trim().min(1).required(),
  SESSION_MAX_AGE_DAYS: Joi.number().integer().min(1).default(7),
  QUEUE_PREFIX: Joi.string().default('my_app_queue'),
});
