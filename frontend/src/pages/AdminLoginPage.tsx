import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../api';
import { ErrorText, PrimaryButton } from '../components/ui';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ accessToken: string }>('/auth/admin/login', { email, password });
      return data;
    },
    onSuccess: (data) => {
      setToken(data.accessToken);
      navigate('/admin/users');
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    login.mutate();
  }

  return (
    <main className="flex min-h-screen flex-col items-center overflow-auto bg-idp px-4 pb-10 pt-7">
      <section className="mt-4 w-full max-w-[440px] overflow-hidden rounded border border-line bg-white shadow-card" aria-label="Admin sign in">
        <header className="bg-navy px-[22px] py-4 text-white">
          <strong className="block text-[15px] font-semibold">Admin Portal</strong>
          <span className="mt-0.5 block text-[11px] uppercase tracking-[0.08em] text-white/70">Identity provider</span>
        </header>
        <div className="px-[22px] pb-[18px] pt-[22px]">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mb-[18px] mt-1.5 text-mute">Sign in with your administrator account to manage users and settings.</p>
          <form className="flex flex-col gap-3.5" onSubmit={submit}>
            <ErrorText message={login.error?.message} />
            <label className="flex flex-col gap-1.5 text-[13px] font-medium" htmlFor="admin-email">
              Email or username
              <input
                id="admin-email"
                className="h-10 rounded-[3px] border border-line bg-white px-2.5 font-normal text-ink outline-none focus:border-navy"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-medium" htmlFor="admin-password">
              Password
              <span className="relative block">
                <input
                  id="admin-password"
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
            <PrimaryButton wide disabled={login.isPending}>
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </PrimaryButton>
          </form>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line2 px-[22px] pb-4 pt-3 text-[12.5px]">
          <Link className="text-link hover:underline" to="/login">
            Cancel and return
          </Link>
          <span className="text-mute">Admin portal</span>
        </div>
      </section>
    </main>
  );
}
