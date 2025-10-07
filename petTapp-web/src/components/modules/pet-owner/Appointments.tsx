import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CircleOff } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";

const Appointments = () => {
  return (
    <Card className="gap-0 p-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 bg-primary text-white p-4">
        <Calendar className="size-5 stroke-2" />
        <CardTitle>Current Appointments</CardTitle>
      </CardHeader>
      <CardContent className="p-4 gap-0">
        <Alert variant="destructive">
          <CircleOff />
          <AlertTitle>
            No upcoming appointments
          </AlertTitle>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default Appointments;
