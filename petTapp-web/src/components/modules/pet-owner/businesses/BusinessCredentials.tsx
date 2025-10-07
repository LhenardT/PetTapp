import type { Business } from "@/types/business";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, ShieldCheck, FileText } from "lucide-react";

interface BusinessCredentialsProps {
  business: Business;
}

export const BusinessCredentials = ({ business }: BusinessCredentialsProps) => {
  if (!business.credentials) return null;

  return (
    <Card className="overflow-hidden border-2 p-0 gap-0">
      <div className="bg-accent p-6 border-b">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <Award className="size-5 text-primary" />
          </div>
          Credentials & Certifications
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Professional qualifications and licenses
        </p>
      </div>

      <CardContent className="p-6 space-y-3">
        {business.credentials.licenseNumber && (
          <div className="p-4 rounded-xl border-2 border-border bg-background">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  License Number
                </p>
                <p className="text-lg font-semibold text-foreground mt-0.5">
                  {business.credentials.licenseNumber}
                </p>
              </div>
            </div>
          </div>
        )}

        {business.credentials.certifications &&
          business.credentials.certifications.length > 0 && (
            <div className="p-4 rounded-xl border-2 border-border bg-background">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {business.credentials.certifications.map((cert, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm font-medium"
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        {business.credentials.insuranceInfo && (
          <div className="p-4 rounded-xl border-2 border-border bg-background">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Insurance
                </p>
                <p className="text-base font-semibold text-foreground mt-0.5">
                  {business.credentials.insuranceInfo}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
