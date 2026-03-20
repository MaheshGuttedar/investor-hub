import { useState } from "react";
import { Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { messages } from "@/data/mockData";
import { toast } from "sonner";

export default function Messages() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Please fill in both subject and message.");
      return;
    }
    toast.success("Message sent successfully! The admin team will be notified.");
    setSubject("");
    setBody("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Send messages to the Company  team.</p>
      </div>

      {/* Compose */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">New Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter subject..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Message</label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type your message..." rows={5} />
          </div>
          <Button onClick={handleSend} className="gap-2">
            <Send className="h-4 w-4" /> Send Message
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Message History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`rounded-lg border p-4 ${msg.from === "investor" ? "border-accent/30 bg-accent/5" : "bg-card"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">{msg.from === "investor" ? "You" : "Company "}</span>
                <span className="text-xs text-muted-foreground">{new Date(msg.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{msg.subject}</p>
              <p className="text-sm text-muted-foreground mt-1">{msg.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
