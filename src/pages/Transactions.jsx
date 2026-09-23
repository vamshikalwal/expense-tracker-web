import { useEffect, useState } from "react";
import {
  ArrowDownUp,
  CalendarDays,
  Edit3,
  Filter,
  Plus,
  Receipt,
  Search,
  Trash2,
} from "lucide-react";
import {
  deleteTransaction,
  filterTransactions,
  getTransactions,
  createTransaction,
  updateTransaction,
} from "../api/transactionApi";
import { getBanks } from "../api/bankApi";
import { getCards } from "../api/cardApi";
import {
  asList,
  errorMessage,
  money,
  shortDate,
  todayKey,
} from "../utils/format";
import {
  Button,
  EmptyState,
  ErrorState,
  Modal,
  PlusButton,
} from "../components/common/UI";

const emptyForm = {
  paymentName: "",
  amount: "",
  date: todayKey(),
  category: "Shopping",
  paymentType: "CARD",
  cardId: "",
  bankId: "",
};
export default function Transactions() {
  const [items, setItems] = useState([]);
  const [banks, setBanks] = useState([]);
  const [cards, setCards] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    search: "",
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const load = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const hasDate = filters.startDate || filters.endDate;
      const result = hasDate
        ? await filterTransactions({
            startDate: filters.startDate,
            endDate: filters.endDate,
          })
        : await getTransactions({ page: nextPage, size: 10 });
      setItems(asList(result));
      setTotalPages(result?.totalPages || 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    Promise.all([getBanks(), getCards()])
      .then(([b, c]) => {
        setBanks(asList(b));
        setCards(asList(c));
      })
      .catch(() => {});
    load(0);
  }, []);
  const openCreate = () => {
    setForm(emptyForm);
    setModal("create");
  };
  const openEdit = (tx) => {
    setForm({ ...tx, cardId: tx.cardId || "", bankId: tx.bankId || "" });
    setModal(tx);
  };
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        paymentName: form.paymentName,
        amount: Number(form.amount),
        date: form.date,
        category: form.category,
        paymentType: form.paymentType,
      };
      if (form.cardId) payload.cardId = Number(form.cardId);
      if (form.bankId) payload.bankId = Number(form.bankId);
      if (modal === "create") await createTransaction(payload);
      else await updateTransaction(modal.id, payload);
      setModal(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await deleteTransaction(id);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };
  const displayed = items.filter(
    (item) =>
      !filters.search ||
      (item.paymentName || "")
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      (item.category || "")
        .toLowerCase()
        .includes(filters.search.toLowerCase()),
  );
  return (
    <div className="page-stack">
      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search transactions"
          />
        </div>
        <div className="filter-group">
          <label className="date-filter">
            <CalendarDays size={15} />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
            <span>to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </label>
          <button className="filter-button" onClick={() => load(0)}>
            <Filter size={16} /> Apply
          </button>
        </div>
        <PlusButton onClick={openCreate}>Add transaction</PlusButton>
      </div>
      {error && <ErrorState message={error} onRetry={() => load()} />}
      <div className="table-card">
        <div className="table-head">
          <div>
            <span className="overline">ALL ACTIVITY</span>
            <h2>Every transaction</h2>
          </div>
          <button className="icon-button">
            <ArrowDownUp size={17} />
          </button>
        </div>
        {loading ? (
          <div className="loading-state">Loading activity...</div>
        ) : displayed.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Payment</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th className="align-right">Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {displayed.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div className="table-payment">
                        <span className="tx-icon tone-0">
                          <span>{(tx.paymentName || "T").charAt(0)}</span>
                        </span>
                        <strong>{tx.paymentName || "Untitled payment"}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="tag">{tx.category || "Other"}</span>
                    </td>
                    <td>{shortDate(tx.date)}</td>
                    <td>
                      <span className="payment-type">
                        {tx.paymentType || "—"}
                      </span>
                    </td>
                    <td className="align-right amount-cell">
                      − {money(tx.amount)}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => openEdit(tx)} aria-label="Edit">
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => remove(tx.id)}
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ReceiptIcon}
            title="No transactions yet"
            message="Add your first expense to start seeing your spending clearly."
            action={
              <Button icon={Plus} onClick={openCreate}>
                Add transaction
              </Button>
            }
          />
        )}
        <div className="pagination">
          <span>Showing {displayed.length} transactions</span>
          <div>
            <button
              disabled={page === 0}
              onClick={() => {
                setPage(page - 1);
                load(page - 1);
              }}
            >
              Previous
            </button>
            <b>{page + 1}</b>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => {
                setPage(page + 1);
                load(page + 1);
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {modal && (
        <Modal
          title={modal === "create" ? "Add transaction" : "Edit transaction"}
          subtitle="Keep the details crisp and current."
          onClose={() => setModal(null)}
        >
          <form className="modal-form" onSubmit={submit}>
            <div className="form-grid">
              <Field
                label="Payment name"
                value={form.paymentName}
                onChange={(v) => setForm({ ...form, paymentName: v })}
                placeholder="Amazon"
              />
              <Field
                label="Amount"
                type="number"
                value={form.amount}
                onChange={(v) => setForm({ ...form, amount: v })}
                placeholder="0"
              />
              <Field
                label="Date"
                type="date"
                value={form.date}
                onChange={(v) => setForm({ ...form, date: v })}
              />
              <SelectField
                label="Category"
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                options={[
                  "Food",
                  "Shopping",
                  "Transport",
                  "Bills",
                  "Entertainment",
                  "Health",
                  "Other",
                ]}
              />
              <SelectField
                label="Payment type"
                value={form.paymentType}
                onChange={(v) =>
                  setForm({
                    ...form,
                    paymentType: v,
                    cardId: v === "CARD" ? form.cardId : "",
                    bankId: v === "BANK" ? form.bankId : "",
                  })
                }
                options={["CARD", "BANK"]}
              />
              {form.paymentType === "CARD" ? (
                <SelectField
                  label="Card"
                  value={form.cardId}
                  onChange={(v) => setForm({ ...form, cardId: v, bankId: "" })}
                  required
                  options={cards.map((card) => ({
                    label: card.name,
                    value: card.id,
                  }))}
                />
              ) : (
                <SelectField
                  label="Bank"
                  value={form.bankId}
                  onChange={(v) => setForm({ ...form, bankId: v, cardId: "" })}
                  required
                  options={banks.map((bank) => ({
                    label: bank.name,
                    value: bank.id,
                  }))}
                />
              )}
            </div>
            <div className="modal-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModal(null)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save transaction
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
const ReceiptIcon = () => <Receipt size={22} />;
function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        className="plain-input"
        required={label !== "Card" && label !== "Bank"}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
function SelectField({ label, value, onChange, options, required = false }) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <b className="required-mark"> *</b>}
      </span>
      <select
        className="plain-input"
        required={required}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option}>{option}</option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
