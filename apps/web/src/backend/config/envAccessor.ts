import { z } from 'zod/v4';

function parseToInt(value: string, envKey: string) {
  const result = z
    .string()
    .regex(/^-?\d+$/u)
    .transform(Number)
    .safeParse(value);

  if (result.success === false) {
    throw new Error(`Environment variable "${envKey}" must be an integer. Is "${value}"`);
  }
  return result.data;
}

function parseToFloat(value: string, envKey: string) {
  const result = z
    .string()
    .regex(/^[-+]?[0-9]*\.?[0-9]+$/u)
    .transform(Number)
    .safeParse(value);

  if (result.success === false) {
    throw new Error(`Environment variable "${envKey}" must be a float. Is "${value}"`);
  }
  return result.data;
}

export function makeEnvAccessor(envs: Record<string, string | undefined>) {
  function getOptional<DefaultValue extends string | undefined>(
    envKey: string,
    defaultValue?: DefaultValue,
  ): DefaultValue extends string ? string : string | undefined {
    return envs[envKey] ?? (defaultValue as DefaultValue extends string ? string : string | undefined);
  }

  function getRequired(envKey: string): string {
    const value = getOptional(envKey);
    if (value === undefined) {
      throw new Error(`Environment variable ${envKey} must be set`);
    }
    return value;
  }

  function getRequiredInt(envKey: string): number {
    const value = getRequired(envKey);
    return parseToInt(value, envKey);
  }

  function getOptionalInt<DefaultValue extends number | undefined>(
    envKey: string,
    defaultValue?: DefaultValue,
  ): DefaultValue extends number ? number : number | undefined {
    const value = getOptional(envKey);
    if (value === undefined) {
      return defaultValue as DefaultValue extends number ? number : number | undefined;
    }

    return parseToInt(value, envKey);
  }

  function getOptionalFloat<DefaultValue extends number | undefined>(
    envKey: string,
    defaultValue?: DefaultValue,
  ): DefaultValue extends number ? number : number | undefined {
    const value = getOptional(envKey);
    if (value === undefined) {
      return defaultValue as DefaultValue extends number ? number : number | undefined;
    }

    return parseToFloat(value, envKey);
  }

  function getOptionalBool<DefaultValue extends boolean | undefined>(
    envKey: string,
    defaultValue?: DefaultValue,
  ): DefaultValue extends boolean ? boolean : boolean | undefined {
    const value = getOptional(envKey);
    if (value === undefined) {
      return defaultValue as DefaultValue extends boolean ? boolean : boolean | undefined;
    }

    if (value === '1' || value === 'true') {
      return true;
    }
    return false;
  }

  return {
    getOptional,
    getOptionalBool,
    getOptionalInt,
    getOptionalFloat,
    getRequired,
    getRequiredInt,
  };
}
