import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { FilterCompanyDto, CompanyDimension } from './dto/filter-company.dto';
import { CompanyHierarchyDto, CompanyHierarchyNode } from './dto/company-hierarchy.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);
  private relationships: any[] = [];

  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // Load relationships on service initialization
    this.loadRelationships();
  }

  private async loadRelationships() {
    try {
      const fs = require('fs');
      const path = require('path');
      const csv = require('csv-parser');
      
      const csvPath = path.join(__dirname, '../../../data/relationships.csv');
      const relationships: any[] = [];
      
      return new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (row: any) => {
            relationships.push({
              company_code: row.company_code,
              parent_company: row.parent_company || '',
            });
          })
          .on('end', () => {
            this.relationships = relationships;
            this.logger.log(`Loaded ${relationships.length} relationships`);
            resolve(true);
          })
          .on('error', (error: any) => {
            this.logger.error('Error loading relationships:', error);
            reject(error);
          });
      });
    } catch (error) {
      this.logger.error('Error loading relationships:', error);
    }
  }

  private generateCacheKey(...args: any[]): string {
    return `company:${args.map(arg => JSON.stringify(arg)).join('.')}`;
  }

  async cleanCompanyCache(companyId?: string): Promise<void> {
    this.logger.log('Cleaning company cache');
    // This is a simplified approach. A more robust solution would be to
    // manage a list of all query keys and delete them.
    // For now, we clear the most common cache entry.
    await this.cacheManager.del(this.generateCacheKey('all'));
    
    if (companyId) {
      await this.cacheManager.del(this.generateCacheKey('id', companyId));
    }
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const newCompany = this.companyRepository.create(createCompanyDto);
    await this.companyRepository.save(newCompany);
    await this.cleanCompanyCache();
    return newCompany;
  }

  async findAll(): Promise<Company[]> {
    const cacheKey = this.generateCacheKey('all');
    const cached = await this.cacheManager.get<Company[]>(cacheKey);
    if (cached) {
      this.logger.log('Returning all companies from cache');
      return cached;
    }

    const companies = await this.companyRepository.find();
    await this.cacheManager.set(cacheKey, companies, 300 * 1000); // 5 min
    return companies;
  }

  async findOne(id: string): Promise<Company | null> {
    const cacheKey = this.generateCacheKey('id', id);
    const cached = await this.cacheManager.get<Company>(cacheKey);
    if (cached) {
      this.logger.log(`Returning company ${id} from cache`);
      return cached;
    }

    const company = await this.companyRepository.findOne({ 
      where: { company_code: id }, 
    });

    if (!company) {
      throw new NotFoundException(`Company ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, company, 600 * 1000); // 10 min
    return company;
  }

  async update(code: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companyRepository.preload({
      company_code: code,
      ...updateCompanyDto,
    });
    if (!company) {
      throw new NotFoundException(`Company with code ${code} not found.`);
    }
    const savedCompany = await this.companyRepository.save(company);
    await this.cleanCompanyCache(code);
    return savedCompany;
  }

  async queryCompanies(queryCompanyDto: FilterCompanyDto): Promise<any> {
    const cacheKey = this.generateCacheKey('query', queryCompanyDto);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.log(`Returning queried companies from cache for query: ${JSON.stringify(queryCompanyDto)}`);
      return cached;
    }

    const { dimension, filter } = queryCompanyDto;
    this.logger.debug(`Querying companies with dimension: ${dimension}`);
    if (filter) {
      this.logger.debug(`Filters: ${JSON.stringify(filter, null, 2)}`);
    }

    const queryBuilder = this.companyRepository.createQueryBuilder('company');

    if (filter) {
      if (filter.level && filter.level.length > 0) {
        queryBuilder.andWhere('company.level IN (:...levels)', { levels: filter.level });
      }
      if (filter.country && filter.country.length > 0) {
        queryBuilder.andWhere('company.country IN (:...countries)', { countries: filter.country });
      }
      if (filter.city && filter.city.length > 0) {
        queryBuilder.andWhere('company.city IN (:...cities)', { cities: filter.city });
      }

      if (filter.founded_year) {
        if (filter.founded_year.start !== undefined && filter.founded_year.end !== undefined) {
          queryBuilder.andWhere('company.year_founded BETWEEN :startYear AND :endYear', {
            startYear: filter.founded_year.start.toString(),
            endYear: filter.founded_year.end.toString(),
          });
        } else if (filter.founded_year.start !== undefined) {
          queryBuilder.andWhere('company.year_founded >= :startYear', { startYear: filter.founded_year.start.toString() });
        } else if (filter.founded_year.end !== undefined) {
          queryBuilder.andWhere('company.year_founded <= :endYear', { endYear: filter.founded_year.end.toString() });
        }
      }

      if (filter.annual_revenue) {
        if (filter.annual_revenue.min !== undefined && filter.annual_revenue.max !== undefined) {
          queryBuilder.andWhere('company.annual_revenue BETWEEN :minRevenue AND :maxRevenue', {
            minRevenue: filter.annual_revenue.min,
            maxRevenue: filter.annual_revenue.max,
          });
        } else if (filter.annual_revenue.min !== undefined) {
          queryBuilder.andWhere('company.annual_revenue >= :minRevenue', { minRevenue: filter.annual_revenue.min });
        } else if (filter.annual_revenue.max !== undefined) {
          queryBuilder.andWhere('company.annual_revenue <= :maxRevenue', { maxRevenue: filter.annual_revenue.max });
        }
      }

      if (filter.employees) {
        if (filter.employees.min !== undefined && filter.employees.max !== undefined) {
          queryBuilder.andWhere('company.employees BETWEEN :minEmployees AND :maxEmployees', {
            minEmployees: filter.employees.min,
            maxEmployees: filter.employees.max,
          });
        } else if (filter.employees.min !== undefined) {
          queryBuilder.andWhere('company.employees >= :minEmployees', { minEmployees: filter.employees.min });
        } else if (filter.employees.max !== undefined) {
          queryBuilder.andWhere('company.employees <= :maxEmployees', { maxEmployees: filter.employees.max });
        }
      }
    }

    queryBuilder.select([
      'company.company_code',
      'company.company_name',
      'company.level',
      'company.country',
      'company.city',
      'company.year_founded',
      'company.annual_revenue',
      'company.employees',
    ]);

    const companies = await queryBuilder.getMany();
    const groupedData = {};

    if (!companies || companies.length === 0) {
        return {
            dimension,
            data: {},
        };
    }

    for (const company of companies) {
      let key;
      switch (dimension) {
        case CompanyDimension.LEVEL:
          key = company.level?.toString();
          break;
        case CompanyDimension.COUNTRY:
          key = company.country;
          break;
        case CompanyDimension.CITY:
          key = company.city;
          break;
        default:
          this.logger.warn(`Unknown dimension: ${dimension}`);
          continue;
      }

      if (key === undefined || key === null || (typeof key === 'string' && key.trim() === '')) {
        key = '_unknown';
      }

      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(company);
    }

    const result = {
      dimension,
      data: groupedData,
    };

    await this.cacheManager.set(cacheKey, result, 300 * 1000); // 5 minutes
    return result;
  }

  async getCompanyHierarchy(hierarchyDto: CompanyHierarchyDto): Promise<CompanyHierarchyNode> {
    const cacheKey = this.generateCacheKey('hierarchy', hierarchyDto);
    const cached = await this.cacheManager.get<CompanyHierarchyNode>(cacheKey);
    if (cached) {
      this.logger.log(`Returning company hierarchy from cache for: ${JSON.stringify(hierarchyDto)}`);
      return cached;
    }

    // Get all companies
    const companies = await this.companyRepository.find();
    
    // Create a map of company codes to companies for quick lookup
    const companyMap = new Map<string, Company>();
    companies.forEach(company => {
      companyMap.set(company.company_code, company);
    });

    // Build the hierarchy
    const rootCompanyCode = hierarchyDto.company_code || 'C0';
    const rootCompany = companyMap.get(rootCompanyCode);
    
    if (!rootCompany) {
      throw new NotFoundException(`Company with code ${rootCompanyCode} not found`);
    }

    const hierarchy = this.buildHierarchy(rootCompany, companyMap, hierarchyDto.max_depth || 3);
    
    await this.cacheManager.set(cacheKey, hierarchy, 300 * 1000); // 5 minutes
    return hierarchy;
  }

    private buildHierarchy(
    company: Company, 
    companyMap: Map<string, Company>, 
    maxDepth: number,
    currentDepth: number = 0
  ): CompanyHierarchyNode {
    if (currentDepth >= maxDepth) {
      return {
        company_code: company.company_code,
        company_name: company.company_name,
        level: company.level || undefined,
        country: company.country || undefined,
        city: company.city || undefined,
        year_founded: company.year_founded || undefined,
        annual_revenue: company.annual_revenue || undefined,
        employees: company.employees || undefined,
      };
    }

    // Find children based on relationships.csv structure
    const children: CompanyHierarchyNode[] = [];
    
    // Use loaded relationships data
    for (const relationship of this.relationships) {
      if (relationship.parent_company === company.company_code) {
        const childCompany = companyMap.get(relationship.company_code);
        if (childCompany) {
          children.push(this.buildHierarchy(childCompany, companyMap, maxDepth, currentDepth + 1));
        }
      }
    }

    // Fallback: if no relationships data, use code-based logic
    if (children.length === 0) {
      for (const [childCode, childCompany] of companyMap) {
        // Simple heuristic: if child code starts with parent code + additional characters
        if (childCode !== company.company_code && 
            childCode.startsWith(company.company_code) &&
            childCode.length > company.company_code.length) {
          children.push(this.buildHierarchy(childCompany, companyMap, maxDepth, currentDepth + 1));
        }
      }
    }

    return {
      company_code: company.company_code,
      company_name: company.company_name,
      level: company.level || undefined,
      country: company.country || undefined,
      city: company.city || undefined,
      year_founded: company.year_founded || undefined,
      annual_revenue: company.annual_revenue || undefined,
      employees: company.employees || undefined,
      children: children.length > 0 ? children : undefined,
    };
  }
}
