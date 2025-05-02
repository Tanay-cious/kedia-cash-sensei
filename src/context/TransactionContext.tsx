
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";
import { parseTransactionText } from "@/lib/transaction-parser";

export type Category = 
  | "Food" 
  | "Transport" 
  | "Shopping" 
  | "Entertainment" 
  | "Bills" 
  | "Health" 
  | "Education" 
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Education",
  "Other",
];

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: Date;
  userId: string;
};

type TransactionContextType = {
  transactions: Transaction[];
  addTransaction: (transactionText: string, overrideDate?: Date) => void;
  editTransaction: (id: string, updatedTransaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  getCategoryTotals: (startDate?: Date, endDate?: Date) => Record<Category, number>;
};

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  addTransaction: () => {},
  editTransaction: () => {},
  deleteTransaction: () => {},
  getTransactionsByDateRange: () => [],
  getCategoryTotals: () => ({} as Record<Category, number>),
});

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();

  // Load transactions from localStorage when component mounts or user changes
  useEffect(() => {
    if (user) {
      const storedTransactions = localStorage.getItem(`kedia_transactions_${user.id}`);
      if (storedTransactions) {
        try {
          // Parse the stored transactions and convert date strings back to Date objects
          const parsedTransactions = JSON.parse(storedTransactions).map((t: any) => ({
            ...t,
            date: new Date(t.date)
          }));
          setTransactions(parsedTransactions);
        } catch (error) {
          console.error("Failed to parse stored transactions:", error);
          localStorage.removeItem(`kedia_transactions_${user.id}`);
        }
      }
    } else {
      // Clear transactions when user logs out
      setTransactions([]);
    }
  }, [user]);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (user && transactions.length > 0) {
      localStorage.setItem(`kedia_transactions_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  const addTransaction = (transactionText: string, overrideDate?: Date) => {
    if (!user) {
      toast.error("Please log in to add transactions");
      return;
    }

    try {
      const { amount, description, category, date } = parseTransactionText(transactionText);
      
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        amount,
        description,
        category,
        date: overrideDate || date,
        userId: user.id,
      };

      setTransactions(prev => [newTransaction, ...prev]);
      toast.success("Transaction added successfully");
    } catch (error) {
      toast.error("Failed to add transaction. Please check your input.");
    }
  };

  const editTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    if (!user) {
      toast.error("Please log in to edit transactions");
      return;
    }

    setTransactions(prev =>
      prev.map(t =>
        t.id === id ? { ...t, ...updatedTransaction } : t
      )
    );
    toast.success("Transaction updated");
  };

  const deleteTransaction = (id: string) => {
    if (!user) {
      toast.error("Please log in to delete transactions");
      return;
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success("Transaction deleted");
  };

  const getTransactionsByDateRange = (startDate: Date, endDate: Date): Transaction[] => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const getCategoryTotals = (startDate?: Date, endDate?: Date): Record<Category, number> => {
    const relevantTransactions = startDate && endDate 
      ? getTransactionsByDateRange(startDate, endDate)
      : transactions;

    return relevantTransactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {} as Record<Category, number>);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        getTransactionsByDateRange,
        getCategoryTotals,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
