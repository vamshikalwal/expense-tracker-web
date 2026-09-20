import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../utils/format";
import { Button } from "../components/common/UI";

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-brand">
          <span className="brand-mark">
            <Wallet size={18} />
          </span>{" "}
          Expense Tracker
        </div>
        <div className="art-copy">
          <span className="pill light-pill">
            <Sparkles size={13} /> Your money, clarified
          </span>
          <h1>
            Make room for
            <br />
            <em>what matters.</em>
          </h1>
          <p>
            A calmer, more intentional way to understand your everyday spending.
          </p>
        </div>
        <div className="art-foot">
          <span>Private by design</span>
          <span>•</span>
          <span>Built for your next chapter</span>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-mobile-brand">
          <span className="brand-mark">
            <Wallet size={18} />
          </span>{" "}
          Expense Tracker
        </div>
        {children}
        <p className="auth-legal">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

function PasswordField({ register, name = "password", label = "Password" }) {
  const [show, setShow] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <div className="field-input has-action">
        <LockKeyhole size={17} />
        <input
          type={show ? "text" : "password"}
          placeholder="At least 8 characters"
          {...register(name, {
            required: "Password is required",
            minLength: { value: 6, message: "Use at least 6 characters" },
          })}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
  );
}

export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(form);
      navigate("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout>
      <div className="auth-content">
        <span className="auth-kicker">WELCOME BACK</span>
        <h2>Good to see you.</h2>
        <p className="auth-subtitle">Sign in to pick up where you left off.</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={submit} className="auth-form">
          <label className="field">
            <span>Email address</span>
            <div className="field-input">
              <Mail size={17} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </label>
          <PasswordField
            register={(name) => ({
              name,
              value: form.password,
              onChange: (e) => setForm({ ...form, password: e.target.value }),
            })}
          />
          <div className="form-row">
            <label className="check-label">
              <input type="checkbox" /> <span>Remember me</span>
            </label>
            <button type="button" className="link-button">
              Forgot password?
            </button>
          </div>
          <Button type="submit" loading={loading}>
            Sign in <ArrowRight size={16} />
          </Button>
        </form>
        <p className="auth-switch">
          New to Expense Tracker? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { isAuthenticated, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signUp(form);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout>
      <div className="auth-content">
        <span className="auth-kicker">START FRESH</span>
        <h2>Your money, your way.</h2>
        <p className="auth-subtitle">
          Set up your private financial workspace in a minute.
        </p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={submit} className="auth-form">
          <label className="field">
            <span>Your name</span>
            <div className="field-input">
              <UserRound size={17} />
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alex Morgan"
              />
            </div>
          </label>
          <label className="field">
            <span>Email address</span>
            <div className="field-input">
              <Mail size={17} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </label>
          <PasswordField
            register={(name) => ({
              name,
              value: form.password,
              onChange: (e) => setForm({ ...form, password: e.target.value }),
            })}
          />
          <Button type="submit" loading={loading}>
            Create workspace <ArrowRight size={16} />
          </Button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
