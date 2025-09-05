import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company code', example: 'C001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company_code: string;

  @ApiProperty({ description: 'Company name', example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company_name: string;

  @ApiProperty({ description: 'Company level (1-4)', example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  level?: number;

  @ApiProperty({ description: 'Company country', example: 'United States', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  country?: string;

  @ApiProperty({ description: 'Company city', example: 'New York', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @ApiProperty({ description: 'Year founded', example: '1990', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  year_founded?: string;

  @ApiProperty({ description: 'Annual revenue', example: 1000000, required: false })
  @IsOptional()
  @IsNumber()
  annual_revenue?: number;

  @ApiProperty({ description: 'Number of employees', example: 100, required: false })
  @IsOptional()
  @IsInt()
  employees?: number;

  @ApiProperty({ description: 'Parent company ID', example: 'C000', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  parent_id?: string;
} 