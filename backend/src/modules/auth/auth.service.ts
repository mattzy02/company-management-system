import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from '../user/dto/update-profile.dto';
import { ChangePasswordDto } from '../user/dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // register function for creating a new user
  async register(registerDto: RegisterDto) {
    // calls create function in user service with registerDto as user data
    const user = await this.userService.create(registerDto);
    // calls login function to generate a JWT token for the user
    return this.login(user);
  }

  // validate user function - checks if user exists and if password is correct
  async validateUser(email: string, pass: string): Promise<any> {
    // calls findOneByEmail function in user service to get user by email
    const user = await this.userService.findOneByEmail(email);
    // if user exists and password is correct, return the user without the password
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    // else null
    return null;
  }

  // login function - generates a JWT token for the user
  async login(user: User) {
    // payload is the user's email and user id
    const payload = { email: user.email, sub: user.id };
    // sign the payload and return access token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // update profile function - updates user's name and phone
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    return this.userService.update(userId, updateProfileDto);
  }

  // change password function - changes user's password
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new ForbiddenException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    
    // Update password using the dedicated password update method
    return this.userService.updatePassword(userId, hashedNewPassword);
  }

  // update demo profile function - creates or updates demo user in database
  async updateDemoProfile(updateProfileDto: UpdateProfileDto) {
    // Check if demo user exists
    let demoUser = await this.userService.findOneByEmail('demo@demo.com');
    
    if (!demoUser) {
      // Create demo user if it doesn't exist
      const hashedPassword = await bcrypt.hash('demo', 10);
      demoUser = await this.userService.create({
        name: updateProfileDto.name || 'John Doe',
        email: 'demo@demo.com',
        password: hashedPassword,
        phone: updateProfileDto.phone || '+1 (555) 123-4567',
        address: updateProfileDto.address || '123 Main Street',
        country: updateProfileDto.country || 'United States',
      });
    } else {
      // Update existing demo user
      demoUser = await this.userService.update(demoUser.id, updateProfileDto);
    }
    
    return demoUser;
  }

  // get demo profile function - retrieves demo user from database
  async getDemoProfile() {
    // Check if demo user exists
    let demoUser = await this.userService.findOneByEmail('demo@demo.com');
    
    if (!demoUser) {
      // Create demo user if it doesn't exist
      const hashedPassword = await bcrypt.hash('demo', 10);
      demoUser = await this.userService.create({
        name: 'John Doe',
        email: 'demo@demo.com',
        password: hashedPassword,
        phone: '+1 (555) 123-4567',
        address: '123 Main Street',
        country: 'United States',
        role: 'Demo',
        status: 'Active'
      });
    }
    
    return demoUser;
  }
} 