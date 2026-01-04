import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    categoryBreakdown: {},
    topCategories: [],
  });

  /* =====================================================
     1️⃣ FETCH REAL TRANSACTIONS (SAME AS DASHBOARD)
  ===================================================== */
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch transactions");

      const data = await res.json();

      // Normalize backend → frontend
      const mapType = (type) => {
        if (!type) return "Expense";
        const t = type.toString().toUpperCase();
        return ["CREDIT", "CR", "INCOME"].includes(t)
          ? "Income"
          : "Expense";
      };

      const normalized = data.map((txn) => ({
        id: txn._id,
        title: txn.title || txn.description || "Transaction",
        amount: txn.amount,
        category: txn.category,
        type: mapType(txn.type),
        date: txn.transactionDate.split("T")[0],
      }));

      setTransactions(normalized);
    } catch (err) {
      console.error("❌ Failed to fetch transactions:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /* =====================================================
     2️⃣ FILTER BY PERIOD
  ===================================================== */
  useEffect(() => {
    const filtered = filterByPeriod(transactions);
    setFilteredTransactions(filtered);
    generateReport(filtered);
  }, [transactions, selectedPeriod]);

  const filterByPeriod = (allTransactions) => {
    const now = new Date();

    return allTransactions.filter((txn) => {
      const date = new Date(txn.date);

      switch (selectedPeriod) {
        case "current-month":
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );

        case "last-month": {
          const lastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
          );
          return (
            date.getMonth() === lastMonth.getMonth() &&
            date.getFullYear() === lastMonth.getFullYear()
          );
        }

        case "current-year":
          return date.getFullYear() === now.getFullYear();

        case "last-year":
          return date.getFullYear() === now.getFullYear() - 1;

        case "all-time":
        default:
          return true;
      }
    });
  };

  /* =====================================================
     3️⃣ GENERATE SUMMARY REPORT
  ===================================================== */
  const generateReport = (data) => {
    const totalIncome = data
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = data
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = data.reduce((acc, t) => {
      if (t.type === "Expense") {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
      }
      return acc;
    }, {});

    const topCategories = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    setReportData({
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      categoryBreakdown,
      topCategories,
    });
  };

  /* =====================================================
     4️⃣ EXPORT CSV (BASED ON SELECTED PERIOD)
  ===================================================== */
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = ["Date", "Title", "Category", "Type", "Amount (₹)"];

    const rows = filteredTransactions.map((t) => [
      t.date,
      t.title,
      t.category,
      t.type,
      t.amount.toString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((f) => `"${f}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-${selectedPeriod}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">
              Download your transactions as CSV
            </p>
          </div>

          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* PERIOD SELECT */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Report Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="current-year">Current Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* SUMMARY */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-muted-foreground">Total Income</p>
              <p className="text-lg font-semibold text-primary">
                ₹{reportData.totalIncome.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Expenses</p>
              <p className="text-lg font-semibold text-destructive">
                ₹{reportData.totalExpenses.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Net Income</p>
              <p className="text-lg font-semibold">
                ₹{reportData.netIncome.toLocaleString("en-IN")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
