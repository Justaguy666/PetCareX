import { Link, useRouteError } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const Error = () => {
  const error = useRouteError() as { statusText?: string; message?: string };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-32">
        <div className="text-center space-y-8 max-w-md mx-auto">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Oops! Something went wrong
          </h1>
          <p className="text-lg text-muted-foreground">
            {error?.statusText || error?.message || "An unexpected error occurred. Please try again later."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error;
