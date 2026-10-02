import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

const TOKEN_KEY = 'saml_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) error.message = message.join(', ');
    else if (typeof message === 'string') error.message = message;
    return Promise.reject(error);
  },
);

export interface PublicUser {
  id: string;
  email: string;
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  username: string;
  createdAt: string;
}

export interface Settings {
  issuer: string;
  acsUrl: string;
  audience: string;
  serviceProviderId: string;
  relayState: string;
  signResponse: boolean;
  digestAlgorithm: string;
  signatureAlgorithm: string;
  lifetimeInSeconds: number;
  authnContextClassRef: string;
  allowRequestAcsUrl: boolean;
  endpoints: {
    sso: string;
    metadata: string;
  };
}

export const AUTH_CONTEXTS = [
  'urn:oasis:names:tc:SAML:2.0:ac:classes:InternetProtocol',
  'urn:oasis:names:tc:SAML:2.0:ac:classes:InternetProtocolPassword',
  'urn:oasis:names:tc:SAML:2.0:ac:classes:Password',
  'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
  'urn:oasis:names:tc:SAML:2.0:ac:classes:X509',
  'urn:oasis:names:tc:SAML:2.0:ac:classes:unspecified',
];
