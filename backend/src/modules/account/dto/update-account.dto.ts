import { IsString, IsOptional, IsEnum, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType, AccountStatus } from '../account.entity';

export class UpdateAccountDto {
  @ApiProperty({ description: 'Account number', example: 'ACC001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  account_number?: string;

  @ApiProperty({ description: 'Account name', example: 'Main Checking Account', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  account_name?: string;

  @ApiProperty({ 
    description: 'Account type', 
    enum: AccountType, 
    example: AccountType.CHECKING,
    required: false 
  })
  @IsOptional()
  @IsEnum(AccountType)
  account_type?: AccountType;

  @ApiProperty({ 
    description: 'Account status', 
    enum: AccountStatus, 
    example: AccountStatus.ACTIVE,
    required: false 
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @ApiProperty({ description: 'Account balance', example: 1000.00, required: false })
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiProperty({ description: 'Currency code', example: 'USD', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ description: 'Account description', example: 'Primary checking account', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
