import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Welcome to BudgetFlow</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Track your income, manage expenses, and gain insights into your financial health.
        </p>
        <Button asChild>
          <Link to="/expenses">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
