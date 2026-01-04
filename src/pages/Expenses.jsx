import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

const categories = [
  "Food",
  "Transportation",
  "Housing",
  "Entertainment",
  "Health",
  "Shopping",
  "Utilities",
  "Salary",
  "Freelance",
  "Investment",
];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filterType, setFilterType] = useState("all");

  /* ================================
     FETCH TRANSACTIONS
  ================================= */
  const fetchExpenses = async () => {
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

      setExpenses(normalized);
    } catch (err) {
      console.error("❌ Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  /* ================================
     FILTER LOGIC (TYPE ONLY)
  ================================= */
  useEffect(() => {
    let filtered = expenses;

    if (filterType !== "all") {
      filtered = filtered.filter((e) => e.type === filterType);
    }

    setFilteredExpenses(filtered);
  }, [expenses, filterType]);

  /* ================================
     LAST 20 TRANSACTIONS
  ================================= */
  const last20Transactions = filteredExpenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">
            Showing last {Math.min(20, filteredExpenses.length)} of{" "}
            {filteredExpenses.length} transaction(s)
          </p>
        </div>

        {/* FILTERS */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="max-w-sm">
            <Label>Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* TRANSACTIONS LIST */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {last20Transactions.map((e) => (
              <div
                key={e.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.category} • {e.date}
                  </p>
                </div>

                <p
                  className={`font-medium ${
                    e.type === "Income"
                      ? "text-primary"
                      : "text-destructive"
                  }`}
                >
                  {e.type === "Income" ? "+" : "-"}₹
                  {e.amount.toLocaleString("en-IN")}
                </p>
              </div>
            ))}

            {last20Transactions.length === 0 && (
              <p className="text-center text-muted-foreground py-6">
                No transactions found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
