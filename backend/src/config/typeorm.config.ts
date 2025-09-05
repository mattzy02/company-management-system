import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

// service to configure typeorm options
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  // constructor to inject config service
  constructor(private configService: ConfigService) {}

  // create typeorm options
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      // use the injected configService to get the configuration values we defined in app.config.ts.
      host: this.configService.get<string>('app.database.host'),
      port: this.configService.get<number>('app.database.port'),
      username: this.configService.get<string>('app.database.username'),
      password: this.configService.get<string>('app.database.password'),
      database: this.configService.get<string>('app.database.database'),
      // entity files to be used for the database
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      // automatically updates your database schema to match entities
      synchronize: true,
    };
  }
}
