import { CmsPageWrapper } from "@/components/cms/CmsPageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

function ContactFallback() {
  return (
    <>
      <section className="py-20 bg-gradient-to-br from-secondary via-background to-accent">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Have a question or want to see a demo? We'd love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-3 rounded-2xl bg-card border border-border p-8">
              <h2 className="text-xl font-bold text-card-foreground mb-6">Send us a message</h2>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                    <Input type="email" placeholder="john@company.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Company</label>
                  <Input placeholder="Your company name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                  <Textarea placeholder="Tell us how we can help..." rows={5} />
                </div>
                <Button size="lg" className="w-full">Send Message</Button>
              </form>
            </div>

            {/* Info */}
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
                <Button variant="secondary" size="sm">Schedule Now</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Contact() {
  return <CmsPageWrapper slug="contact" fallback={<ContactFallback />} />;
}
