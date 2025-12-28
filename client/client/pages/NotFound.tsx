import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-32">
        <div className="text-center space-y-8 max-w-md mx-auto">
          <div className="text-7xl font-bold text-primary/20">404</div>
          <h1 className="text-4xl font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. Let's get you back to caring for your pets!
          </p>
          <Link to="/">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
