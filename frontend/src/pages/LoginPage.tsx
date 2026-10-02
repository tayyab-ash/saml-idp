import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { ErrorText, PrimaryButton } from '../components/ui';

function postToServiceProvider(acsUrl: string, samlResponse: string, relayState: string) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = acsUrl;
  const response = document.createElement('input');
  response.type = 'hidden';
  response.name = 'SAMLResponse';
  response.value = samlResponse;
  const relay = document.createElement('input');
  relay.type = 'hidden';
  relay.name = 'RelayState';
  relay.value = relayState;
  form.append(response, relay);
  document.body.append(form);
  form.submit();
}

export function LoginPage() {
  const [params] = useSearchParams();
  const requestId = params.get('requestId') || undefined;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const login = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ acsUrl: string; samlResponse: string; relayState: string }>('/saml/login', {
        email,
        password,
        requestId,
      });
      return data;
    },
    onSuccess: (data) => {
      setLeaving(true);
      postToServiceProvider(data.acsUrl, data.samlResponse, data.relayState);
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    login.mutate();
  }

  return (
    <main className="flex min-h-screen flex-col items-center overflow-auto bg-idp px-4 pb-10 pt-7">
      <p className="mb-4 w-full max-w-[440px] rounded-[3px] border border-[#c9a24a] bg-[#fbf4e2] px-3 py-2.5 text-[12.5px] leading-snug text-[#6b4e0a]">
        <strong className="font-semibold">Sign in.</strong> Use the email and password an administrator created for this identity provider.
      </p>
      <section className="w-full max-w-[440px] overflow-hidden rounded border border-line bg-white shadow-card" aria-label="Sign in">
        <header className="bg-navy px-[22px] py-4 text-white">
          <strong className="block text-[15px] font-semibold">Standard Chartered Bank</strong>
          <span className="mt-0.5 block text-[11px] uppercase tracking-[0.08em] text-white/70">Identity provider</span>
        </header>
        <div className="px-[22px] pb-[18px] pt-[22px]">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mb-[18px] mt-1.5 text-mute">Sign in with your work account to continue.</p>
          <form className="flex flex-col gap-3.5" onSubmit={submit}>
            <ErrorText message={params.get('error') || undefined} />
            <ErrorText message={login.error?.message} />
            <label className="flex flex-col gap-1.5 text-[13px] font-medium" htmlFor="email">
              Email or username
              <input
                id="email"
                className="h-10 rounded-[3px] border border-line bg-white px-2.5 font-normal text-ink outline-none focus:border-navy"
                type="email"
                autoComplete="username"
                spellCheck={false}
                placeholder="name@standardchartered.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-medium" htmlFor="password">
              Password
              <span className="relative block">
                <input
                  id="password"
                  className="h-10 w-full rounded-[3px] border border-line bg-white px-2.5 pr-16 font-normal text-ink outline-none focus:border-navy"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-10 px-3 text-xs text-mute"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>
            <PrimaryButton wide disabled={login.isPending || leaving}>
              {leaving ? 'Signing in…' : 'Sign in'}
            </PrimaryButton>
          </form>
          <p className="mt-4 text-xs leading-snug text-mute">
            Accounts are created by an administrator. Multi-factor authentication is not part of this sign-in.
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line2 px-[22px] pb-4 pt-3 text-[12.5px]">
          <Link className="text-link hover:underline" to="/admin/login">
            Administrator sign in
          </Link>
          <span className="text-mute">Identity provider</span>
        </div>
      </section>
    </main>
  );
}
