
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

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { editTransaction, deleteTransaction } = useTransactions();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryChange = (value: string) => {
    editTransaction(transaction.id, { category: value as any });
  };

  const getCategoryColor = (category: string) => {
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
    
    return colorMap[category] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-lg">₹{transaction.amount.toFixed(2)}</span>
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
            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(transaction.category)}`}>
              {transaction.category}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(transaction.date), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-500 w-24">Category:</span>
            <Select 
              value={transaction.category} 
              onValueChange={handleCategoryChange}
            >
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
        </div>
      )}
    </div>
  );
};

export default TransactionItem;
