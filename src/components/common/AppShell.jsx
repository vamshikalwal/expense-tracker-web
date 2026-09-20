import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronRight,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  Receipt,
  Settings,
  Wallet,
  X,
  Landmark,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", to: "/transactions", icon: Receipt },
  { label: "Budgets", to: "/budgets", icon: Wallet },
  { label: "Reports", to: "/reports", icon: PieChart },
];
const manage = [
  { label: "Banks", to: "/banks", icon: Landmark },
  { label: "Cards", to: "/cards", icon: CreditCard },
];

function Sidebar({ onClose }) {
  const { user, signOut } = useAuth();
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Wallet size={17} />
        </span>
        <span>
          Expense Tracker
        </span>
      </div>
      <div className="sidebar-scroll">
        <p className="nav-label">Workspace</p>
        <nav>
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Overview" && (
                <span className="nav-chevron">
                  <ChevronRight size={14} />
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <p className="nav-label manage-label">Manage</p>
        <nav>
          {manage.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <p className="nav-label manage-label">Account</p>
        <nav>
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>
      <div className="sidebar-footer">
        <div className="profile-mini">
          <div className="avatar">
            {user?.avatar ? <img src={user.avatar} alt="" /> : (user?.name || user?.email || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user?.name || "Your account"}</strong>
            <span>{user?.email || "Personal workspace"}</span>
          </div>
          <button
            className="icon-button subtle"
            aria-label="Sign out"
            onClick={signOut}
          >
            <LogOut size={16} />
          </button>
        </div>
        <div className="sidebar-note">
          <span className="status-dot" /> All systems operational
        </div>
      </div>
      {onClose && (
        <button
          className="mobile-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      )}
    </aside>
  );
}

export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const location = useLocation();
  const { user, signOut } = useAuth();
  useEffect(() => {
    const closeAccountMenu = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", closeAccountMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeAccountMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);
  const titles = {
    "/dashboard": ["Good morning", "Here is your financial overview."],
    "/transactions": ["Transactions", "Keep a clear view of every rupee."],
    "/budgets": ["Budgets", "Give every category a purpose."],
    "/reports": ["Reports", "Patterns become clear over time."],
    "/banks": ["Banks", "Your connected financial institutions."],
    "/cards": ["Cards", "Manage the cards you spend with."],
    "/settings": ["Settings", "Your workspace preferences."],
  };
  const [title, subtitle] = titles[location.pathname] || titles["/dashboard"];
  return (
    <div className="app-shell">
      <div className={`sidebar-wrap ${menuOpen ? "open" : ""}`}>
        <Sidebar onClose={() => setMenuOpen(false)} />
      </div>
      {menuOpen && (
        <div className="backdrop" onClick={() => setMenuOpen(false)} />
      )}
      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="page-heading">
            <div className="topbar-brand" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, color: "#292825", fontFamily: "Manrope, sans-serif", fontSize: 13, fontWeight: 700 }}>
              <span className="brand-mark"><Wallet size={15} /></span>
              <strong>Expense Tracker</strong>
            </div>
            <p className="eyebrow">
              {location.pathname === "/dashboard"
                ? "Saturday, 19 September 2026"
                : "Personal finance"}
            </p>
            <h1>
              {title}
              <span className="heading-period">.</span>
            </h1>
            <p>{subtitle}</p>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button notification"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <i />
            </button>
            <div className="account-menu-wrap" ref={accountRef}>
              <button
                className="account-trigger"
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
              >
                <span className="top-avatar">
                  {user?.avatar ? <img src={user.avatar} alt="" /> : (user?.name || user?.email || "A").charAt(0).toUpperCase()}
                </span>
                <ChevronDown size={14} />
              </button>
              {accountOpen && (
                <div className="account-menu">
                  <div className="account-menu-user">
                    <strong>{user?.name || "Your account"}</strong>
                    <span>{user?.email || "Personal workspace"}</span>
                  </div>
                  <NavLink to="/settings" onClick={() => setAccountOpen(false)} className="account-menu-link">
                    <Settings size={16} /> Profile settings
                  </NavLink>
                  <button className="account-menu-link account-logout" onClick={signOut}>
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
