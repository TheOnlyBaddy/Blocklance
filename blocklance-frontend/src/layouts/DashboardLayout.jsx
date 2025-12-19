import DashboardSidebar from "../components/DashboardSidebar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user } = useAuth(); // user.role = 'freelancer' or 'client'

  return (
    <div className="w-full flex justify-center py-8 px-4">
      <div className="flex gap-6 w-full max-w-7xl">
        <DashboardSidebar role={user?.role || "freelancer"} />
        <main className="flex-1 max-w-4xl">{children}</main>
      </div>
    </div>
  );
}
