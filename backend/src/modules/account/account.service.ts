import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Account, AccountType, AccountStatus } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { FilterAccountDto } from './dto/filter-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    // Check if account number already exists
    const existingAccount = await this.accountRepository.findOne({
      where: { account_number: createAccountDto.account_number }
    });

    if (existingAccount) {
      throw new BadRequestException('Account number already exists');
    }

    const account = this.accountRepository.create({
      ...createAccountDto,
      balance: createAccountDto.balance || 0,
      currency: createAccountDto.currency || 'USD',
      status: createAccountDto.status || AccountStatus.ACTIVE
    });

    return this.accountRepository.save(account);
  }

  async findAll(): Promise<Account[]> {
    return this.accountRepository.find({
      relations: ['user']
    });
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async findByUser(userId: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { user_id: userId },
      relations: ['user']
    });
  }

  async filterAccounts(filterDto: FilterAccountDto): Promise<{ accounts: Account[]; total: number }> {
    const {
      user_id,
      account_type,
      status,
      account_number,
      account_name,
      currency,
      min_balance,
      max_balance,
      page = 1,
      limit = 10
    } = filterDto;

    const queryBuilder = this.accountRepository.createQueryBuilder('account')
      .leftJoinAndSelect('account.user', 'user');

    // Apply filters
    if (user_id) {
      queryBuilder.andWhere('account.user_id = :user_id', { user_id });
    }

    if (account_type) {
      queryBuilder.andWhere('account.account_type = :account_type', { account_type });
    }

    if (status) {
      queryBuilder.andWhere('account.status = :status', { status });
    }

    if (account_number) {
      queryBuilder.andWhere('account.account_number LIKE :account_number', { 
        account_number: `%${account_number}%` 
      });
    }

    if (account_name) {
      queryBuilder.andWhere('account.account_name LIKE :account_name', { 
        account_name: `%${account_name}%` 
      });
    }

    if (currency) {
      queryBuilder.andWhere('account.currency = :currency', { currency });
    }

    if (min_balance !== undefined || max_balance !== undefined) {
      if (min_balance !== undefined && max_balance !== undefined) {
        queryBuilder.andWhere('account.balance BETWEEN :min_balance AND :max_balance', {
          min_balance,
          max_balance
        });
      } else if (min_balance !== undefined) {
        queryBuilder.andWhere('account.balance >= :min_balance', { min_balance });
      } else if (max_balance !== undefined) {
        queryBuilder.andWhere('account.balance <= :max_balance', { max_balance });
      }
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by creation date
    queryBuilder.orderBy('account.created_at', 'DESC');

    const accounts = await queryBuilder.getMany();

    return { accounts, total };
  }

  async update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(id);

    // Check if account number is being updated and if it already exists
    if (updateAccountDto.account_number && updateAccountDto.account_number !== account.account_number) {
      const existingAccount = await this.accountRepository.findOne({
        where: { account_number: updateAccountDto.account_number }
      });

      if (existingAccount) {
        throw new BadRequestException('Account number already exists');
      }
    }

    Object.assign(account, updateAccountDto);
    return this.accountRepository.save(account);
  }

  async remove(id: string): Promise<void> {
    const account = await this.findOne(id);
    await this.accountRepository.remove(account);
  }

  async getAccountStats(userId?: string): Promise<{
    total_accounts: number;
    total_balance: number;
    accounts_by_type: Record<AccountType, number>;
    accounts_by_status: Record<AccountStatus, number>;
  }> {
    const queryBuilder = this.accountRepository.createQueryBuilder('account');

    if (userId) {
      queryBuilder.where('account.user_id = :userId', { userId });
    }

    const accounts = await queryBuilder.getMany();

    const stats = {
      total_accounts: accounts.length,
      total_balance: accounts.reduce((sum, account) => sum + Number(account.balance), 0),
      accounts_by_type: {
        [AccountType.SAVINGS]: 0,
        [AccountType.CHECKING]: 0,
        [AccountType.CREDIT]: 0,
        [AccountType.INVESTMENT]: 0,
      },
      accounts_by_status: {
        [AccountStatus.ACTIVE]: 0,
        [AccountStatus.INACTIVE]: 0,
        [AccountStatus.SUSPENDED]: 0,
        [AccountStatus.CLOSED]: 0,
      },
    };

    accounts.forEach(account => {
      stats.accounts_by_type[account.account_type]++;
      stats.accounts_by_status[account.status]++;
    });

    return stats;
  }
}
