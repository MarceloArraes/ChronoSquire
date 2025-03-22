"use client";

interface User {
  id: string;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  console.log("user", user);
  return (
    <div>
      <h2>Welcome, {user?.name}!</h2>
      {/* <img src={user.image ?? ""} alt="User Profile" width={50} height={50} /> */}
      <p>Email: {user?.email}</p>
      {/* Add your dashboard content here */}
    </div>
  );
}
