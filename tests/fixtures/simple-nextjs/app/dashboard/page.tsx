import { UserCard } from '../../components/UserCard';
import { getUsers } from '../../lib/auth';
export default async function Dashboard() {
  const users = await getUsers();
  return <div>{users.map(u => <UserCard key={u.id} user={u} />)}</div>;
}
