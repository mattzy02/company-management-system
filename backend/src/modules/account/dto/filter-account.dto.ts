import { IsOptional, IsEnum, IsString, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType, AccountStatus } from '../account.entity';

export class FilterAccountDto {
  @ApiProperty({ description: 'User ID to filter by', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({ 
    description: 'Account type filter', 
    enum: AccountType, 
    example: AccountType.CHECKING,
    required: false 
  })
  @IsOptional()
  @IsEnum(AccountType)
  account_type?: AccountType;

  @ApiProperty({ 
    description: 'Account status filter', 
    enum: AccountStatus, 
    example: AccountStatus.ACTIVE,
    required: false 
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiProperty({ description: 'Account number search', example: 'ACC', required: false })
  @IsOptional()
  @IsString()
  account_number?: string;

  @ApiProperty({ description: 'Account name search', example: 'Checking', required: false })
  @IsOptional()
  @IsString()
  account_name?: string;

  @ApiProperty({ description: 'Currency filter', example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Minimum balance', example: 100, required: false })
  @IsOptional()
  @IsNumber()
  min_balance?: number;

  @ApiProperty({ description: 'Maximum balance', example: 10000, required: false })
  @IsOptional()
  @IsNumber()
  max_balance?: number;

  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Items per page', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
