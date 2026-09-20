import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Camera,
  CreditCard,
  Edit3,
  Landmark,
  MoreHorizontal,
  PieChart as PieIcon,
  Plus,
  Receipt,
  Trash2,
  Wallet,
} from "lucide-react";
import { getBanks, createBank, updateBank, deleteBank } from "../api/bankApi";
import {
  getCards,
  getCardTransactions,
  createCard,
  updateCard,
  deleteCard,
} from "../api/cardApi";
import { getBankTransactions } from "../api/bankApi";
import { getBudgets, createBudget } from "../api/budgetApi";
import {
  getSummary,
  getCategoryReport,
  getCardReport,
  getDailyReport,
  getBudgetSummary,
} from "../api/reportApi";
import {
  asList,
  errorMessage,
  money,
  monthKey,
  shortDate,
  todayKey,
} from "../utils/format";
import {
  Button,
  ConfirmModal,
  EmptyState,
  ErrorState,
  Modal,
  PlusButton,
  SectionHeader,
  StatCard,
} from "../components/common/UI";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { useAuth } from "../context/AuthContext";

function ManagePage({ kind }) {
  const isBank = kind === "banks";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [name, setName] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [relatedTransactions, setRelatedTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const api = isBank
    ? {
        get: getBanks,
        create: createBank,
        update: updateBank,
        remove: deleteBank,
      }
    : {
        get: getCards,
        create: createCard,
        update: updateCard,
        remove: deleteCard,
      };
  const load = () =>
    api
      .get()
      .then((r) => setItems(asList(r)))
      .catch((e) => setError(errorMessage(e)));
  useEffect(() => {
    load();
  }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      modal?.id
        ? await api.update(modal.id, { name })
        : await api.create({ name });
      setModal(null);
      setName("");
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  const remove = (item) => {
    setPendingDelete(item);
  };
  const confirmRemove = async () => {
    setDeleting(true);
    try {
      await api.remove(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setDeleting(false);
    }
  };
  const openTransactions = async (item) => {
    setSelectedItem(item);
    setRelatedTransactions([]);
    setTransactionsLoading(true);
    try {
      const result = await (isBank
        ? getBankTransactions(item.id)
        : getCardTransactions(item.id));
      setRelatedTransactions(asList(result));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setTransactionsLoading(false);
    }
  };
  const relatedTotal = relatedTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0,
  );
  return (
    <div className="page-stack">
      {error && <ErrorState message={error} onRetry={load} />}
      <div className="intro-row">
        <div>
          <span className="overline">YOUR FINANCIAL NETWORK</span>
          <h2>{isBank ? "Connected banks" : "Payment cards"}</h2>
          <p className="muted">
            {isBank
              ? "Keep your accounts organized in one calm view."
              : "Know which card is working hardest for you."}
          </p>
        </div>
        <PlusButton
          onClick={() => {
            setName("");
            setModal("new");
          }}
        >
          {isBank ? "Add bank" : "Add card"}
        </PlusButton>
      </div>
      <div className="entity-grid">
        {items.map((item, i) => (
          <div
            className={`entity-card ${isBank ? "bank-entity" : "card-entity"}`}
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => openTransactions(item)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openTransactions(item);
              }
            }}
          >
            <div className="entity-top">
              <span className="entity-icon">
                {isBank ? <Landmark size={21} /> : <CreditCard size={21} />}
              </span>
              <button className="icon-button dark-icon">
                <MoreHorizontal size={18} />
              </button>
            </div>
            <div className="entity-name">{item.name}</div>
            <div className="entity-meta">
              {isBank ? "Primary account" : `${i + 1} payment method`}{" "}
              <span>•••• {String(item.id || "2481").slice(-4)}</span>
            </div>
            <div className="entity-actions">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setModal(item);
                  setName(item.name);
                }}
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  remove(item);
                }}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
        {!items.length && (
          <EmptyState
            icon={isBank ? Landmark : CreditCard}
            title={`No ${isBank ? "banks" : "cards"} yet`}
            message={`Add a ${isBank ? "bank" : "card"} to connect your spending.`}
            action={
              <Button icon={Plus} onClick={() => setModal("new")}>
                Add {isBank ? "bank" : "card"}
              </Button>
            }
          />
        )}
      </div>
      {modal && (
        <Modal
          title={`${modal?.id ? "Edit" : "Add"} ${isBank ? "bank" : "card"}`}
          onClose={() => setModal(null)}
        >
          <form className="modal-form" onSubmit={save}>
            <label className="field">
              <span>Name</span>
              <input
                className="plain-input"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isBank ? "HDFC Bank" : "Visa Platinum"}
              />
            </label>
            <div className="modal-actions">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setModal(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Modal>
      )}
      {selectedItem && (
        <Modal
          title={`${selectedItem.name} transactions`}
          subtitle={`All spending linked to this ${isBank ? "bank" : "card"}.`}
          onClose={() => setSelectedItem(null)}
        >
          <div className="linked-summary">
            <span className="overline">TOTAL SPENDING</span>
            <strong>{transactionsLoading ? "Loading..." : money(relatedTotal)}</strong>
            <span>{relatedTransactions.length} transaction{relatedTransactions.length === 1 ? "" : "s"}</span>
          </div>
          {transactionsLoading ? (
            <div className="loading-state">Loading transactions...</div>
          ) : relatedTransactions.length ? (
            <div className="linked-transactions">
              {relatedTransactions.map((transaction, index) => (
                <div className="linked-transaction" key={transaction.id || index}>
                  <div className={`tx-icon tone-${index % 3}`}><Receipt size={17} /></div>
                  <div className="tx-main">
                    <strong>{transaction.paymentName || "Transaction"}</strong>
                    <span>{transaction.category || "Other"} · {shortDate(transaction.date)} · {transaction.paymentType || "—"}</span>
                  </div>
                  <strong className="tx-amount">− {money(transaction.amount)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              message={`No spending is linked to this ${isBank ? "bank" : "card"}.`}
            />
          )}
        </Modal>
      )}
      {pendingDelete && (
        <ConfirmModal
          title={`Delete this ${isBank ? "bank" : "card"}?`}
          message={`${pendingDelete.name} will be removed from your financial network.`}
          onClose={() => setPendingDelete(null)}
          onConfirm={confirmRemove}
          loading={deleting}
        />
      )}
    </div>
  );
}
export const BanksPage = () => <ManagePage kind="banks" />;
export const CardsPage = () => <ManagePage kind="cards" />;

export function BudgetsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    category: "Food",
    monthlyLimit: "",
    budgetMonth: monthKey(),
  });
  const load = () =>
    getBudgets(monthKey())
      .then((r) => setItems(asList(r)))
      .catch((e) => setError(errorMessage(e)));
  useEffect(() => {
    load();
  }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      await createBudget({ ...form, monthlyLimit: Number(form.monthlyLimit) });
      setModal(false);
      load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  return (
    <div className="page-stack">
      {error && <ErrorState message={error} onRetry={load} />}
      <div className="budget-hero">
        <div>
          <span className="overline">SEPTEMBER 2026</span>
          <h2>Spend with intention.</h2>
          <p>Set gentle boundaries that make your goals easier to reach.</p>
        </div>
        <PlusButton onClick={() => setModal(true)}>Set a budget</PlusButton>
      </div>
      <div className="budget-overview">
        <StatCard
          label="Total budget"
          value={items.reduce((sum, x) => sum + Number(x.monthlyLimit || 0), 0)}
          icon={Wallet}
        />
        <StatCard
          label="Spent this month"
          value={items.reduce(
            (sum, x) => sum + Number(x.spent || x.amountSpent || 0),
            0,
          )}
          tone="soft"
          icon={BarChart3}
        />
        <StatCard
          label="Categories on track"
          value={`${items.filter((x) => (x.percentage || 0) < 80).length}/${items.length || 0}`}
          tone="soft"
          icon={PieIcon}
        />
      </div>
      <div className="budget-list">
        <div className="section-header">
          <h2>Category budgets</h2>
          <span className="muted">Updated today</span>
        </div>
        {items.length ? (
          items.map((item, i) => {
            const spent = Number(item.spent || item.amountSpent || 0);
            const limit = Number(item.monthlyLimit || 1);
            const percent = Math.min(Math.round((spent / limit) * 100), 100);
            return (
              <div className="budget-row" key={item.id || i}>
                <div className="budget-category">
                  <span className={`budget-dot dot-${i % 4}`} />{" "}
                  <strong>{item.category}</strong>
                  <small>
                    {money(spent)} of {money(limit)}
                  </small>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <strong className="budget-percent">{percent}%</strong>
                <button className="icon-button">
                  <MoreHorizontal size={17} />
                </button>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={Wallet}
            title="No budgets set"
            message="Give your first category a monthly limit."
            action={
              <Button icon={Plus} onClick={() => setModal(true)}>
                Create budget
              </Button>
            }
          />
        )}
      </div>
      {modal && (
        <Modal
          title="Create a budget"
          subtitle="A little structure goes a long way."
          onClose={() => setModal(false)}
        >
          <form className="modal-form" onSubmit={save}>
            <label className="field">
              <span>Category</span>
              <select
                className="plain-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {[
                  "Food",
                  "Shopping",
                  "Transport",
                  "Bills",
                  "Entertainment",
                  "Health",
                  "Other",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Monthly limit</span>
              <input
                className="plain-input"
                type="number"
                required
                value={form.monthlyLimit}
                onChange={(e) =>
                  setForm({ ...form, monthlyLimit: e.target.value })
                }
                placeholder="25000"
              />
            </label>
            <label className="field">
              <span>Budget month</span>
              <input
                className="plain-input"
                type="date"
                value={form.budgetMonth}
                onChange={(e) =>
                  setForm({ ...form, budgetMonth: e.target.value })
                }
              />
            </label>
            <div className="modal-actions">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create budget</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function ReportsPage() {
  const [reports, setReports] = useState({
    summary: {},
    category: [],
    cards: [],
    daily: [],
    budgets: [],
  });
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      getSummary(),
      getCategoryReport(),
      getCardReport(),
      getDailyReport({ startDate: "2026-09-01", endDate: todayKey() }),
      getBudgetSummary(monthKey()),
    ])
      .then(([summary, category, cards, daily, budgets]) =>
        setReports({
          summary: summary || {},
          category: asList(category),
          cards: asList(cards),
          daily: asList(daily),
          budgets: asList(budgets),
        }),
      )
      .catch((e) => setError(errorMessage(e)));
  }, []);
  return (
    <div className="page-stack reports-page">
      {error && <ErrorState message={error} />}
      <div className="report-summary">
        <StatCard
          label="Total spending"
          value={reports.summary.totalExpense || reports.summary.total || 0}
          meta="September"
          icon={Wallet}
        />
        <StatCard
          label="Average daily"
          value={reports.summary.averageDaily || 0}
          meta="Across this period"
          tone="soft"
          icon={BarChart3}
        />
        <StatCard
          label="Transactions"
          value={reports.summary.transactionCount || 0}
          meta="Recorded this month"
          tone="soft"
          icon={BarChart3}
        />
      </div>
      <div className="report-grid">
        <div className="chart-card">
          <SectionHeader title="Category spending" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={reports.category}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid horizontal={false} stroke="#eeeae4" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                axisLine={false}
                tickLine={false}
                width={80}
                tick={{ fontSize: 11, fill: "#6d6a64" }}
              />
              <Tooltip formatter={(v) => money(v)} />
              <Bar
                dataKey={(x) => x.amount || x.total || x.value || 0}
                fill="#111"
                radius={[0, 5, 5, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <SectionHeader title="Spend by card" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={reports.cards}
                dataKey={(x) => x.amount || x.total || x.value || 1}
                nameKey="cardName"
                innerRadius={66}
                outerRadius={94}
                paddingAngle={3}
                stroke="none"
              >
                {reports.cards.map((_, i) => (
                  <Cell
                    key={i}
                    fill={["#111", "#a7c7b7", "#e2b86e", "#c8b9ea"][i % 4]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => money(v)} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card report-wide">
          <SectionHeader title="Daily trend" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={reports.daily}>
              <defs>
                <linearGradient id="reportFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#a7c7b7" stopOpacity=".65" />
                  <stop offset="1" stopColor="#a7c7b7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#eeeae4" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#777" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#777" }}
              />
              <Tooltip formatter={(v) => money(v)} />
              <Area
                type="monotone"
                dataKey={(x) => x.amount || x.total || x.value || 0}
                stroke="#5d8d78"
                fill="url(#reportFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
export function SettingsPage() {
  const { user, signOut, updateProfilePhoto } = useAuth();
  const [photoError, setPhotoError] = useState("");
  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Please choose an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfilePhoto(reader.result);
      setPhotoError("");
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="settings-page">
      <div className="settings-card">
        <div className="settings-avatar">{user?.avatar ? <img src={user.avatar} alt="Profile" /> : (user?.name || user?.email || "A").charAt(0).toUpperCase()}</div>
        <div>
          <span className="overline">PERSONAL PROFILE</span>
          <h2>{user?.name || "Your profile"}</h2>
          <p className="muted">{user?.email || "Your account details"}</p>
          <div className="profile-photo-actions">
            <label className="photo-action"><Camera size={14} /> {user?.avatar ? "Change photo" : "Add photo"}<input type="file" accept="image/*" onChange={handlePhotoChange} /></label>
            {user?.avatar && <button className="photo-remove" type="button" onClick={() => updateProfilePhoto(null)}>Remove</button>}
          </div>
          {photoError && <p className="photo-error">{photoError}</p>}
        </div>
      </div>
      <div className="settings-list">
        <div>
          <div>
            <strong>Workspace preferences</strong>
            <span>Personal finance, INR, Asia/Kolkata</span>
          </div>
          <ArrowUpRight size={16} />
        </div>
        <div>
          <div>
            <strong>Security & privacy</strong>
            <span>Your data stays yours</span>
          </div>
          <ArrowUpRight size={16} />
        </div>
        <button className="danger-row" onClick={signOut}>
          <div>
            <strong>Sign out</strong>
            <span>End this session</span>
          </div>
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}
