// app/routes/dashboard.settings._index.tsx
import { Link } from "react-router";
import { User, Shield, Palette } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";

export default function SettingsIndex() {
  const links = [
    {
      title: "Account",
      desc: "Manage your personal information",
      icon: User,
      path: "/dashboard/settings/account",
    },
    {
      title: "Appearance",
      desc: "Customize your workspace theme",
      icon: Palette,
      path: "/dashboard/settings/appearance",
    },
    {
      title: "Security",
      desc: "Manage sessions and passwords",
      icon: Shield,
      path: "/dashboard/settings/security",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and account details.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.path} to={link.path}>
              <Card className="hover:border-blue-500 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <Icon className="mb-2 h-6 w-6 text-blue-500" />
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
