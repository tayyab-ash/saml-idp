import { ReactNode } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-medium text-ink">
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  'h-10 w-full rounded-[3px] border border-line bg-white px-2.5 text-[13.5px] font-normal text-ink outline-none focus:border-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-link';

export function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="rounded-[3px] bg-dangerbg px-2.5 py-2 text-[12.5px] text-danger">{message}</p>;
}

export function PrimaryButton({ children, disabled, wide = false }: { children: ReactNode; disabled?: boolean; wide?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-[3px] border border-navy bg-navy px-3.5 text-[13.5px] font-medium text-white hover:bg-navyhov disabled:cursor-not-allowed disabled:opacity-50 ${wide ? 'h-[38px] w-full' : 'h-[30px]'}`}
    >
      {children}
    </button>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[3px] border border-line bg-white ${className}`}>{children}</section>;
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-mute">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
