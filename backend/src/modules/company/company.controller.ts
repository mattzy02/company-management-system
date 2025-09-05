// defines the API endpoints and handles incoming HTTP requests.

import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { FilterCompanyDto } from './dto/filter-company.dto';
import { CompanyHierarchyDto } from './dto/company-hierarchy.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Companies')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // create a new company
  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  // query companies
  @Post('filter')
  @ApiOperation({ summary: 'Filter companies based on criteria' })
  @ApiResponse({ status: 200, description: 'Companies filtered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  queryCompanies(@Body() filterCompanyDto: FilterCompanyDto) {
    return this.companyService.queryCompanies(filterCompanyDto);
  }

  // get all companies
  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'All companies retrieved successfully' })
  findAll() {
    return this.companyService.findAll();
  }

  // get a single company
  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  findOne(@Param('id') code: string) {
    return this.companyService.findOne(code);
  }

  // update a company
  @Patch(':id')
  @ApiOperation({ summary: 'Update a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  update(@Param('id') code: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(code, updateCompanyDto);
  }

  // get company hierarchy for bubble chart
  @Post('hierarchy')
  @ApiOperation({ summary: 'Get company hierarchy for bubble chart' })
  @ApiResponse({ status: 200, description: 'Company hierarchy retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  getCompanyHierarchy(@Body() hierarchyDto: CompanyHierarchyDto) {
    return this.companyService.getCompanyHierarchy(hierarchyDto);
  }

  // delete a company
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  remove(@Param('id') code: string) {
    return this.companyService.remove(code);
  }
}
