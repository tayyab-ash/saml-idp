import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @MinLength(1)
  issuer: string;

  @IsString()
  @MinLength(1)
  acsUrl: string;

  @IsString()
  @MinLength(1)
  audience: string;

  @IsOptional()
  @IsString()
  serviceProviderId?: string;

  @IsOptional()
  @IsString()
  relayState?: string;

  @IsBoolean()
  signResponse: boolean;

  @IsIn(['sha1', 'sha256'])
  digestAlgorithm: string;

  @IsIn(['rsa-sha1', 'rsa-sha256'])
  signatureAlgorithm: string;

  @IsInt()
  @Min(60)
  lifetimeInSeconds: number;

  @IsString()
  @MinLength(1)
  authnContextClassRef: string;

  @IsBoolean()
  allowRequestAcsUrl: boolean;
}
