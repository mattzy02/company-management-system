import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Account } from '../account/account.entity';

@Entity('users')
export class User {
  // user_id - primary key, uuid, auto generated using uuid
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // email - unique, not empty
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'User' })
  role: string;

  @Column({ default: 'Active' })
  status: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Account, account => account.user)
  accounts: Account[];
} 