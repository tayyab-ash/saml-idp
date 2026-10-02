import { config } from 'dotenv';
import 'reflect-metadata';

config({ path: '.env', override: true });
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: true,
    name: 'idp_sid',
    cookie: { maxAge: 15 * 60 * 1000 },
  }));
  app.enableCors({
    origin: frontendOrigins(),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`SAML IdP API listening on ${process.env.PUBLIC_URL || `http://localhost:${port}`}`);
}

bootstrap();

function frontendOrigins(): string[] {
  const configured = process.env.FRONTEND_URL || 'http://localhost:5174';
  const url = new URL(configured);
  const origins = new Set([url.origin]);
  if (url.hostname === 'localhost') origins.add(url.origin.replace('localhost', '127.0.0.1'));
  if (url.hostname === '127.0.0.1') origins.add(url.origin.replace('127.0.0.1', 'localhost'));
  return [...origins];
}
