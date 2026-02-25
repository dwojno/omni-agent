import type { EnvConfigPayload } from './schema.js'

import { makeEnvAccessor } from './envAccessor.js'
import { mapValues } from 'es-toolkit';

export const getConfig = (): EnvConfigPayload => {
  const envs = makeEnvAccessor(
    // We had situations that newline was there, so just as additional check let's remove it
    mapValues(process.env, v => v?.trim()),
  );
  return {
    databaseUrl: envs.getRequired('DATABASE_URL'),
  }
}
