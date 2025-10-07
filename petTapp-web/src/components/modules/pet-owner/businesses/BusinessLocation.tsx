import type { Business } from "@/types/business";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";

interface BusinessLocationProps {
  business: Business;
}

export const BusinessLocation = ({ business }: BusinessLocationProps) => {
  const getDirectionsUrl = () => {
    const address = `${business.address.street}, ${business.address.city}, ${business.address.state} ${business.address.zipCode}, ${business.address.country}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <Card className="overflow-hidden border-2 p-0 gap-0">
      <div className="bg-accent p-6 border-b">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <MapPin className="size-5 text-primary" />
          </div>
          Location
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Find us at this address
        </p>
      </div>

      <CardContent className="p-6">
        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-md">
            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</p>
              <p className="text-lg font-semibold text-foreground mt-0.5">{business.address.street}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {business.address.city}, {business.address.state} {business.address.zipCode}
              </p>
              <p className="text-sm text-muted-foreground">{business.address.country}</p>
            </div>
            <Navigation className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
          </div>
        </a>
      </CardContent>
    </Card>
  );
};
