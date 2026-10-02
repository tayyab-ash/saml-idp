import { All, Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { SamlLoginDto } from './dto';
import { SamlService } from './saml.service';

@Controller()
export class SamlController {
  constructor(private readonly saml: SamlService) {}

  @All('saml/sso')
  sso(@Req() req: Request, @Res() res: Response) {
    return this.saml.beginSso(req, res);
  }

  @Post('saml/login')
  login(@Body() dto: SamlLoginDto) {
    return this.saml.login(dto);
  }

  @Get('metadata')
  metadata(@Req() req: Request, @Res() res: Response) {
    return this.saml.metadata(req, res);
  }
}
