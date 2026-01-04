import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

export default function GmailConnect() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState(null);

  /* =========================================
     1️⃣ HANDLE OAUTH CALLBACK STATUS
  ========================================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("success")) {
      setStatus({
        type: "success",
        message: "✅ Gmail connected successfully!",
      });
      checkStatus();
    }

    if (params.get("error")) {
      setStatus({
        type: "error",
        message: "❌ Gmail connection failed. Please try again.",
      });
    }
  }, []);

  /* =========================================
     2️⃣ CHECK GMAIL CONNECTION STATUS (JWT)
  ========================================= */
  const checkStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/gmail/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.connected) {
        setConnected(true);
        setEmail(data.email);
      } else {
        setConnected(false);
        setEmail(null);
      }
    } catch (err) {
      console.error("❌ Gmail status check failed", err);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  /* =========================================
     3️⃣ CONNECT GMAIL (PUBLIC OAUTH REDIRECT)
     ❌ NO FETCH
     ❌ NO AUTH HEADER
  ========================================= */
  const handleConnect = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.id) {
      alert("Please login again");
      return;
    }

    // 🔁 Direct browser redirect (OAuth-safe)
    window.location.href =
      `http://localhost:5000/api/gmail/connect?userId=${user.id}`;
  };

  /* =========================================
     4️⃣ SCAN & SAVE TRANSACTIONS (JWT)
  ========================================= */
  const handleScanAndSave = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/gmail/scan-and-save",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: "success",
          message: `✅ Saved ${data.saved} transaction(s)`,
        });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to scan Gmail",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Error scanning Gmail",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Gmail Integration</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Gmail Connection
            </CardTitle>
            <CardDescription>
              Connect Gmail to automatically import transactions
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* CONNECTION STATUS */}
            {connected && (
              <div className="p-3 rounded-lg bg-green-50 text-green-800 text-sm">
                ✅ Connected to <b>{email}</b>
              </div>
            )}

            {/* STEP 1 */}
            <div className="space-y-2">
              <h3 className="font-semibold">Step 1: Connect Gmail</h3>
              <Button
                onClick={handleConnect}
                className="w-full"
                disabled={connected}
              >
                <Mail className="mr-2 h-4 w-4" />
                {connected ? "Gmail Connected" : "Connect Gmail Account"}
              </Button>
            </div>

            {/* STEP 2 */}
            <div className="space-y-2">
              <h3 className="font-semibold">Step 2: Scan & Import</h3>
              <Button
                onClick={handleScanAndSave}
                disabled={!connected || loading}
                variant="outline"
                className="w-full"
              >
                {loading
                  ? "Scanning..."
                  : "Scan Gmail & Import Transactions"}
              </Button>
            </div>

            {/* STATUS MESSAGE */}
            {status && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  status.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <p>{status.message}</p>
              </div>
            )}

            {/* INFO */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">How it works</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Secure Google OAuth connection</li>
                <li>Scans debit/credit notification emails</li>
                <li>Transactions auto-added to dashboard</li>
                <li>Background scan runs every minute</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
