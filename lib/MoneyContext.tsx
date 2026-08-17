import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type TransactionType = 'income' | 'expense';

export type MoneyTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
};

export type Budget = {
  category: string;
  limit: number;
};

type NewTransaction = Omit<MoneyTransaction, 'id' | 'date'>;

type MoneyContextValue = {
  transactions: MoneyTransaction[];
  budgets: Budget[];
  hydrated: boolean;
  hideBalance: boolean;
  modalVisible: boolean;
  modalType: TransactionType;
  monthlyGoal: number;
  addTransaction: (transaction: NewTransaction) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (category: string, limit: number) => void;
  setMonthlyGoal: (amount: number) => void;
  setHideBalance: (hidden: boolean) => void;
  openAddModal: (type?: TransactionType) => void;
  closeAddModal: () => void;
  clearTransactions: () => void;
  restoreDemoData: () => void;
};

const STORAGE_KEY = '@mafixxmoney/data/v1';

const nowMinus = (days: number, hours = 0) =>
  new Date(Date.now() - days * 86400000 - hours * 3600000).toISOString();

const makeDemoTransactions = (): MoneyTransaction[] => [
  { id: 'demo-1', type: 'income', amount: 420000, category: 'Salary', note: 'Monthly salary', date: nowMinus(5) },
  { id: 'demo-2', type: 'expense', amount: 18500, category: 'Food', note: 'Groceries', date: nowMinus(0, 2) },
  { id: 'demo-3', type: 'expense', amount: 6200, category: 'Transport', note: 'Fuel top-up', date: nowMinus(1) },
  { id: 'demo-4', type: 'income', amount: 75000, category: 'Freelance', note: 'Design project', date: nowMinus(2) },
  { id: 'demo-5', type: 'expense', amount: 32500, category: 'Bills', note: 'Electricity and data', date: nowMinus(3) },
  { id: 'demo-6', type: 'expense', amount: 14800, category: 'Shopping', note: 'Household items', date: nowMinus(4) },
  { id: 'demo-7', type: 'expense', amount: 4500, category: 'Food', note: 'Lunch', date: nowMinus(6) },
];

const defaultBudgets: Budget[] = [
  { category: 'Food', limit: 90000 },
  { category: 'Transport', limit: 50000 },
  { category: 'Bills', limit: 80000 },
  { category: 'Shopping', limit: 60000 },
  { category: 'Health', limit: 40000 },
];

const MoneyContext = createContext<MoneyContextValue | undefined>(undefined);

export function MoneyProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<MoneyTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>(defaultBudgets);
  const [monthlyGoal, setGoal] = useState(100000);
  const [hideBalance, setHideBalanceState] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('expense');

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!mounted) return;
        if (saved) {
          const parsed = JSON.parse(saved);
          setTransactions(Array.isArray(parsed.transactions) ? parsed.transactions : makeDemoTransactions());
          setBudgets(Array.isArray(parsed.budgets) ? parsed.budgets : defaultBudgets);
          setGoal(typeof parsed.monthlyGoal === 'number' ? parsed.monthlyGoal : 100000);
          setHideBalanceState(Boolean(parsed.hideBalance));
        } else {
          setTransactions(makeDemoTransactions());
        }
      })
      .catch(() => setTransactions(makeDemoTransactions()))
      .finally(() => mounted && setHydrated(true));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ transactions, budgets, monthlyGoal, hideBalance }),
    ).catch(() => undefined);
  }, [transactions, budgets, monthlyGoal, hideBalance, hydrated]);

  const addTransaction = useCallback((transaction: NewTransaction) => {
    const item: MoneyTransaction = {
      ...transaction,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
    };
    setTransactions((current) => [item, ...current]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateBudget = useCallback((category: string, limit: number) => {
    setBudgets((current) => current.map((item) => (item.category === category ? { ...item, limit } : item)));
  }, []);

  const openAddModal = useCallback((type: TransactionType = 'expense') => {
    setModalType(type);
    setModalVisible(true);
  }, []);

  const closeAddModal = useCallback(() => setModalVisible(false), []);
  const setMonthlyGoal = useCallback((amount: number) => setGoal(amount), []);
  const setHideBalance = useCallback((hidden: boolean) => setHideBalanceState(hidden), []);
  const clearTransactions = useCallback(() => setTransactions([]), []);
  const restoreDemoData = useCallback(() => {
    setTransactions(makeDemoTransactions());
    setBudgets(defaultBudgets);
    setGoal(100000);
  }, []);

  const value = useMemo(
    () => ({
      transactions,
      budgets,
      hydrated,
      hideBalance,
      modalVisible,
      modalType,
      monthlyGoal,
      addTransaction,
      deleteTransaction,
      updateBudget,
      setMonthlyGoal,
      setHideBalance,
      openAddModal,
      closeAddModal,
      clearTransactions,
      restoreDemoData,
    }),
    [
      transactions,
      budgets,
      hydrated,
      hideBalance,
      modalVisible,
      modalType,
      monthlyGoal,
      addTransaction,
      deleteTransaction,
      updateBudget,
      setMonthlyGoal,
      setHideBalance,
      openAddModal,
      closeAddModal,
      clearTransactions,
      restoreDemoData,
    ],
  );

  return <MoneyContext.Provider value={value}>{children}</MoneyContext.Provider>;
}

export function useMoney() {
  const context = useContext(MoneyContext);
  if (!context) throw new Error('useMoney must be used inside MoneyProvider');
  return context;
}

export function formatNaira(amount: number, compact = false) {
  if (compact) {
    if (Math.abs(amount) >= 1000000) return `₦${(amount / 1000000).toFixed(1)}m`;
    if (Math.abs(amount) >= 1000) return `₦${(amount / 1000).toFixed(0)}k`;
  }
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

export function isCurrentMonth(date: string) {
  const itemDate = new Date(date);
  const current = new Date();
  return itemDate.getMonth() === current.getMonth() && itemDate.getFullYear() === current.getFullYear();
}
