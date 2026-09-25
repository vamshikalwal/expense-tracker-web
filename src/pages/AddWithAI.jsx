import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CircleHelp, CreditCard, Landmark, LoaderCircle, Receipt, Sparkles, WandSparkles } from "lucide-react";
import { createBank, getBanks } from "../api/bankApi";
import { createCard, getCards } from "../api/cardApi";
import { createTransaction } from "../api/transactionApi";
import { asList, errorMessage, money, todayKey } from "../utils/format";

const examples = [
  "Spent 450 at Amazon using HDFC Bank",
  "Paid 1200 for groceries with my ICICI card",
  "Add 250 Uber paid from Axis Bank",
];

function findAmount(text) {
  const match = text.match(/(?:₹|rs\.?|inr\s*)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  return match ? Number(match[1].replace(/,/g, "")) : "";
}

function findPaymentName(text) {
  const match = text.match(/(?:at|to|for)\s+(.+?)(?=\s+(?:using|with|from|via)\b|$)/i);
  return match ? match[1].trim().replace(/[.,]+$/, "") : "";
}

function findAccount(text, accounts) {
  const normalized = text.toLowerCase();
  return accounts.find((account) => normalized.includes((account.name || "").toLowerCase()));
}

function findAccountDraft(text) {
  const typeMatch = text.match(/\b(credit\s+card|card|bank)\b/i);
  if (!typeMatch) return null;
  const accountType = typeMatch[1].toLowerCase().includes("card") ? "CARD" : "BANK";
  const name = text
    .replace(/^\s*(add|create|save)\s+(?:a\s+)?/i, "")
    .replace(/\b(credit\s+card|card|bank)\b/i, "")
    .replace(/\b(account|named|called)\b/gi, "")
    .replace(/^[\s:,-]+|[\s.,-]+$/g, "")
    .trim();
  return name ? { accountType, name } : null;
}

export default function AddWithAI() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("transaction");
  const [banks, setBanks] = useState([]);
  const [cards, setCards] = useState([]);
  const [draft, setDraft] = useState(null);
  const [accountDraft, setAccountDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getBanks(), getCards()])
      .then(([bankResult, cardResult]) => {
        setBanks(asList(bankResult));
        setCards(asList(cardResult));
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const accounts = useMemo(() => [
    ...banks.map((account) => ({ ...account, paymentType: "BANK" })),
    ...cards.map((account) => ({ ...account, paymentType: "CARD" })),
  ], [banks, cards]);

  const understandPrompt = () => {
    setMessage("");
    setError("");
    setLoading(true);
    if (mode === "account") {
      const nextAccount = findAccountDraft(prompt);
      if (!nextAccount) {
        setError("Please include whether you want to add a bank or card, plus its name.");
        setLoading(false);
        return;
      }
      setAccountDraft(nextAccount);
      setLoading(false);
      return;
    }
    const amount = findAmount(prompt);
    const paymentName = findPaymentName(prompt);
    const account = findAccount(prompt, accounts);
    if (!amount || !paymentName || !account) {
      const missing = [!amount && "an amount", !paymentName && "a payment name", !account && "a bank or card name"].filter(Boolean);
      setError(`Please include ${missing.join(", ")} in your message.`);
      setLoading(false);
      return;
    }
    setDraft({ paymentName, amount, date: todayKey(), category: "Other", accountId: account.id, accountName: account.name, paymentType: account.paymentType });
    setLoading(false);
  };

  const saveAccount = async () => {
    setSaving(true);
    setError("");
    try {
      const create = accountDraft.accountType === "BANK" ? createBank : createCard;
      await create({ name: accountDraft.name });
      setAccountDraft(null);
      setPrompt("");
      setMessage(`${accountDraft.accountType === "BANK" ? "Bank" : "Card"} added successfully.`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveTransaction = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        paymentName: draft.paymentName,
        amount: Number(draft.amount),
        date: draft.date,
        category: draft.category,
        paymentType: draft.paymentType,
        ...(draft.paymentType === "CARD" ? { cardId: Number(draft.accountId) } : { bankId: Number(draft.accountId) }),
      };
      await createTransaction(payload);
      setDraft(null);
      setPrompt("");
      setMessage("Transaction added successfully.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ai-page">
      <section className="ai-intro">
        <div className="ai-kicker"><Sparkles size={15} /> QUICK ENTRY</div>
        <h2>Tell me what you spent.</h2>
        <p>Describe the expense naturally. I will prepare the transaction for your review.</p>
      </section>
      <section className="ai-composer">
        <div className="ai-modes" role="tablist" aria-label="AI entry type"><button className={mode === "transaction" ? "active" : ""} onClick={() => { setMode("transaction"); setPrompt(""); setError(""); setAccountDraft(null); }}><Receipt size={15} /> Add transaction</button><button className={mode === "account" ? "active" : ""} onClick={() => { setMode("account"); setPrompt(""); setError(""); setDraft(null); }}><Landmark size={15} /> Add bank or card</button></div>
        <div className="ai-composer-header"><div className="ai-avatar">{mode === "account" ? <Landmark size={18} /> : <WandSparkles size={18} />}</div><div><strong>{mode === "account" ? "New bank or card" : "New transaction"}</strong><span>{mode === "account" ? "Tell me what payment account to connect" : "Include amount, payment name, and bank or card"}</span></div></div>
        <textarea value={prompt} onChange={(event) => { setPrompt(event.target.value); setError(""); setMessage(""); }} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") understandPrompt(); }} placeholder={mode === "account" ? "e.g. Add HDFC Bank" : "e.g. Spent 450 at Amazon using HDFC Bank"} rows={4} aria-label={mode === "account" ? "Describe the bank or card to add" : "Describe your transaction"} />
        <div className="ai-composer-footer"><span><CircleHelp size={14} /> We will ask before saving</span><button className="ai-submit" onClick={understandPrompt} disabled={!prompt.trim() || loading}>{loading ? <LoaderCircle className="spin" size={16} /> : <ArrowRight size={16} />} Understand</button></div>
      </section>
      <div className="ai-examples"><span>Try an example</span>{(mode === "account" ? ["Add HDFC Bank", "Create Visa Platinum card"] : examples).map((example) => <button key={example} onClick={() => setPrompt(example)}>{example}</button>)}</div>
      {error && <div className="ai-alert error">{error}</div>}
      {message && <div className="ai-alert success"><Check size={16} /> {message}</div>}
      {draft && <section className="ai-review"><div className="ai-review-heading"><div><span className="overline">READY TO SAVE</span><h3>Does this look right?</h3></div><span className="ai-check"><Check size={17} /></span></div><div className="ai-review-grid"><ReviewItem label="Payment" value={draft.paymentName} /><ReviewItem label="Amount" value={money(draft.amount)} /><ReviewItem label={draft.paymentType === "CARD" ? "Card" : "Bank"} value={draft.accountName} /><label className="ai-review-item"><span>Category</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{["Food", "Shopping", "Transport", "Bills", "Entertainment", "Health", "Other"].map((category) => <option key={category}>{category}</option>)}</select></label></div><div className="ai-review-actions"><button className="ai-edit" onClick={() => setDraft(null)}>Edit prompt</button><button className="ai-save" onClick={saveTransaction} disabled={saving}>{saving ? "Saving..." : "Add transaction"}</button></div></section>}
      {accountDraft && <section className="ai-review"><div className="ai-review-heading"><div><span className="overline">READY TO SAVE</span><h3>Add this {accountDraft.accountType === "BANK" ? "bank" : "card"}?</h3></div><span className="ai-check">{accountDraft.accountType === "BANK" ? <Landmark size={17} /> : <CreditCard size={17} />}</span></div><div className="ai-review-grid"><ReviewItem label="Type" value={accountDraft.accountType === "BANK" ? "Bank" : "Card"} /><ReviewItem label="Name" value={accountDraft.name} /></div><div className="ai-review-actions"><button className="ai-edit" onClick={() => setAccountDraft(null)}>Edit prompt</button><button className="ai-save" onClick={saveAccount} disabled={saving}>{saving ? "Saving..." : `Add ${accountDraft.accountType === "BANK" ? "bank" : "card"}`}</button></div></section>}
    </div>
  );
}

function ReviewItem({ label, value }) {
  return <div className="ai-review-item"><span>{label}</span><strong>{value}</strong></div>;
}