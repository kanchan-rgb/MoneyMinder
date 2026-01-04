import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ExpenseChart } from "@/components/charts/ExpenseChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  PieChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    categoryBreakdown: {},
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchTransactions = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("❌ No token found, redirecting to login");
        navigate("/login");
        return;
      }

      const res = await fetch("/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        console.warn("❌ Unauthorized, clearing token");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await res.json();
      console.log("📦 TRANSACTIONS FROM BACKEND:", data);

      if (!Array.isArray(data)) {
        console.error("❌ Expected array, got:", data);
        setExpenses([]);
        return;
      }

      if (data.length === 0) {
        console.warn("⚠️ No transactions for this user");
      }

      // 🔁 BACKEND → UI FORMAT
      const formatted = data.map((txn) => ({
        id: txn._id,
        title: txn.description || "Transaction",
        amount: Number(txn.amount) || 0,
        category: txn.description || "Other",
        type: txn.type === "CREDIT" ? "Income" : "Expense",
        date: new Date(
          txn.transactionDate || txn.createdAt
        ).toLocaleDateString("en-IN"),
      }));

      setExpenses(formatted);

      // 💰 TOTALS
      const totalIncome = formatted
        .filter((e) => e.type === "Income")
        .reduce((sum, e) => sum + e.amount, 0);

      const totalExpenses = formatted
        .filter((e) => e.type === "Expense")
        .reduce((sum, e) => sum + e.amount, 0);

      // 📊 CATEGORY BREAKDOWN
      const categoryBreakdown = {};
      formatted.forEach((item) => {
        if (item.type === "Expense") {
          categoryBreakdown[item.category] =
            (categoryBreakdown[item.category] || 0) + item.amount;
        }
      });

      setSummary({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        categoryBreakdown,
      });
    } catch (err) {
      console.error("❌ Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 LOAD + AUTO REFRESH
  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const incomeVsExpenseData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        label: "Amount (₹)",
        data: [summary.totalIncome, summary.totalExpenses],
        backgroundColor: ["#22C55E", "#EF4444"],
        borderWidth: 2,
      },
    ],
  };

  const categoryData = {
    labels: Object.keys(summary.categoryBreakdown),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(summary.categoryBreakdown),
        backgroundColor: [
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#96CEB4",
          "#FFEAA7",
          "#DDA0DD",
          "#FFB347",
          "#98D8C8",
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your income and expenses
          </p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard title="Total Income" value={summary.totalIncome} icon={<TrendingUp />} currency />
          <SummaryCard title="Total Expenses" value={summary.totalExpenses} icon={<TrendingDown />} currency negative />
          <SummaryCard title="Balance" value={summary.balance} icon={<IndianRupee />} currency positive={summary.balance >= 0} />
          <SummaryCard title="Categories" value={Object.keys(summary.categoryBreakdown).length} icon={<PieChart />} />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseChart type="bar" data={incomeVsExpenseData} title="Income vs Expenses" />
          <ExpenseChart type="doughnut" data={categoryData} title="Expenses by Category" />
        </div>

        {/* TRANSACTIONS */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest entries</CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-muted-foreground">No transactions found.</p>
            ) : (
              expenses.slice(0, 5).map((e) => (
                <div key={e.id} className="flex justify-between p-3 border rounded-lg mb-2">
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-sm text-muted-foreground">{e.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={e.type === "Income" ? "text-primary" : "text-destructive"}>
                      {e.type === "Income" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm text-muted-foreground">{e.date}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 🔹 SUMMARY CARD
function SummaryCard({ title, value, icon, currency = false, positive = true }) {
  return (
    <Card>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${currency ? (positive ? "text-primary" : "text-destructive") : ""}`}>
          {currency ? "₹" : ""}
          {Number(value).toLocaleString("en-IN")}
        </div>
      </CardContent>
    </Card>
  );
}
