import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  // email - required, unique, email format, not empty
  @IsEmail({}, { message: 'Email should be valid.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email: string;

  // password - required, not empty
  @IsString()
  // @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @IsNotEmpty({ message: 'Password should not be empty.' })
  password: string;

  // name - optional, string
  @IsString()
  @IsOptional()
  name?: string;

  // phone - optional, string
  @IsString()
  @IsOptional()
  phone?: string;

  // role - optional, string
  @IsString()
  @IsOptional()
  role?: string;

  // status - optional, string
  @IsString()
  @IsOptional()
  status?: string;

  // address - optional, string
  @IsString()
  @IsOptional()
  address?: string;

  // country - optional, string
  @IsString()
  @IsOptional()
  country?: string;
} 