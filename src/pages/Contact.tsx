import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCmsPublicPage } from "@/hooks/useCmsPublicPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Loader2, CheckCircle2 } from "lucide-react";

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { /* empty */ }
      if (!res.ok) throw new Error(data.error || `Server error (${res.status}). Please try again.`);
      setStatus("sent");
      setForm({ name: "", email: "", company: "", message: "" });
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <section className="py-20 bg-gradient-to-br from-secondary via-background to-accent">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="max-w-lg mx-auto text-center rounded-2xl bg-card border border-border p-12">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-card-foreground mb-2" data-testid="text-success-title">Message Sent!</h2>
            <p className="text-muted-foreground mb-6" data-testid="text-success-message">
              Thank you for reaching out. We'll get back to you within 24 hours.
            </p>
            <Button onClick={() => setStatus("idle")} data-testid="button-send-another">Send Another Message</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-secondary via-background to-accent">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Have a question or want to see a demo? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
          <div className="lg:col-span-3 rounded-2xl bg-card border border-border p-8">
            <h2 className="text-xl font-bold text-card-foreground mb-6">Send us a message</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                  <Input
                    name="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="john@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Company</label>
                <Input
                  name="company"
                  placeholder="Your company name"
                  value={form.company}
                  onChange={handleChange}
                  data-testid="input-company"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                <Textarea
                  name="message"
                  placeholder="Tell us how we can help..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                  data-testid="input-message"
                />
              </div>
              {status === "error" && (
                <p className="text-sm text-destructive" data-testid="text-error">{errorMsg}</p>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={status === "sending"}
                data-testid="button-submit"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-card border border-border p-8">
              <h3 className="font-semibold text-card-foreground mb-6">Contact Info</h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "Email", value: "hello@gmbbriefcase.com" },
                  { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                  { icon: MapPin, label: "Address", value: "123 Business Ave, Suite 100\nSan Francisco, CA 94105" },
                  { icon: Clock, label: "Hours", value: "Mon-Fri: 9AM - 6PM PST" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="rounded-md bg-primary/10 p-2 mt-0.5">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-sm text-muted-foreground whitespace-pre-line">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-primary p-8 text-center">
              <h3 className="font-semibold text-primary-foreground mb-2">Book a Demo</h3>
              <p className="text-sm text-primary-foreground/80 mb-4">See GMB Briefcase in action with a personalized walkthrough.</p>
              <Button variant="secondary" size="sm" data-testid="button-schedule-demo">Schedule Now</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Contact() {
  const { data: page } = useCmsPublicPage("contact");

  useEffect(() => {
    if (page?.meta_title) document.title = page.meta_title;
    if (page?.meta_description) {
      let el = document.querySelector('meta[name="description"]');
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", "description");
        document.head.appendChild(el);
      }
      el.setAttribute("content", page.meta_description);
    }
  }, [page]);

  return (
    <Layout>
      <ContactPage />
    </Layout>
  );
}
