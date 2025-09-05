import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/typeorm.config';

import { CompanyModule } from './modules/company/company.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccountModule } from './modules/account/account.module';
import appConfig from './config/app.config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

// root module for the application
@Module({
  imports: [
    // config module for loading app config
    ConfigModule.forRoot({
      // load app config
      load: [appConfig],
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    // typeorm module for database connection
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    // company module for company related routes containing controllers and services
    CompanyModule,
    UserModule,
    AuthModule,
    AccountModule,
  ],
  // controllers for the application
  controllers: [AppController],
  // providers for the application
  providers: [AppService],
})
export class AppModule {}
