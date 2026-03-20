import { useEffect, useState } from "react";
import { Download, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiTaxDocument, listTaxDocuments } from "@/services/documentsService";

export default function TaxDocuments() {
  const [investmentFilter, setInvestmentFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([2025, 2024, 2023]));
  const [taxDocuments, setTaxDocuments] = useState<ApiTaxDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTaxDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await listTaxDocuments();
        if (mounted) setTaxDocuments(items);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load tax documents");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTaxDocuments();

    return () => {
      mounted = false;
    };
  }, []);

  const projects = [...new Set(taxDocuments.map((d) => d.projectName))];
  const entities = [...new Set(taxDocuments.map((d) => d.investingEntity))];
  const years = [...new Set(taxDocuments.map((d) => d.year))].sort((a, b) => b - a);

  const filtered = taxDocuments.filter((doc) => {
    if (investmentFilter !== "all" && doc.projectName !== investmentFilter) return false;
    if (entityFilter !== "all" && doc.investingEntity !== entityFilter) return false;
    if (yearFilter !== "all" && doc.year !== Number(yearFilter)) return false;
    return true;
  });

  const groupedByYear = years.reduce((acc, year) => {
    const docs = filtered.filter((d) => d.year === year);
    if (docs.length > 0) acc[year] = docs;
    return acc;
  }, {} as Record<number, typeof taxDocuments>);

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      next.has(year) ? next.delete(year) : next.add(year);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tax Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">K-1 forms and tax-related documents organized by year.</p>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading tax documents...</div>}

      {error && !loading && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Investment</label>
          <Select value={investmentFilter} onValueChange={setInvestmentFilter}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {projects.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Investing Entity</label>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {entities.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Year</label>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Documents grouped by year */}
      <div className="space-y-4">
        {!loading && !error && Object.entries(groupedByYear).map(([year, docs]) => (
          <Card key={year} className="overflow-hidden">
            <button
              onClick={() => toggleYear(Number(year))}
              className="flex w-full items-center justify-between bg-card px-6 py-4 text-left hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                {expandedYears.has(Number(year)) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <h3 className="text-lg font-bold text-foreground">{year}</h3>
              </div>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download All
              </Button>
            </button>

            {expandedYears.has(Number(year)) && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t bg-secondary/30">
                      <th className="px-6 py-3 text-left font-medium text-muted-foreground">Name ↕</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Investment ↕</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Investing Entity ↕</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Asset ↕</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Shared ↕</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((doc) => (
                      <tr key={doc._id} className="border-t hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            {doc.isNew && <span className="h-2 w-2 rounded-full bg-accent" />}
                            <a href={doc.url} className="text-link text-sm">{doc.name}</a>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground">{doc.projectName}</td>
                        <td className="px-4 py-3 text-foreground">{doc.investingEntity}</td>
                        <td className="px-4 py-3 text-muted-foreground">{doc.asset}</td>
                        <td className="px-4 py-3 text-right text-foreground">{doc.sharedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}

        {!loading && !error && Object.keys(groupedByYear).length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground">No tax documents found.</Card>
        )}
      </div>
    </div>
  );
}
