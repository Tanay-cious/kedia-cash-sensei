import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";
import { parseTransactionText } from "@/lib/transaction-parser";
import { supabase } from "@/integrations/supabase/client";

export type Category = 
  | "Food" 
  | "Transport" 
  | "Shopping" 
  | "Entertainment" 
  | "Bills" 
  | "Health" 
  | "Education" 
  | "Lent"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Education",
  "Lent",
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
  isLoading: boolean;
  addTransaction: (transactionText: string, overrideDate?: Date, transactionType?: string) => Promise<void>;
  editTransaction: (id: string, updatedTransaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  getCategoryTotals: (startDate?: Date, endDate?: Date) => Record<Category, number>;
  fetchTransactions: () => Promise<void>;
};

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  isLoading: false,
  addTransaction: async () => {},
  editTransaction: async () => {},
  deleteTransaction: async () => {},
  getTransactionsByDateRange: () => [],
  getCategoryTotals: () => ({} as Record<Category, number>),
  fetchTransactions: async () => {},
});

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Fetch transactions when user authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [isAuthenticated, user]);

  const fetchTransactions = async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }

      // Convert the data to match our Transaction type
      const formattedTransactions: Transaction[] = data.map(t => ({
        id: t.id,
        amount: Number(t.amount),
        description: t.description,
        category: t.category as Category,
        date: new Date(t.date),
        userId: t.user_id
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transactionText: string, overrideDate?: Date, transactionType: string = "debit") => {
    if (!user) {
      toast.error("Please log in to add transactions");
      return;
    }

    try {
      const { amount: parsedAmount, description, category, date } = parseTransactionText(transactionText);
      const transactionDate = overrideDate || date;
      
      // Determine the sign of the amount based on transaction type
      // For now we'll just store this in the amount itself
      const amount = transactionType === "debit" 
        ? -Math.abs(parsedAmount)  // Make negative for debit
        : Math.abs(parsedAmount);  // Keep positive for credit
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          { 
            amount, 
            description, 
            category, 
            date: transactionDate.toISOString(),
            user_id: user.id
          }
        ])
        .select()
        .single();
      
      if (error) {
        throw error;
      }

      const newTransaction: Transaction = {
        id: data.id,
        amount: Number(data.amount),
        description: data.description,
        category: data.category as Category,
        date: new Date(data.date),
        userId: data.user_id
      };

      setTransactions(prev => [newTransaction, ...prev]);
      toast.success("Transaction added successfully");
    } catch (error: any) {
      console.error("Failed to add transaction:", error);
      toast.error(error.message || "Failed to add transaction. Please check your input.");
    }
  };

  const editTransaction = async (id: string, updatedTransaction: Partial<Transaction>) => {
    if (!user) {
      toast.error("Please log in to edit transactions");
      return;
    }

    try {
      // Convert any Date objects to ISO strings for the database
      const dataToUpdate: any = { ...updatedTransaction };
      
      if (dataToUpdate.date instanceof Date) {
        dataToUpdate.date = dataToUpdate.date.toISOString();
      }
      
      // Remove userId from the update payload if present (use user_id for DB)
      if (dataToUpdate.userId) {
        delete dataToUpdate.userId;
      }

      // Convert field names to match database schema
      if (dataToUpdate.userId) {
        dataToUpdate.user_id = dataToUpdate.userId;
        delete dataToUpdate.userId;
      }

      const { error } = await supabase
        .from('transactions')
        .update(dataToUpdate)
        .eq('id', id);
      
      if (error) {
        throw error;
      }

      // Update the local state with the updated transaction
      setTransactions(prev =>
        prev.map(t =>
          t.id === id 
            ? { 
                ...t, 
                ...updatedTransaction,
                // Ensure date is a Date object
                date: updatedTransaction.date || t.date 
              } 
            : t
        )
      );
      
      toast.success("Transaction updated");
    } catch (error: any) {
      console.error("Failed to update transaction:", error);
      toast.error(error.message || "Failed to update transaction");
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) {
      toast.error("Please log in to delete transactions");
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success("Transaction deleted");
    } catch (error: any) {
      console.error("Failed to delete transaction:", error);
      toast.error(error.message || "Failed to delete transaction");
    }
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
        isLoading,
        addTransaction,
        editTransaction,
        deleteTransaction,
        getTransactionsByDateRange,
        getCategoryTotals,
        fetchTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
