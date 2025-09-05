import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  // registers the Company entity with TypeORM
  imports: [TypeOrmModule.forFeature([Company]), CacheModule.register()],
  providers: [CompanyService],
  controllers: [CompanyController],
})
export class CompanyModule {}
