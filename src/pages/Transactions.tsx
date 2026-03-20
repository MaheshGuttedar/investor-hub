import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiTransaction, listTransactions } from "@/services/transactionsService";

export default function Transactions() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await listTransactions();
        if (mounted) setTransactions(items);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load transactions");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTransactions();

    return () => {
      mounted = false;
    };
  }, []);

  const entities = [...new Set(transactions.map((t) => t.entity))];

  const filtered = transactions.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (entityFilter !== "all" && t.entity !== entityFilter) return false;
    return true;
  });

  const typeIcon = (type: string) => {
    if (type === "investment") return <ArrowUpRight className="h-4 w-4 text-accent" />;
    if (type === "distribution") return <ArrowDownLeft className="h-4 w-4 text-success" />;
    return <RotateCcw className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">Investment, distribution, and return transactions.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-md">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="distribution">Distribution</SelectItem>
              <SelectItem value="return">Return</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Entity</label>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {entities.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading transactions...</div>}

      {error && !loading && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/30">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">INVESTMENT NAME</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">PROJECT NAME</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">AMOUNT</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">TYPE</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">DATE</th>
                </tr>
              </thead>
              <tbody>
                {!loading && !error && filtered.map((t) => (
                  <tr key={t._id} className="border-t hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-3 text-foreground">
                      <div className="whitespace-pre-line text-sm text-foreground">{t.entity}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{t.projectName}</td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">${t.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {typeIcon(t.type)}
                        <span className="capitalize text-foreground">{t.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{new Date(t.date).toISOString().slice(0,10)}</td>
                  </tr>
                ))}
                {!loading && !error && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-sm text-muted-foreground">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
