import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import type { Service } from "@/lib/api/services";

interface ServiceDetailsHeroProps {
  service: Service;
  getCategoryBadgeColor: (category: string) => string;
}

const ServiceDetailsHero = ({
  service,
  getCategoryBadgeColor,
}: ServiceDetailsHeroProps) => {
  return (
    <Card className="overflow-hidden p-0 gap-0">
      <div className="relative h-96 bg-muted">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-8xl">🐾</span>
          </div>
        )}
        <Badge
          className={`absolute top-4 right-4 ${getCategoryBadgeColor(
            service.category
          )}`}
        >
          {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
        </Badge>
      </div>

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
        {service.business && (
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Building2 className="size-4" />
            <span>{service.business.name}</span>
          </div>
        )}
        <p className="text-muted-foreground">{service.description}</p>
      </div>
    </Card>
  );
};

export default ServiceDetailsHero;
