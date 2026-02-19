import { Injectable } from "@nestjs/common";
import { EnvConfigPayload } from "./schema";
import { getConfig } from "./env";

@Injectable()
export class ConfigFacade {
  config: EnvConfigPayload

  constructor() {
    this.config = getConfig()
  }
}
