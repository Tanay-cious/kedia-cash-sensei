
import { Category, CATEGORIES } from "@/context/TransactionContext";

type ParsedTransaction = {
  amount: number;
  description: string;
  category: Category;
  date: Date;
};

// Helper function to determine if a word represents an amount
const isAmount = (word: string): boolean => {
  return /^₹?\d+(\.\d+)?$/.test(word.replace(/,/g, ""));
};

// Helper function to extract amount from text
const extractAmount = (text: string): { amount: number; remainingText: string } => {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (isAmount(word)) {
      // Remove the ₹ symbol if present and convert to number
      const amount = parseFloat(word.replace(/₹|,/g, ""));
      const remainingWords = [...words];
      remainingWords.splice(i, 1);
      return { amount, remainingText: remainingWords.join(" ") };
    }
  }
  
  // If no amount format found, try to find any number
  const numberMatch = text.match(/\d+(\.\d+)?/);
  if (numberMatch) {
    const amount = parseFloat(numberMatch[0]);
    return {
      amount,
      remainingText: text.replace(numberMatch[0], "").trim()
    };
  }
  
  throw new Error("No valid amount found in the transaction text");
};

// Helper function to determine the date based on text
const parseDate = (text: string): { date: Date; remainingText: string } => {
  const today = new Date();
  const words = text.toLowerCase().split(" ");
  let date = new Date();
  let dateFound = false;
  let daysAgo = 0;
  
  // Check for date keywords
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    if (word === "yesterday" || word === "kal" || word === "parso") {
      if (word === "yesterday" || word === "kal") {
        date = new Date(today);
        date.setDate(today.getDate() - 1);
        dateFound = true;
      } else if (word === "parso") {
        date = new Date(today);
        date.setDate(today.getDate() - 2);
        dateFound = true;
      }
      
      const remainingWords = [...words];
      remainingWords.splice(i, 1);
      return { date, remainingText: remainingWords.join(" ") };
    }
    
    // Check for "X days back" or "X din pehle" patterns
    if ((i < words.length - 2) && 
        /^\d+$/.test(words[i]) && 
        (words[i+1] === "days" || words[i+1] === "din") && 
        (words[i+2] === "back" || words[i+2] === "pehle" || words[i+2] === "ago")) {
      
      daysAgo = parseInt(words[i]);
      date = new Date(today);
      date.setDate(today.getDate() - daysAgo);
      dateFound = true;
      
      const remainingWords = [...words];
      remainingWords.splice(i, 3);
      return { date, remainingText: remainingWords.join(" ") };
    }
  }
  
  // If no date specified, use today's date
  if (!dateFound) {
    return { date: today, remainingText: text };
  }
  
  return { date, remainingText: text };
};

// Helper function to guess category based on description
const guessCategory = (description: string): Category => {
  description = description.toLowerCase();
  
  const categoryKeywords: Record<Category, string[]> = {
    "Food": ["food", "meal", "lunch", "dinner", "breakfast", "restaurant", "pizza", "burger", "dominos"],
    "Transport": ["transport", "uber", "ola", "cab", "taxi", "metro", "bus", "train", "petrol", "gas", "auto", "rick", "rickshaw", "auto-rickshaw"],
    "Shopping": [
      "shop", "mall", "clothes", "dress", "shirt", "pants", "jeans", "shoes", "purchase",
      "h&m", "zara", "forever21", "uniqlo", "adidas", "nike", "puma", "levis", "myntra", "amazon", "flipkart", "ajio"
    ],
    "Entertainment": ["movie", "theatre", "concert", "show", "netflix", "amazon", "prime", "disney", "hotstar"],
    "Bills": ["bill", "electricity", "water", "gas", "internet", "wifi", "broadband", "rent", "maintenance"],
    "Health": ["medicine", "doctor", "hospital", "clinic", "medical", "health", "healthcare", "pharmacy"],
    "Education": ["book", "course", "class", "tuition", "school", "college", "university", "education"],
    "Lent": ["lent", "borrowed", "loan", "gave", "friend", "lending"],
    "Other": []
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (description.includes(keyword)) {
        return category as Category;
      }
    }
  }
  
  return "Other";
};

export const parseTransactionText = (text: string): ParsedTransaction => {
  try {
    // Extract amount from text
    const { amount, remainingText: textAfterAmount } = extractAmount(text);
    
    // Extract date from the remaining text
    const { date, remainingText: description } = parseDate(textAfterAmount);
    
    // Guess category based on the description
    const category = guessCategory(description);
    
    return {
      amount,
      description: description.trim(),
      category,
      date
    };
  } catch (error) {
    console.error("Error parsing transaction text:", error);
    throw new Error("Failed to parse transaction text");
  }
};
