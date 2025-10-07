import type { Business } from "@/types/business";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, Globe, ExternalLink } from "lucide-react";

interface BusinessContactProps {
  business: Business;
}

export const BusinessContact = ({ business }: BusinessContactProps) => {
  return (
    <Card className="overflow-hidden border-2 p-0 gap-0">
      <div className="bg-accent p-6 border-b">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <Phone className="size-5 text-primary" />
          </div>
          Get in Touch
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Reach out to learn more about our services
        </p>
      </div>

      <CardContent className="p-6 space-y-3">
        <a
          href={`tel:${business.contactInfo.phone}`}
          className="group block"
        >
          <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-md">
            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
              <p className="text-lg font-semibold text-foreground mt-0.5">{business.contactInfo.phone}</p>
            </div>
          </div>
        </a>

        <a
          href={`mailto:${business.contactInfo.email}`}
          className="group block"
        >
          <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-md">
            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="text-lg font-semibold text-foreground mt-0.5 truncate">{business.contactInfo.email}</p>
            </div>
          </div>
        </a>

        {business.contactInfo.website && (
          <a
            href={business.contactInfo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-md">
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Website</p>
                <p className="text-lg font-semibold text-foreground mt-0.5 truncate">{business.contactInfo.website}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </a>
        )}
      </CardContent>
    </Card>
  );
};
