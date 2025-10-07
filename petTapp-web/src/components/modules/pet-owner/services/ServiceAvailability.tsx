import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import type { Service } from "@/lib/api/services";

interface ServiceAvailabilityProps {
  availability: Service["availability"];
  formatDays: (days: string[]) => string;
}

const ServiceAvailability = ({
  availability,
  formatDays,
}: ServiceAvailabilityProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Availability</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Available Days</h3>
          <p className="text-muted-foreground">
            {formatDays(availability.days)}
          </p>
        </div>

        {availability.timeSlots.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Time Slots</h3>
            <div className="flex flex-wrap gap-2">
              {availability.timeSlots.map((slot, index) => (
                <Badge key={index} variant="outline">
                  {slot.start} - {slot.end}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ServiceAvailability;
