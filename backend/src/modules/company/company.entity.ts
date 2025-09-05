import {
  Entity,
  Column,
  PrimaryColumn,
  // ManyToOne,
  // OneToMany,
  // JoinColumn,
} from 'typeorm';

// company database entity 
@Entity('companies')
export class Company {
  // company_code: primary key, ex. "C0"
  @PrimaryColumn({ type: 'varchar', length: 255 })
  company_code: string;

  // company_name: ex. "Apple Inc."
  @Column({ type: 'varchar', length: 255 })
  company_name: string;

  // level: ex. "1"
  @Column({ type: 'int', nullable: true })
  level: number | null;

  // country: ex. "China"
  @Column({ type: 'varchar', length: 255, nullable: true })
  country: string | null;

  // city: ex. "Beijing"
  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string | null;

  // year_founded: ex. "2010"
  @Column({ type: 'varchar', length: 50, nullable: true })
  year_founded: string | null;

  // annual_revenue: ex. "1000000000"
  @Column({ type: 'bigint', nullable: true })
  annual_revenue: number | null;

  // employees: ex. "10000"
  @Column({ type: 'int', nullable: true })
  employees: number | null;

  // --- Relationships (commented out for future reference) ---
  // // parent_id: foreign key, ex. "C0"
  // @Column({ name: 'parent_id', type: 'varchar', length: 255, nullable: true })
  // parent_id: string | null;

  // // parent: ex. "C0"
  // @ManyToOne(() => Company, (company) => company.children, {
  //   nullable: true,
  //   onDelete: 'SET NULL',
  //   createForeignKeyConstraints: false,
  // })
  // @JoinColumn({ name: 'parent_id', referencedColumnName: 'company_code' })
  // parent: Company | null;

  // // children: array of child companies
  // @OneToMany(() => Company, (company) => company.parent)
  // children: Company[];
}
