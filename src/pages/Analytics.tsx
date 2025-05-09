
import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTransactions, CATEGORIES, Transaction } from "@/context/TransactionContext";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, startOfMonth, endOfMonth, subMonths, addMonths, eachMonthOfInterval, subYears } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TransactionItem from "@/components/TransactionItem";
import { cn } from "@/lib/utils";
import { ChartContainer } from "@/components/ui/chart";

// Consistent color map for categories
const CATEGORY_COLORS: Record<string, string> = {
  Food: "#F44336",       // Red
  Transport: "#2196F3",  // Blue
  Shopping: "#9C27B0",   // Purple
  Entertainment: "#FF9800", // Orange
  Bills: "#607D8B",      // Blue Gray
  Health: "#4CAF50",     // Green
  Education: "#9E9E9E",  // Gray
  Lent: "#FFC107",       // Amber
  Other: "#795548",      // Brown
};

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const { transactions, getCategoryTotals, getTransactionsByDateRange } = useTransactions();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);
  
  const filteredTransactions = useMemo(() => {
    return getTransactionsByDateRange(startDate, endDate);
  }, [getTransactionsByDateRange, startDate, endDate]);
  
  const categoryTotals = useMemo(() => {
    return getCategoryTotals(startDate, endDate);
  }, [getCategoryTotals, startDate, endDate]);
  
  // Convert category totals to chart data with consistent colors
  const pieChartData = useMemo(() => {
    return Object.entries(categoryTotals)
      .filter(([_, amount]) => amount < 0) // Only include debits (negative amounts)
      .map(([category, amount]) => ({
        name: category,
        value: Math.abs(amount), // Use absolute value for display
        color: CATEGORY_COLORS[category] || "#000000"
      }));
  }, [categoryTotals]);
  
  // Calculate monthly debits for the past year
  const monthlyDebitsData = useMemo(() => {
    const endMonth = new Date();
    const startMonth = subYears(endMonth, 1);
    
    const months = eachMonthOfInterval({
      start: startMonth,
      end: endMonth
    });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthlyTransactions = getTransactionsByDateRange(monthStart, monthEnd);
      
      // Sum only debit (negative) transactions
      const debitTotal = monthlyTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return {
        month: format(month, "MMM"),
        debit: debitTotal
      };
    });
  }, [getTransactionsByDateRange]);
  
  const totalAmount = useMemo(() => {
    return pieChartData.reduce((sum, entry) => sum + entry.value, 0);
  }, [pieChartData]);
  
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  const isCurrentMonthToday = useMemo(() => {
    const today = new Date();
    return (
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <div className="container max-w-md mx-auto pt-20 px-4">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        
        {user ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-medium text-lg">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNextMonth}
                disabled={isCurrentMonthToday}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Card className="p-4 mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Total Spent</h3>
              <p className="text-2xl font-bold text-kedia-green-600">
                ₹{totalAmount.toFixed(2)}
              </p>
              
              <div className="h-[300px] mt-4">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No spending data for this month
                  </div>
                )}
              </div>
            </Card>
            
            <Card className="p-4 mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Monthly Debits</h3>
              <div className="h-[300px] mt-4">
                {monthlyDebitsData.some(item => item.debit > 0) ? (
                  <ChartContainer
                    config={{
                      debit: {
                        label: "Debit",
                        color: "#FF5252",
                      },
                    }}
                  >
                    <BarChart
                      data={monthlyDebitsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => `₹${Number(value).toFixed(2)}`}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar dataKey="debit" fill="#FF5252" name="Debit" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No debit data available
                  </div>
                )}
              </div>
            </Card>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                {filteredTransactions.length > 0 
                  ? `Transactions (${filteredTransactions.length})` 
                  : "No transactions in this period"}
              </h3>
              
              <div className="space-y-2">
                {filteredTransactions.map((transaction: Transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            Please login to view analytics
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Analytics;
