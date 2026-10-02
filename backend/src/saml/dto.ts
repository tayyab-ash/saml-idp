import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class SamlLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;

  @IsOptional()
  @IsUUID()
  requestId?: string;
}
