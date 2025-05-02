
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold text-kedia-green-600">KediaAI</Link>
      </div>
      <div>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:inline">Hello, {user.name}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="text-xs"
            >
              Logout
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
