import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate((location.state as { from?: string } | null)?.from || "/dashboard", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-neutral-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-ink text-white">
            <FileText size={20} />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-ink">Sign in to FormCraft</h1>
            <p className="text-sm text-neutral-500">Manage forms, responses, and analytics.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Email
            <input
              className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Password
            <input
              className="focus-ring rounded-md border border-neutral-200 px-3 py-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button
            disabled={loading}
            className="focus-ring rounded-md bg-ocean px-4 py-3 text-sm font-semibold text-white hover:bg-ocean/90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-neutral-500">
          Need an account?{" "}
          <Link className="font-semibold text-ocean hover:underline" to="/register">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}

