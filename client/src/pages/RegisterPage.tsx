import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
};

function validateRegisterForm(name: string, email: string, password: string) {
  const errors: RegisterErrors = {};

  if (name.trim().length < 2) {
    errors.name = "Enter at least 2 characters for your name.";
  }

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!email.trim().includes("@")) {
    errors.email = "Email must include @ symbol.";
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  } else if (!/[a-z]/.test(password)) {
    errors.password = "Password must include a lowercase letter.";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Password must include an uppercase letter.";
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errors.password = "Password must include a symbol.";
  }

  return errors;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateRegisterForm(name, email, password);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      toast.success("Account created and signed in");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
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
            <h1 className="text-xl font-semibold text-ink">Create your account</h1>
            <p className="text-sm text-neutral-500">Start building dynamic forms.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Name
            <input
              className={[
                "focus-ring rounded-md border px-3 py-2",
                errors.name ? "border-coral bg-coral/5" : "border-neutral-200"
              ].join(" ")}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              required
            />
            {errors.name ? <span className="text-sm font-medium text-coral">{errors.name}</span> : null}
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Email
            <input
              className={[
                "focus-ring rounded-md border px-3 py-2",
                errors.email ? "border-coral bg-coral/5" : "border-neutral-200"
              ].join(" ")}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              required
            />
            {errors.email ? <span className="text-sm font-medium text-coral">{errors.email}</span> : null}
          </label>
          <label className="grid gap-1 text-sm font-medium text-neutral-700">
            Password
            <input
              className={[
                "focus-ring rounded-md border px-3 py-2",
                errors.password ? "border-coral bg-coral/5" : "border-neutral-200"
              ].join(" ")}
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              minLength={6}
              required
            />
            {errors.password ? <span className="text-sm font-medium text-coral">{errors.password}</span> : null}
          </label>
          <p className="text-xs text-neutral-500">
            Password must include uppercase, lowercase, and a symbol. After creating the account, you will be
            signed in with this same email and password.
          </p>
          <button
            disabled={loading}
            className="focus-ring rounded-md bg-ocean px-4 py-3 text-sm font-semibold text-white hover:bg-ocean/90 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-neutral-500">
          Already registered?{" "}
          <Link className="font-semibold text-ocean hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
