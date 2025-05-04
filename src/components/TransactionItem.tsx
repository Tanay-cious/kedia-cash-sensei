
import React, { useState } from "react";
import { format } from "date-fns";
import { ArrowRight, Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Transaction, CATEGORIES, useTransactions } from "@/context/TransactionContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { editTransaction, deleteTransaction } = useTransactions();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedAmount, setEditedAmount] = useState(transaction.amount.toString());
  const [editedDescription, setEditedDescription] = useState(transaction.description);
  const [editedCategory, setEditedCategory] = useState(transaction.category);
  const [editedDate, setEditedDate] = useState(new Date(transaction.date));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("debit");

  const handleSaveChanges = () => {
    const amount = transactionType === "debit" 
      ? -Math.abs(parseFloat(editedAmount)) 
      : Math.abs(parseFloat(editedAmount));
    
    editTransaction(transaction.id, {
      amount,
      description: editedDescription,
      category: editedCategory as any,
      date: editedDate
    });
    setIsExpanded(false);
  };

  const handleCategoryChange = (value: string) => {
    setEditedCategory(value as any);
  };

  const handleTypeChange = (value: string) => {
    setTransactionType(value);
    // Update amount sign based on transaction type
    const absAmount = Math.abs(parseFloat(editedAmount));
    setEditedAmount(absAmount.toString());
  };

  const getCategoryColor = (category: string, transactionType: string) => {
    const colorMap: Record<string, string> = {
      Food: "bg-red-100 text-red-800",
      Transport: "bg-blue-100 text-blue-800",
      Shopping: "bg-purple-100 text-purple-800",
      Entertainment: "bg-yellow-100 text-yellow-800",
      Bills: "bg-gray-100 text-gray-800",
      Health: "bg-green-100 text-green-800",
      Education: "bg-indigo-100 text-indigo-800",
      Other: "bg-gray-100 text-gray-600"
    };

    // Default color based on category
    const baseColor = colorMap[category] || "bg-gray-100 text-gray-600";
    
    // Apply different colors based on transaction type
    return transactionType === "debit"
      ? `${baseColor} text-red-600` // Red for debit
      : `${baseColor} text-green-600`; // Green for credit
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`font-medium text-lg ${transaction.amount < 0 ? "text-red-600" : "text-kedia-green-600"}`}>
              {transaction.amount < 0 ? "-" : ""}₹{Math.abs(transaction.amount).toFixed(2)}
            </span>
            <div className="flex space-x-1 items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500 hover:text-kedia-green-600"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Edit size={16} />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this transaction.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => deleteTransaction(transaction.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <p className="text-gray-600 text-sm line-clamp-1">
            {transaction.description || "No description"}
          </p>
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(transaction.category, transaction.amount < 0 ? "debit" : "credit")}`}>
              {transaction.category}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(transaction.date), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Type:</span>
            <Select value={transaction.amount < 0 ? "debit" : "credit"} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Amount:</span>
            <Input 
              value={editedAmount} 
              onChange={(e) => setEditedAmount(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              className="w-full"
            />
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Description:</span>
            <Input 
              value={editedDescription} 
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Category:</span>
            <Select value={editedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Date:</span>
            <div className="flex-1">
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedDate ? format(editedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editedDate}
                    onSelect={(date) => {
                      if (date) {
                        setEditedDate(date);
                        setIsDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsExpanded(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-kedia-green-600 hover:bg-kedia-green-700"
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionItem;
