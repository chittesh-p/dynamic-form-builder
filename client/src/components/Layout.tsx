import { FileText, LayoutDashboard, LogOut, Plus } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
    isActive ? "bg-ink text-white" : "text-neutral-600 hover:bg-white hover:text-ink"
  ].join(" ");

export function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="focus-ring flex items-center gap-2 rounded-md text-left"
          >
            <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-white">
              <FileText size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">FormCraft</span>
              <span className="block text-xs text-neutral-500">Builder platform</span>
            </span>
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard size={16} />
              Dashboard
            </NavLink>
            <button
              onClick={() => navigate("/forms/new")}
              className="focus-ring flex items-center gap-2 rounded-md bg-coral px-3 py-2 text-sm font-semibold text-white hover:bg-coral/90"
            >
              <Plus size={16} />
              New form
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink">{user?.name}</p>
              <p className="text-xs text-neutral-500">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="focus-ring rounded-md border border-neutral-200 bg-white p-2 text-neutral-600 hover:text-ink"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

