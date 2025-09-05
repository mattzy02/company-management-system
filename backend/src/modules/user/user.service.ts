import { Injectable, NotFoundException, ConflictException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async cleanUserCache(userId?: string): Promise<void> {
    this.logger.log('Cleaning user cache');
    await this.cacheManager.del('user:all');
    if (userId) {
      await this.cacheManager.del(`user:${userId}`);
    }
  }

  // create user function
  async create(createData: CreateUserDto): Promise<User> {
    const existingUser = await this.findOneByEmail(createData.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt();
    // uses bcrypt to hash the password
    const hashedPassword = await bcrypt.hash(createData.password, salt);

    // create a new user with the hashed password
    const newUser = this.userRepository.create({
      ...createData,
      password: hashedPassword,
    });

    // save the new user to the database
    const savedUser = await this.userRepository.save(newUser);
    await this.cleanUserCache();
    return savedUser;
  }

  // get all users function
  async findAll(): Promise<User[]> {
    const cacheKey = 'user:all';
    const cachedUsers = await this.cacheManager.get<User[]>(cacheKey);
    if(cachedUsers) {
      this.logger.log('Returning all users from cache');
      return cachedUsers;
    }

    const users = await this.userRepository.find();
    await this.cacheManager.set(cacheKey, users, 300 * 1000); // 5 minutes
    return users;
  }

  // find user by email or username function
  findBy(findData: FindUserDto): Promise<User[]> {
    return this.userRepository.find({
      // uses where clause to find the user by given data
      where: findData,
    });
  }

  // find user by email function
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // find user by id function
  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    if (cachedUser) {
      this.logger.log(`Returning user ${id} from cache`);
      return cachedUser;
    }

    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    await this.cacheManager.set(cacheKey, user, 600 * 1000); // 10 minutes
    return user;
  }

  // update user function
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Don't hash password again if it's already hashed (e.g., from changePassword)
    // The password field in updateUserDto should already be hashed when coming from AuthService
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // save the user to the database
    const savedUser = await this.userRepository.save(user);
    await this.cleanUserCache(id);
    return savedUser;
  }

  // update password function - specifically for password changes
  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    const user = await this.userRepository.preload({
      id: id,
      password: hashedPassword,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // save the user to the database
    const savedUser = await this.userRepository.save(user);
    await this.cleanUserCache(id);
    return savedUser;
  }

  // delete user function
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.userRepository.delete(id);

    // if user is not found, throw an error
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.cleanUserCache(id);
    return { message: 'Deleted successfully' };
  }
}
 