import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const settings = await this.prisma.settings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      throw new Error('IdP settings are not seeded');
    }
    const base = (process.env.PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, '');
    return {
      ...settings,
      endpoints: {
        sso: `${base}/saml/sso`,
        metadata: `${base}/metadata`,
      },
    };
  }

  update(dto: UpdateSettingsDto) {
    return this.prisma.settings.update({
      where: { id: 'default' },
      data: {
        issuer: dto.issuer,
        acsUrl: dto.acsUrl,
        audience: dto.audience,
        serviceProviderId: dto.serviceProviderId || dto.audience,
        relayState: dto.relayState || '',
        signResponse: dto.signResponse,
        digestAlgorithm: dto.digestAlgorithm,
        signatureAlgorithm: dto.signatureAlgorithm,
        lifetimeInSeconds: dto.lifetimeInSeconds,
        authnContextClassRef: dto.authnContextClassRef,
        allowRequestAcsUrl: dto.allowRequestAcsUrl,
      },
    });
  }
}
