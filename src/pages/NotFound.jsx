import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Oops! The page <code className="bg-muted px-1 rounded">{location.pathname}</code> doesn’t exist.
        </p>
        <a
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
