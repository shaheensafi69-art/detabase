'use client';

import React, { useState } from 'react';
import { X, Receipt, CheckCircle2 } from 'lucide-react';
import { DailyExpense, ExpenseCategory } from '@/types';
import { EXPENSE_CATEGORIES } from '@/lib/constants';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Partial<DailyExpense>) => Promise<void>;
}

export default function ExpenseModal({ isOpen, onClose, onSave }: ExpenseModalProps) {
  const [category, setCategory] = useState<ExpenseCategory>('food_tea');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [currency, setCurrency] = useState<'USD' | 'AFN'>('AFN');
  const [expenseDate, setExpenseDate] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setExpenseDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const [paidBy, setPaidBy] = useState('Office Accountant');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter an expense description');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        category,
        title,
        amount: Number(amount),
        currency,
        expense_date: expenseDate,
        paid_by: paidBy,
        payment_method: paymentMethod,
        notes,
      });
      onClose();
    } catch (err: any) {
      alert('Error recording expense: ' + (err.message || 'Database error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Receipt size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
                Record Daily Office Expense
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Rent, electricity, internet, staff lunch, tea & supplies
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Category */}
          <div className="form-group">
            <label className="form-label">Expense Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="form-select"
              style={{ fontWeight: 600 }}
            >
              {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((key) => (
                <option key={key} value={key}>
                  {EXPENSE_CATEGORIES[key].title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Description / Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Generator Fuel / Staff Lunch / Internet Bill"
              className="form-input"
            />
          </div>

          {/* Amount & Currency Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="form-input"
                style={{ fontSize: '16px', fontWeight: 700, color: '#fb7185' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'USD' | 'AFN')}
                className="form-select"
                style={{ fontWeight: 700 }}
              >
                <option value="AFN">AFN (؋)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {/* Date & Paid By */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Paid By</label>
              <input
                type="text"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Receipt number, store name, etc."
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ background: '#f43f5e' }}>
              <CheckCircle2 size={16} />
              {loading ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
