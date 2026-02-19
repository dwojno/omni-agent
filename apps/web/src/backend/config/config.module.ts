import { Global, Module } from "@nestjs/common";
import { ConfigFacade } from "./config.facade";

@Global()
@Module({
  providers: [ConfigFacade],
  exports: [ConfigFacade]
})
export class ConfigModule { }
