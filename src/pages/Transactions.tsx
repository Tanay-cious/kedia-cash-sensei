
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTransactions, Transaction } from "@/context/TransactionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TransactionItem from "@/components/TransactionItem";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const { transactions, addTransaction } = useTransactions();
  const [transactionText, setTransactionText] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionText.trim()) return;
    
    addTransaction(transactionText, selectedDate);
    setTransactionText("");
    setSelectedDate(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <div className="container max-w-md mx-auto pt-20 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Transactions</h1>
          
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  value={transactionText}
                  onChange={(e) => setTransactionText(e.target.value)}
                  placeholder="500 pizza parso"
                  className="flex-1"
                />
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-10 p-0",
                        selectedDate && "text-kedia-green-600"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setIsDatePickerOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Button type="submit" className="bg-kedia-green-600 hover:bg-kedia-green-700">Add</Button>
              </div>
              {selectedDate && (
                <div className="text-xs text-kedia-green-600">
                  Using custom date: {format(selectedDate, "MMM d, yyyy")}
                </div>
              )}
            </form>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
              Please login to add and view transactions
            </div>
          )}
        </div>

        {user && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">
              {transactions.length > 0 ? "Recent Transactions" : "No transactions yet"}
            </h2>
            
            <div className="space-y-2">
              {transactions.map((transaction: Transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Transactions;
