declare module 'samlp' {
  import { Request, Response } from 'express';

  export interface ParsedAuthnRequest {
    id?: string;
    issuer?: string;
    destination?: string;
    assertionConsumerServiceURL?: string;
    forceAuthn?: string;
  }

  export function parseRequest(
    req: Request,
    callback: (err: Error | null, data?: ParsedAuthnRequest) => void,
  ): void;

  export function getSamlResponse(
    options: Record<string, unknown>,
    user: Record<string, unknown>,
    callback: (err: Error | null, xml?: string) => void,
  ): void;

  export function metadata(options: Record<string, unknown>): (req: Request, res: Response) => void;
}
