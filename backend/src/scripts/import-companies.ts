import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module'; // Adjust path based on your structure
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from '../modules/company/company.entity'; // Adjust path
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { Repository } from 'typeorm';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const companyRepository = appContext.get<Repository<Company>>(getRepositoryToken(Company));

  const results: any[] = [];
  const filePath = 'data/companies.csv'; // This will be relative to the backend root

  if (!fs.existsSync(filePath)) {
    console.error(`Error: ${filePath} not found. Make sure it's in the project root.`);
    await appContext.close();
    return;
  }

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`CSV file successfully processed. Found ${results.length} records. Importing to database...`);

      for (const record of results) {
        try {
          const company = new Company();
          company.company_code = record.company_code;
          company.company_name = record.company_name;
          company.level = record.level ? parseInt(record.level, 10) : null;
          company.country = record.country || null;
          company.city = record.city || null;
          company.year_founded = record.founded_year || null;
          company.annual_revenue = record.annual_revenue ? parseInt(record.annual_revenue, 10) : null;
          company.employees = record.employees ? parseInt(record.employees, 10) : null;
          // Relationships are commented out for now

          await companyRepository.save(company);
        } catch (error) {
          console.error('Error saving record:', record);
          if (error.code === 'ER_DUP_ENTRY') {
            console.warn(`Skipping duplicate entry for ID: ${record.company_code}`);
          } else {
            console.error('Detailed error:', error);
          }
        }
      }

      console.log('Company data import finished.');
      await appContext.close();
    })
    .on('error', (error) => {
      console.error('Error reading or parsing CSV:', error);
      appContext.close();
    });
}

bootstrap().catch(err => {
  console.error("Error during bootstrap execution:", err);
  process.exit(1);
}); 