import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api, PublicUser } from '../api';
import { PageHeader, Panel } from '../components/ui';

export function UsersPage() {
  const queryClient = useQueryClient();
  const users = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<PublicUser[]>('/users')).data,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div>
      <PageHeader
        title="Users"
        description="Each user receives a NameID when the account is created. Sign-in uses email and password."
        action={
          <Link to="/admin/users/new" className="inline-flex h-[30px] items-center whitespace-nowrap rounded-[3px] border border-navy bg-navy px-3.5 text-[13.5px] font-medium text-white hover:bg-navyhov">
            New user
          </Link>
        }
      />
      {remove.error && <p className="mb-3 rounded-[3px] bg-dangerbg px-2.5 py-2 text-[12.5px] text-danger">{remove.error.message}</p>}
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="h-10 border-b border-line bg-panel px-3.5 font-semibold text-mute">Username</th>
                <th className="h-10 border-b border-line bg-panel px-3.5 font-semibold text-mute">Email</th>
                <th className="h-10 border-b border-line bg-panel px-3.5 font-semibold text-mute">NameID</th>
                <th className="h-10 border-b border-line bg-panel px-3.5 text-right font-semibold text-mute"></th>
              </tr>
            </thead>
            <tbody>
              {users.data?.map((user) => (
                <tr key={user.id} className="hover:bg-panel">
                  <td className="h-10 whitespace-nowrap border-b border-line2 px-3.5">{user.username}</td>
                  <td className="h-10 whitespace-nowrap border-b border-line2 px-3.5">{user.email}</td>
                  <td className="h-10 max-w-[180px] truncate border-b border-line2 px-3.5 font-mono text-xs text-mute" title={user.id}>{user.id}</td>
                  <td className="h-10 whitespace-nowrap border-b border-line2 px-3.5 text-right">
                    <Link className="text-link" to={`/admin/users/${user.id}`}>
                      Edit
                    </Link>
                    {!user.isAdmin && (
                      <button className="ml-3 text-danger" onClick={() => remove.mutate(user.id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.data?.length === 0 && <p className="px-3.5 py-6 text-mute">No users yet.</p>}
        </div>
      </Panel>
    </div>
  );
}
