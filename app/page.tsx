'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart as PieIcon, 
  BarChart3, 
  Download, 
  Upload, 
  RefreshCw, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Tag, 
  FileText, 
  X, 
  AlertCircle,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Film,
  HeartPulse,
  Briefcase,
  Layers
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export interface Transaction {
  id: string;
  date: string;
  type: 'expense' | 'income';
  category: string;
  amount: number;
  note: string;
}

const CATEGORIES = [
  { name: 'Food & Dining', icon: Utensils, color: '#f59e0b', defaultBudget: 600 },
  { name: 'Transport', icon: Car, color: '#3b82f6', defaultBudget: 300 },
  { name: 'Utilities & Bills', icon: Zap, color: '#8b5cf6', defaultBudget: 400 },
  { name: 'Entertainment', icon: Film, color: '#ec4899', defaultBudget: 250 },
  { name: 'Health & Fitness', icon: HeartPulse, color: '#10b981', defaultBudget: 200 },
  { name: 'Shopping', icon: ShoppingBag, color: '#06b6d4', defaultBudget: 450 },
  { name: 'Salary & Income', icon: Briefcase, color: '#22c55e', defaultBudget: 0 },
  { name: 'Other', icon: Layers, color: '#64748b', defaultBudget: 200 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-08-18', type: 'income', category: 'Salary & Income', amount: 4200.00, note: 'Monthly Salary' },
  { id: '2', date: '2026-08-19', type: 'expense', category: 'Food & Dining', amount: 65.50, note: 'Grocery shopping at Whole Foods' },
  { id: '3', date: '2026-08-19', type: 'expense', category: 'Transport', amount: 45.00, note: 'Gas station refill' },
  { id: '4', date: '2026-08-20', type: 'expense', category: 'Utilities & Bills', amount: 120.00, note: 'High-speed Fiber Internet' },
  { id: '5', date: '2026-08-20', type: 'expense', category: 'Entertainment', amount: 24.99, note: 'Cinema tickets & popcorn' },
  { id: '6', date: '2026-08-20', type: 'expense', category: 'Shopping', amount: 189.90, note: 'Wireless noise-canceling headphones' },
  { id: '7', date: '2026-08-20', type: 'expense', category: 'Health & Fitness', amount: 60.00, note: 'Gym membership renewal' },
];

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'expense' | 'income',
    category: 'Food & Dining',
    amount: '',
    note: '',
  });

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Load from localStorage or set defaults
  useEffect(() => {
    const saved = localStorage.getItem('expense_tracker_data');
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        setTransactions(INITIAL_TRANSACTIONS);
      }
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('expense_tracker_data', JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  // Handle Add/Edit Transaction
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (editingId) {
      setTransactions(prev =>
        prev.map(t =>
          t.id === editingId
            ? {
                ...t,
                date: formData.date,
                type: formData.type,
                category: formData.category,
                amount: numAmount,
                note: formData.note || formData.category,
              }
            : t
        )
      );
    } else {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: formData.date,
        type: formData.type,
        category: formData.category,
        amount: numAmount,
        note: formData.note || formData.category,
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }

    closeModal();
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: 'Food & Dining',
      amount: '',
      note: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingId(t.id);
    setFormData({
      date: t.date,
      type: t.type,
      category: t.category,
      amount: t.amount.toString(),
      note: t.note,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleResetData = () => {
    if (confirm('Reset to initial sample transactions?')) {
      setTransactions(INITIAL_TRANSACTIONS);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type,
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.note.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expense_tracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations
  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const netBalance = totalIncome - totalExpense;

  // Category Pie Data
  const categoryPieData = useMemo(() => {
    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    return CATEGORIES.filter(c => c.name !== 'Salary & Income')
      .map(cat => ({
        name: cat.name,
        value: expensesByCategory[cat.name] || 0,
        color: cat.color,
      }))
      .filter(item => item.value > 0);
  }, [transactions]);

  // Category Budget Comparison Data
  const budgetComparisonData = useMemo(() => {
    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    return CATEGORIES.filter(c => c.defaultBudget > 0).map(cat => ({
      name: cat.name.split(' ')[0], // Short name for chart
      fullName: cat.name,
      Spent: expensesByCategory[cat.name] || 0,
      Budget: cat.defaultBudget,
      color: cat.color,
    }));
  }, [transactions]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch =
          t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
        const matchesType = selectedType === 'all' || t.type === selectedType;
        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, selectedCategory, selectedType, sortBy]);

  // Helper function to render category icon
  const renderCategoryIcon = (categoryName: string) => {
    const catObj = CATEGORIES.find(c => c.name === categoryName);
    const IconComponent = catObj ? catObj.icon : Layers;
    return (
      <div 
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105"
        style={{ backgroundColor: `${catObj?.color || '#64748b'}20`, color: catObj?.color || '#94a3b8' }}
      >
        <IconComponent className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                ExpenseTracker Pro
              </h1>
              <p className="text-xs text-slate-400">Vercel Deployable Financial Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition flex items-center space-x-2"
              title="Export as CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export CSV</span>
            </button>
            <button
              onClick={handleResetData}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition flex items-center space-x-2"
              title="Reset Sample Data"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">Reset</span>
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center space-x-2 transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Net Balance Card */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Net Balance</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-3xl font-extrabold tracking-tight ${netBalance >= 0 ? 'text-white glow-emerald' : 'text-rose-400 glow-rose'}`}>
                ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="mt-1 text-xs text-slate-400 flex items-center space-x-1">
                <span>{netBalance >= 0 ? 'Healthy surplus' : 'Deficit alert'}</span>
              </p>
            </div>
          </div>

          {/* Income Card */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total Income</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold tracking-tight text-emerald-400 glow-emerald">
                ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="mt-1 text-xs text-emerald-500/80">Inflow across all sources</p>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total Expenses</span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold tracking-tight text-rose-400 glow-rose">
                ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="mt-1 text-xs text-rose-500/80">Outflow across categories</p>
            </div>
          </div>
        </section>

        {/* Visual Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Doughnut Chart: Category Distribution */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <PieIcon className="w-4 h-4 text-violet-400" />
                  <span>Category Breakdown</span>
                </h3>
                <p className="text-xs text-slate-400">Share of total expenditures</p>
              </div>
            </div>

            <div className="h-64 w-full relative flex items-center justify-center my-auto">
              {categoryPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                        color: '#fff',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                      }}
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spent']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-500 text-sm">No expense data recorded yet</div>
              )}
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
              {categoryPieData.slice(0, 6).map((cat, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300 truncate">{cat.name}</span>
                  <span className="text-slate-500 font-mono ml-auto">${cat.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart: Budget vs Actual Spending */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Category Budget vs. Actual</span>
                </h3>
                <p className="text-xs text-slate-400">Comparing current spending against target budgets</p>
              </div>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar dataKey="Spent" fill="#ec4899" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Budget" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Transaction History & Management Section */}
        <section className="glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Transactions</h2>
              <p className="text-xs text-slate-400">View, search, filter, and manage your recent activity</p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search note or category..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="glass-input text-xs rounded-xl pl-9 pr-3 py-2 w-48 sm:w-56"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as any)}
                className="glass-input text-xs rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Types</option>
                <option value="expense" className="bg-slate-900">Expenses Only</option>
                <option value="income" className="bg-slate-900">Income Only</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="glass-input text-xs rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name} className="bg-slate-900">
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="glass-input text-xs rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="date-desc" className="bg-slate-900">Newest First</option>
                <option value="date-asc" className="bg-slate-900">Oldest First</option>
                <option value="amount-desc" className="bg-slate-900">Highest Amount</option>
                <option value="amount-asc" className="bg-slate-900">Lowest Amount</option>
              </select>
            </div>
          </div>

          {/* Transactions Table / List */}
          <div className="overflow-x-auto">
            {filteredTransactions.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    <th className="py-3 px-4">Transaction</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          {renderCategoryIcon(t.category)}
                          <div>
                            <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                              {t.note || t.category}
                            </div>
                            <div className="text-[10px] text-slate-400 capitalize">{t.type}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 border border-white/5">
                          {t.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {t.date}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                        <span className={t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                          {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                            title="Edit"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No transactions match your search criteria</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/15 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Transaction' : 'Add New Transaction'}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`py-2 text-xs font-semibold rounded-lg transition ${
                    formData.type === 'expense'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`py-2 text-xs font-semibold rounded-lg transition ${
                    formData.type === 'income'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Amount ($)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="glass-input w-full text-sm rounded-xl pl-9 pr-3 py-2.5 font-mono"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="glass-input w-full text-xs rounded-xl px-3 py-2.5 cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name} className="bg-slate-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="glass-input w-full text-xs rounded-xl px-3 py-2.5"
                />
              </div>

              {/* Note / Title */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Note / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Grocery shopping at Target"
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  className="glass-input w-full text-xs rounded-xl px-3 py-2.5"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25 transition"
                >
                  {editingId ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
