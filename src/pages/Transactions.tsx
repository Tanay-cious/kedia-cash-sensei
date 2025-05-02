
import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTransactions, Transaction, CATEGORIES } from "@/context/TransactionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TransactionItem from "@/components/TransactionItem";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { CalendarIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const { transactions, addTransaction } = useTransactions();
  const [transactionText, setTransactionText] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("debit");
  
  // Filters
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Date range filter
      const transactionDate = new Date(transaction.date);
      const dateInRange = (!filterStartDate && !filterEndDate) || 
        (filterStartDate && !filterEndDate && transactionDate >= startOfDay(filterStartDate)) ||
        (!filterStartDate && filterEndDate && transactionDate <= endOfDay(filterEndDate)) ||
        (filterStartDate && filterEndDate && isWithinInterval(transactionDate, {
          start: startOfDay(filterStartDate),
          end: endOfDay(filterEndDate)
        }));
      
      // Category filter
      const categoryMatch = filterCategory === 'all' || transaction.category === filterCategory;
      
      // Transaction type filter
      const typeMatch = filterType === 'all' || 
        (filterType === 'credit' && transaction.amount >= 0) || 
        (filterType === 'debit' && transaction.amount < 0);
      
      return dateInRange && categoryMatch && typeMatch;
    });
  }, [transactions, filterStartDate, filterEndDate, filterCategory, filterType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionText.trim()) return;
    
    // Determine if debit should be negative amount
    let processedText = transactionText;
    const amount = parseFloat(transactionText.split(' ')[0]);
    
    if (transactionType === "debit" && amount > 0) {
      // Replace the first number with its negative value
      processedText = `-${transactionText}`;
    } else if (transactionType === "credit" && amount < 0) {
      // Ensure credit transactions are always positive
      processedText = transactionText.replace(/^-/, '');
    }
    
    addTransaction(processedText, selectedDate);
    setTransactionText("");
    setSelectedDate(undefined);
  };

  const clearFilters = () => {
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
    setFilterCategory("all");
    setFilterType("all");
    setIsFilterSheetOpen(false);
  };

  const applyFilters = () => {
    setIsFilterSheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <div className="container max-w-md mx-auto pt-20 px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Transactions</h1>
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Transactions</SheetTitle>
                  <SheetDescription>
                    Apply filters to view specific transactions
                  </SheetDescription>
                </SheetHeader>
                
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="flex gap-2">
                      <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filterStartDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filterStartDate ? format(filterStartDate, "PP") : <span>Start date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filterStartDate}
                            onSelect={(date) => {
                              setFilterStartDate(date);
                              setIsStartDatePickerOpen(false);
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex gap-2">
                      <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filterEndDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filterEndDate ? format(filterEndDate, "PP") : <span>End date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filterEndDate}
                            onSelect={(date) => {
                              setFilterEndDate(date);
                              setIsEndDatePickerOpen(false);
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Transaction Type</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                        <SelectItem value="debit">Debit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <SheetFooter className="flex justify-between sm:justify-between">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
          
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-wrap space-x-2">
                <div className="flex-1">
                  <Input
                    value={transactionText}
                    onChange={(e) => setTransactionText(e.target.value)}
                    placeholder="500 pizza parso"
                    className="w-full"
                  />
                </div>
                
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                  </SelectContent>
                </Select>
                
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
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  className="bg-kedia-green-600 hover:bg-kedia-green-700 flex-1"
                >
                  Add
                </Button>
              </div>
              
              {selectedDate && (
                <div className="text-xs text-kedia-green-600">
                  Using custom date: {format(selectedDate, "MMM d, yyyy")}
                </div>
              )}
              
              {(filterStartDate || filterEndDate || filterCategory !== 'all' || filterType !== 'all') && (
                <div className="bg-blue-50 p-2 rounded-md text-xs text-blue-700 flex items-center justify-between">
                  <span>
                    Active filters: 
                    {filterStartDate && ` From ${format(filterStartDate, "MMM d")}`}
                    {filterEndDate && ` To ${format(filterEndDate, "MMM d")}`}
                    {filterCategory !== 'all' && ` ${filterCategory}`}
                    {filterType !== 'all' && ` ${filterType}`}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs" 
                    onClick={clearFilters}
                  >
                    Clear
                  </Button>
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
            <h2 className="font-semibold text-gray-700 mb-2 flex justify-between items-center">
              <span>
                {filteredTransactions.length > 0 
                  ? `Transactions (${filteredTransactions.length})` 
                  : "No transactions yet"}
              </span>
            </h2>
            
            <div className="space-y-2">
              {filteredTransactions.map((transaction: Transaction) => (
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
