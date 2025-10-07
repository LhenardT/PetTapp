import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type { Service } from "@/lib/api/services";

interface ServiceRequirementsProps {
  requirements: Service["requirements"];
}

const ServiceRequirements = ({ requirements }: ServiceRequirementsProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="size-5 text-primary" />
        <h2 className="text-xl font-semibold">Requirements</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Accepted Pet Types</h3>
          <div className="flex flex-wrap gap-2">
            {requirements.petTypes.map((type) => (
              <Badge key={type} variant="secondary">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {requirements.ageRestrictions && (
          <div>
            <h3 className="font-medium mb-2">Age Restrictions</h3>
            <p className="text-muted-foreground">
              {requirements.ageRestrictions.minAge !== undefined &&
                `Min: ${requirements.ageRestrictions.minAge} years`}
              {requirements.ageRestrictions.minAge !== undefined &&
                requirements.ageRestrictions.maxAge !== undefined &&
                " | "}
              {requirements.ageRestrictions.maxAge !== undefined &&
                `Max: ${requirements.ageRestrictions.maxAge} years`}
            </p>
          </div>
        )}

        {requirements.healthRequirements &&
          requirements.healthRequirements.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Health Requirements</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {requirements.healthRequirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

        {requirements.specialNotes && (
          <div>
            <h3 className="font-medium mb-2">Special Notes</h3>
            <p className="text-muted-foreground">{requirements.specialNotes}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ServiceRequirements;
