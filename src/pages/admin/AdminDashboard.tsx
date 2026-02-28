import { useCmsAuth } from "@/contexts/CmsAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Menu, Image, Box } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useCmsAuth();

  const cards = [
    { title: "Pages", icon: FileText, description: "Manage site pages", href: "/admin/pages" },
    { title: "Menus", icon: Menu, description: "Configure navigation", href: "/admin/menus" },
    { title: "Media", icon: Image, description: "Upload & manage files", href: "/admin/media" },
    { title: "Widgets", icon: Box, description: "Content blocks", href: "/admin/widgets" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name || "Admin"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your website content from here.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="hover:shadow-md transition-shadow cursor-pointer border-border"
            onClick={() => window.location.href = card.href}
          >
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <card.icon className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-base">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
