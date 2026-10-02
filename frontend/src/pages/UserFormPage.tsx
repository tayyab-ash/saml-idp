import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, PublicUser } from '../api';
import { ErrorText, Field, inputClass, PageHeader, Panel, PrimaryButton } from '../components/ui';

export function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const existing = useQuery({
    queryKey: ['user', id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get<PublicUser>(`/users/${id}`)).data,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!existing.data) return;
    setEmail(existing.data.email);
    setFirstName(existing.data.firstName);
    setLastName(existing.data.lastName);
    setUsername(existing.data.username);
  }, [existing.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        email,
        firstName,
        lastName,
        username,
        ...(password ? { password } : {}),
      };
      if (id) return (await api.patch<PublicUser>(`/users/${id}`, payload)).data;
      return (await api.post<PublicUser>('/users', { ...payload, password })).data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/users');
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <div>
      <PageHeader
        title={id ? 'Edit user' : 'New user'}
        action={
          <Link to="/admin/users" className="text-link">
            Back
          </Link>
        }
      />
      {existing.data && (
        <p className="mb-3 rounded-[3px] bg-linkbg px-3 py-2 font-mono text-xs text-link">NameID {existing.data.id}</p>
      )}
      <Panel className="p-3.5">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <div className="md:col-span-2"><ErrorText message={save.error?.message} /></div>
        <Field label="Email">
          <input className={inputClass} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label={id ? 'New password' : 'Password'}>
          <input className={inputClass} type="password" required={!id} minLength={id ? undefined : 8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={id ? 'Leave blank to keep the current password' : ''} />
        </Field>
        <Field label="First name">
          <input className={inputClass} required value={firstName} onChange={(event) => setFirstName(event.target.value)} />
        </Field>
        <Field label="Last name">
          <input className={inputClass} required value={lastName} onChange={(event) => setLastName(event.target.value)} />
        </Field>
        <Field label="Username">
          <input className={inputClass} required value={username} onChange={(event) => setUsername(event.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <PrimaryButton disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save user'}</PrimaryButton>
        </div>
      </form>
      </Panel>
    </div>
  );
}
