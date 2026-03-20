import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSent(true);
    toast({
      title: "Request received",
      description: "Please contact support/admin to reset your password in the current setup.",
    });
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 mb-4">
            <Building2 className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Password reset email flow is not enabled in this MongoDB-only setup.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Please contact your administrator to reset your password.
              </p>
              <Link to="/login">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Link to="/login" className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-1 h-3 w-3" /> Back to Login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
