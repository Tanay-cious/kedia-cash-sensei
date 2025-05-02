
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CreditCard, BarChart3 } from "lucide-react";

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] h-16 flex items-center justify-around z-10">
      <Link
        to="/"
        className={`flex flex-col items-center py-1 w-1/2 ${
          path === "/" ? "bottom-tab-active" : "bottom-tab"
        }`}
      >
        <CreditCard size={20} />
        <span className="text-xs mt-1">Transactions</span>
      </Link>
      <Link
        to="/analytics"
        className={`flex flex-col items-center py-1 w-1/2 ${
          path === "/analytics" ? "bottom-tab-active" : "bottom-tab"
        }`}
      >
        <BarChart3 size={20} />
        <span className="text-xs mt-1">Analytics</span>
      </Link>
    </nav>
  );
};

export default BottomNavigation;
