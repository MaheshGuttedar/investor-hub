import { useEffect, useState } from "react";
import { Check, Mail, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { approveUser, AuthUser, listPendingUsers } from "@/services/authService";

export default function AdminApprovals() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingUserId, setSubmittingUserId] = useState<string | null>(null);

  const loadPending = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const items = await listPendingUsers(token);
      setUsers(items);
    } catch (err) {
      toast({
        title: "Failed to load pending users",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, [token]);

  const handleApprove = async (userId: string) => {
    if (!token) return;

    try {
      setSubmittingUserId(userId);
      const result = await approveUser(token, userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));

      toast({
        title: "User approved",
        description: result.emailSent
          ? "Approval email sent to the user."
          : result.emailError
            ? `User approved. Email failed: ${result.emailError}`
            : "User approved. Email not sent because SMTP is not configured.",
      });
    } catch (err) {
      toast({
        title: "Approval failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmittingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review pending accounts and approve access.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Pending Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading pending users...</p>}

          {!loading && users.length === 0 && (
            <div className="rounded-md border bg-secondary/20 p-6 text-sm text-muted-foreground">
              No pending users.
            </div>
          )}

          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && <p className="mt-1 text-xs text-muted-foreground">{user.phone}</p>}
                </div>

                <Button
                  onClick={() => handleApprove(user.id)}
                  disabled={submittingUserId === user.id}
                  className="sm:w-auto"
                >
                  {submittingUserId === user.id ? (
                    "Approving..."
                  ) : (
                    <>
                      <Check className="mr-1.5 h-4 w-4" /> Approve
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-secondary/10 p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <UserCheck className="h-4 w-4" />
          Approval notifications
        </div>
        <p className="mt-1">
          Users receive an approval email when SMTP is configured in backend environment settings.
        </p>
      </div>
    </div>
  );
}
