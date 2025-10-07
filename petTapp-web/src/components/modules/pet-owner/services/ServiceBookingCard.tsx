import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, PhilippinePeso } from "lucide-react";
import type { Service } from "@/lib/api/services";

interface ServiceBookingCardProps {
  service: Service;
}

const ServiceBookingCard = ({ service }: ServiceBookingCardProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Service Details</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-5" />
            <span>Duration</span>
          </div>
          <span className="font-semibold">{service.duration} min</span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <PhilippinePeso className="size-5" />
            <span>Price</span>
          </div>
          <span className="text-2xl font-bold text-primary">
            {service.price.amount.toLocaleString()} {service.price.currency}
          </span>
        </div>
      </div>

      <Separator className="my-6" />

      <Button className="w-full" size="lg">
        Book This Service
      </Button>
    </Card>
  );
};

export default ServiceBookingCard;
