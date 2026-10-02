import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { api, clearToken, getToken, PublicUser } from '../api';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');
  return letters.join('') || 'AD';
}

export function AdminLayout() {
  const navigate = useNavigate();
  const token = getToken();
  const me = useQuery({
    queryKey: ['me'],
    enabled: Boolean(token),
    queryFn: async () => (await api.get<PublicUser>('/auth/admin/me')).data,
    retry: false,
  });

  if (!token || me.isError) {
    clearToken();
    return <Navigate to="/admin/login" replace />;
  }

  if (!me.data) {
    return <p className="p-10 text-sm text-mute">Loading…</p>;
  }

  function signOut() {
    clearToken();
    navigate('/login');
  }

  return (
    <div className="grid h-screen grid-cols-1 grid-rows-[48px_minmax(0,1fr)] bg-canvas md:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="row-span-2 hidden overflow-auto border-r border-line bg-side pb-4 text-sidetext md:block">
        <div className="mb-1.5 flex h-12 items-center border-b border-sidebd px-[18px]">
          <span className="flex flex-col text-sm font-semibold leading-tight text-white">
            Admin Portal
            <small className="mt-0.5 text-[9.5px] font-normal uppercase tracking-[0.14em] text-white/65">Identity provider</small>
          </span>
        </div>
        <h6 className="mx-[18px] mb-1.5 mt-5 text-xs font-semibold text-sidemute">Manage</h6>
        <SideLink to="/admin/users">Users</SideLink>
        <SideLink to="/admin/settings">Settings</SideLink>
      </aside>
      <header className="flex items-center gap-2.5 border-b border-line bg-white px-4 md:px-6">
        <nav className="flex gap-1 md:hidden">
          <MobileLink to="/admin/users">Users</MobileLink>
          <MobileLink to="/admin/settings">Settings</MobileLink>
        </nav>
        <span className="flex-1" />
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-navy text-[11px] font-semibold text-white">{initials(me.data.username)}</span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[13px] font-medium">{me.data.username}</span>
            <small className="block text-[11px] text-mute">{me.data.email}</small>
          </span>
          <button type="button" className="h-[30px] rounded-[3px] border border-line bg-white px-2.5 text-[12.5px] hover:bg-panel" onClick={signOut}>
            Log out
          </button>
        </div>
      </header>
      <main className="overflow-auto px-4 py-6 md:px-8 md:pb-10 md:pt-[26px]">
        <Outlet />
      </main>
    </div>
  );
}

function MobileLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-[3px] px-2.5 py-1 text-[13px] ${isActive ? 'bg-navy font-semibold text-white' : 'text-ink hover:bg-panel'}`
      }
    >
      {children}
    </NavLink>
  );
}

function SideLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block border-l-[3px] px-[18px] py-1.5 text-[13.5px] no-underline ${
          isActive ? 'border-sidetext bg-navy font-semibold text-white' : 'border-transparent text-sidetext hover:bg-sidehov'
        } md:border-l-[3px]`
      }
    >
      {children}
    </NavLink>
  );
}
