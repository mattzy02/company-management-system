import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CompanyService } from '../modules/company/company.service';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

interface Relationship {
  company_code: string;
  parent_company: string;
}

async function importRelationships() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const companyService = app.get(CompanyService);

  const relationships: Relationship[] = [];
  const csvPath = path.join(__dirname, '../../../data/relationships.csv');

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        relationships.push({
          company_code: row.company_code,
          parent_company: row.parent_company || '',
        });
      })
      .on('end', async () => {
        try {
          console.log(`Imported ${relationships.length} relationships`);
          
          // Store relationships in memory for now
          // In a real implementation, you'd create a separate table
          (companyService as any).relationships = relationships;
          
          console.log('Relationships imported successfully');
          resolve(true);
        } catch (error) {
          console.error('Error importing relationships:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

if (require.main === module) {
  importRelationships()
    .then(() => {
      console.log('Import completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

export { importRelationships }; 