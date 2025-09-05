import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsEnum,
  IsArray,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsNumber,
} from 'class-validator';

export enum CompanyDimension {
  LEVEL = 'level',
  COUNTRY = 'country',
  CITY = 'city',
}

export class FoundedYearFilterDto {
  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear())
  start?: number;

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear())
  end?: number;
}

export class NumericRangeFilterDto {
  @IsOptional()
  @IsNumber()
  min?: number;

  @IsOptional()
  @IsNumber()
  max?: number;
}

export class CompanyFilterDto {
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(3, { each: true })
  level?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  country?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  city?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FoundedYearFilterDto)
  founded_year?: FoundedYearFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NumericRangeFilterDto)
  annual_revenue?: NumericRangeFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NumericRangeFilterDto)
  employees?: NumericRangeFilterDto;
}

export class FilterCompanyDto {
  @IsEnum(CompanyDimension)
  dimension: CompanyDimension;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyFilterDto)
  filter?: CompanyFilterDto;
} 