import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, AUTH_CONTEXTS, Settings } from '../api';
import { ErrorText, Field, inputClass, PageHeader, Panel, PrimaryButton } from '../components/ui';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get<Settings>('/settings')).data,
  });
  const [form, setForm] = useState<Settings | null>(null);

  useEffect(() => {
    if (settings.data) setForm(settings.data);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form) return;
      await api.put('/settings', {
        issuer: form.issuer,
        acsUrl: form.acsUrl,
        audience: form.audience,
        serviceProviderId: form.serviceProviderId,
        relayState: form.relayState,
        signResponse: form.signResponse,
        digestAlgorithm: form.digestAlgorithm,
        signatureAlgorithm: form.signatureAlgorithm,
        lifetimeInSeconds: Number(form.lifetimeInSeconds),
        authnContextClassRef: form.authnContextClassRef,
        allowRequestAcsUrl: form.allowRequestAcsUrl,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  if (!form) return <p className="text-mute">Loading settings…</p>;

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm({ ...form!, [key]: value });
  }

  return (
    <div>
      <PageHeader title="Settings" description="One service provider is configured here. Give these endpoints to that application." />
      <Panel className="mb-3">
        <h2 className="flex items-center justify-between rounded-t-[3px] border-b border-line bg-panel px-3.5 py-3 text-[13px] font-semibold">Endpoints</h2>
        <dl>
          <Endpoint label="SSO" value={form.endpoints.sso} />
          <Endpoint label="Metadata" value={form.endpoints.metadata} />
        </dl>
      </Panel>
      <Panel className="p-3.5">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <div className="md:col-span-2"><ErrorText message={save.error?.message} /></div>
        {save.isSuccess && <p className="md:col-span-2 rounded-[3px] bg-okbg px-2.5 py-2 text-[12.5px] text-ok">Settings saved.</p>}
        <Field label="Issuer">
          <input className={inputClass} required value={form.issuer} onChange={(event) => set('issuer', event.target.value)} />
        </Field>
        <Field label="Audience URI">
          <input className={inputClass} required value={form.audience} onChange={(event) => set('audience', event.target.value)} />
        </Field>
        <Field label="Service provider issuer">
          <input className={inputClass} value={form.serviceProviderId} onChange={(event) => set('serviceProviderId', event.target.value)} />
        </Field>
        <Field label="Assertion consumer URL">
          <input className={inputClass} required type="url" value={form.acsUrl} onChange={(event) => set('acsUrl', event.target.value)} />
        </Field>
        <Field label="Default relay state">
          <input className={inputClass} value={form.relayState} onChange={(event) => set('relayState', event.target.value)} />
        </Field>
        <Field label="Signature algorithm">
          <select className={inputClass} value={form.signatureAlgorithm} onChange={(event) => set('signatureAlgorithm', event.target.value)}>
            <option value="rsa-sha256">RSA-SHA256</option>
            <option value="rsa-sha1">RSA-SHA1</option>
          </select>
        </Field>
        <Field label="Digest algorithm">
          <select className={inputClass} value={form.digestAlgorithm} onChange={(event) => set('digestAlgorithm', event.target.value)}>
            <option value="sha256">SHA256</option>
            <option value="sha1">SHA1</option>
          </select>
        </Field>
        <Field label="Sign response">
          <select className={inputClass} value={String(form.signResponse)} onChange={(event) => set('signResponse', event.target.value === 'true')}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </Field>
        <Field label="Allow ACS URL from the request">
          <select className={inputClass} value={String(form.allowRequestAcsUrl)} onChange={(event) => set('allowRequestAcsUrl', event.target.value === 'true')}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </Field>
        <Field label="Assertion lifetime (seconds)">
          <input className={inputClass} type="number" min={60} required value={form.lifetimeInSeconds} onChange={(event) => set('lifetimeInSeconds', Number(event.target.value))} />
        </Field>
        <Field label="Authentication context">
          <select className={inputClass} value={form.authnContextClassRef} onChange={(event) => set('authnContextClassRef', event.target.value)}>
            {AUTH_CONTEXTS.map((value) => <option key={value} value={value}>{value.split(':').pop()}</option>)}
          </select>
        </Field>
        <div className="md:col-span-2">
          <PrimaryButton disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save settings'}</PrimaryButton>
        </div>
      </form>
      </Panel>
    </div>
  );
}

function Endpoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line2 px-3.5 py-[9px] last:border-b-0">
      <dt className="text-mute">{label}</dt>
      <dd className="min-w-0 truncate font-mono text-xs">{value}</dd>
    </div>
  );
}
