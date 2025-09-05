import { IsString, IsEmail, IsOptional } from 'class-validator';

export class FindUserDto {
  @IsEmail({}, { message: 'enter valid email' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;
} 