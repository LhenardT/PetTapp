import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Heart, PawPrint, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    title: "My Pets",
    value: "0",
    subtitle: "Add your first pet",
    icon: PawPrint,
    color: "bg-blue-500",
    route: "/pet-owner/pets",
  },
  {
    title: "Appointments",
    value: "0",
    subtitle: "No upcoming bookings",
    icon: Calendar,
    color: "bg-green-500",
    route: "/pet-owner/schedules",
  },
  {
    title: "Services",
    value: "100+",
    subtitle: "Available near you",
    icon: Briefcase,
    color: "bg-purple-500",
    route: "/pet-owner/services",
  },
  {
    title: "Businesses",
    value: "50+",
    subtitle: "Verified providers",
    icon: Heart,
    color: "bg-pink-500",
    route: "/pet-owner/businesses",
  },
];

export const QuickStats = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 group border-2 hover:border-primary/50 overflow-hidden"
          onClick={() => navigate(stat.route)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold group-hover:text-primary transition-colors">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.subtitle}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 text-${stat.color.replace("bg-", "")}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
