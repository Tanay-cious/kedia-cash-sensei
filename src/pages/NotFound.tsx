
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-kedia-green-600 mb-4">404</h1>
        <p className="text-xl mb-6">Oops! Page not found</p>
        <Link to="/">
          <Button className="bg-kedia-green-600 hover:bg-kedia-green-700">
            Go back home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
