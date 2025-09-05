import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ description: 'User name', required: false })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'User address', required: false })
  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'User country', required: false })
  @IsString({ message: 'Country must be a string' })
  @IsOptional()
  country?: string;
}
