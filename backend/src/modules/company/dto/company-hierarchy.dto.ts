import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CompanyHierarchyDto {
  @IsOptional()
  @IsString()
  company_code?: string;

  @IsOptional()
  @IsNumber()
  max_depth?: number;
}

export interface CompanyHierarchyNode {
  company_code: string;
  company_name: string;
  level?: number;
  country?: string;
  city?: string;
  year_founded?: string;
  annual_revenue?: number;
  employees?: number;
  children?: CompanyHierarchyNode[];
} 