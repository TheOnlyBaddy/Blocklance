import { NavLink } from "react-router-dom";

export default function DashboardSidebar({ role = "freelancer" }) {
  const freelancerLinks = [
    { name: "Dashboard", path: "/dashboard/freelancer" },
    { name: "My Gigs", path: "/dashboard/freelancer/my-gigs" },
    { name: "Proposals", path: "/dashboard/freelancer/proposals" },
    { name: "Messages", path: "/dashboard/freelancer/messages" },
    { name: "Payments", path: "/dashboard/freelancer/payments" },
    { name: "Account Settings", path: "/settings" },
  ];

  const clientLinks = [
    { name: "Dashboard", path: "/dashboard/client" },
    { name: "My Projects", path: "/dashboard/client/my-projects" },
    { name: "Proposals", path: "/dashboard/client/proposals" },
    { name: "Messages", path: "/dashboard/client/messages" },
    { name: "Payments", path: "/dashboard/client/payments" },
    { name: "Account Settings", path: "/settings" },
  ];

  const links = role === "client" ? clientLinks : freelancerLinks;

  return (
    <aside className="w-64 bg-white/60 backdrop-blur-xl border border-gray-100 p-4 rounded-2xl shadow-md">
      <nav className="flex flex-col space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end
            className={({ isActive }) =>
              `block text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100/60"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
