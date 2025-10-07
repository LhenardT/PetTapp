import type { Business } from "@/types/business";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface BusinessHoursProps {
  business: Business;
}

const dayNames = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const BusinessHours = ({ business }: BusinessHoursProps) => {
  if (!business.businessHours) return null;

  return (
    <Card className="overflow-hidden border-2 p-0 gap-0">
      <div className="bg-accent p-6 border-b">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <Calendar className="size-5 text-primary" />
          </div>
          Hours
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          When we're open for you
        </p>
      </div>

      <CardContent className="p-6">
        <div className="space-y-2">
          {dayNames.map((day) => {
            const schedule = business.businessHours?.[day];
            const isToday =
              day === dayNames[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
            return (
              <div
                key={day}
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  isToday
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isToday && (
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div>
                    <span className={`font-medium capitalize ${isToday ? "text-primary" : "text-foreground"}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-xs ml-2 text-primary font-semibold">(Today)</span>
                    )}
                  </div>
                </div>
                <span className={`font-semibold ${schedule?.isOpen ? "text-foreground" : "text-muted-foreground"}`}>
                  {schedule?.isOpen ? `${schedule.open} - ${schedule.close}` : "Closed"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
