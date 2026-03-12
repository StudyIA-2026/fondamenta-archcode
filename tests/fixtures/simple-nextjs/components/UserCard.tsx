interface User { id: string; name: string; }
export function UserCard({ user }: { user: User }) {
  return <div className="card">{user.name}</div>;
}
