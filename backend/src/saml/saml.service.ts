import { BadRequestException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { User } from '../../generated/prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import samlp from 'samlp';
import { PrismaService } from '../prisma/prisma.service';
import { NAME_ID_FORMAT } from '../users/user.mapper';
import { SamlLoginDto } from './dto';
import { ProfileMapper, SamlProfile } from './profile-mapper';

@Injectable()
export class SamlService implements OnModuleInit {
  private cert = '';
  private key = '';

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const certPath = path.resolve(process.cwd(), process.env.IDP_CERT_PATH || 'certs/idp-public-cert.pem');
    const keyPath = path.resolve(process.cwd(), process.env.IDP_KEY_PATH || 'certs/idp-private-key.pem');
    this.cert = fs.readFileSync(certPath, 'utf8');
    this.key = fs.readFileSync(keyPath, 'utf8');
  }

  async beginSso(req: Request, res: Response) {
    samlp.parseRequest(req, async (err, data) => {
      if (err) {
        res.redirect(this.frontendUrl(`/login?error=${encodeURIComponent('The SAML request could not be read')}`));
        return;
      }
      const relayState = String(req.query.RelayState || req.body?.RelayState || '');
      const request = await this.prisma.samlRequest.create({
        data: {
          samlId: data?.id,
          issuer: data?.issuer,
          acsUrl: data?.assertionConsumerServiceURL,
          relayState,
          forceAuthn: data?.forceAuthn === 'true',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
      res.redirect(this.frontendUrl(`/login?requestId=${request.id}`));
    });
  }

  async login(dto: SamlLoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const settings = await this.prisma.settings.findUnique({ where: { id: 'default' } });
    if (!settings) throw new BadRequestException('IdP settings are not configured');

    const pending = dto.requestId
      ? await this.prisma.samlRequest.findUnique({ where: { id: dto.requestId } })
      : null;
    if (dto.requestId && (!pending || pending.consumedAt || pending.expiresAt < new Date())) {
      throw new BadRequestException('This sign-in request has expired. Start again from your application.');
    }

    const acsUrl = (settings.allowRequestAcsUrl && pending?.acsUrl) || settings.acsUrl;
    if (!acsUrl) throw new BadRequestException('Assertion consumer URL is not configured');

    const sessionIndex = randomBytes(16).toString('hex');
    const profile = this.profileFromUser(user);
    const xml = await this.createResponse(settings, profile, {
      acsUrl,
      inResponseTo: pending?.samlId || undefined,
      sessionIndex,
    });

    if (pending) {
      await this.prisma.samlRequest.update({
        where: { id: pending.id },
        data: { consumedAt: new Date() },
      });
    }

    return {
      acsUrl,
      relayState: pending?.relayState || settings.relayState || '',
      samlResponse: Buffer.from(xml).toString('base64'),
    };
  }

  metadata(req: Request, res: Response) {
    return this.prisma.settings.findUnique({ where: { id: 'default' } }).then((settings) => {
      if (!settings) {
        res.status(500).send('IdP settings are not configured');
        return;
      }
      samlp.metadata({
        issuer: settings.issuer,
        cert: this.cert,
        key: this.key,
        profileMapper: ProfileMapper,
        redirectEndpointPath: '/saml/sso',
        postEndpointPath: '/saml/sso',
        logoutEndpointPaths: {},
      })(req, res);
    });
  }

  private createResponse(
    settings: {
      issuer: string;
      audience: string;
      signResponse: boolean;
      digestAlgorithm: string;
      signatureAlgorithm: string;
      lifetimeInSeconds: number;
      authnContextClassRef: string;
    },
    profile: SamlProfile,
    extra: { acsUrl: string; inResponseTo?: string; sessionIndex: string },
  ) {
    return new Promise<string>((resolve, reject) => {
      samlp.getSamlResponse({
        issuer: settings.issuer,
        cert: this.cert,
        key: this.key,
        audience: settings.audience,
        recipient: extra.acsUrl,
        destination: extra.acsUrl,
        inResponseTo: extra.inResponseTo,
        nameIdentifierFormat: NAME_ID_FORMAT,
        digestAlgorithm: settings.digestAlgorithm,
        signatureAlgorithm: settings.signatureAlgorithm,
        signResponse: settings.signResponse,
        lifetimeInSeconds: settings.lifetimeInSeconds,
        authnContextClassRef: settings.authnContextClassRef,
        includeAttributeNameFormat: true,
        sessionIndex: extra.sessionIndex,
        profileMapper: ProfileMapper,
        getPostURL: (_audience: string, _dom: unknown, _req: unknown, callback: (err: Error | null, url?: string) => void) => {
          callback(null, extra.acsUrl);
        },
      }, profile as unknown as Record<string, unknown>, (err, xml) => {
        if (err || !xml) reject(err || new Error('Unable to create SAML response'));
        else resolve(xml);
      });
    });
  }

  private profileFromUser(user: User): SamlProfile {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
    };
  }

  private frontendUrl(pathWithQuery: string) {
    const base = (process.env.FRONTEND_URL || 'http://localhost:5174').replace(/\/$/, '');
    return `${base}${pathWithQuery}`;
  }

}
