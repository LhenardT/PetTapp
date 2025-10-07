import { useGetServicesByBusiness } from "@/lib/query/useService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, ArrowRight, Loader2, PawPrint } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Service } from "@/lib/api/services";

interface BusinessServicesProps {
  businessId: string;
}

const categoryColors: Record<string, string> = {
  veterinary: "bg-red-100 text-red-700 border-red-200",
  grooming: "bg-pink-100 text-pink-700 border-pink-200",
  boarding: "bg-blue-100 text-blue-700 border-blue-200",
  daycare: "bg-yellow-100 text-yellow-700 border-yellow-200",
  training: "bg-green-100 text-green-700 border-green-200",
  emergency: "bg-orange-100 text-orange-700 border-orange-200",
  consultation: "bg-purple-100 text-purple-700 border-purple-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

const ServiceItem = ({ service }: { service: Service }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/pet-owner/services/${service._id}`)}
      className="group cursor-pointer block"
    >
      <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:shadow-md">
        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
          <Briefcase className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Service</p>
              <h3 className="text-lg font-semibold text-foreground mt-0.5">{service.name}</h3>
            </div>
            <Badge variant="outline" className={`${categoryColors[service.category] || categoryColors.other} flex-shrink-0`}>
              {service.category}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{service.duration} min</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-primary">
              <span>{service.price.currency}</span>
              <span>{service.price.amount.toLocaleString()}</span>
            </div>
          </div>

          {service.requirements?.petTypes && service.requirements.petTypes.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {service.requirements.petTypes.map((petType) => (
                <Badge key={petType} variant="secondary" className="text-xs capitalize">
                  {petType}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-8" />
      </div>
    </div>
  );
};

export const BusinessServices = ({ businessId }: BusinessServicesProps) => {
  const { data, isLoading, isError } = useGetServicesByBusiness(businessId, { limit: 100 });

  return (
    <Card className="overflow-hidden border-2 p-0 gap-0">
      <div className="bg-accent p-6 border-b">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <Briefcase className="size-5 text-primary" />
          </div>
          Services Offered
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Browse our available services and book an appointment
        </p>
      </div>

      <CardContent className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <PawPrint className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-muted-foreground">Failed to load services</p>
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No services available at this time</p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="space-y-3">
            {data.data.map((service) => (
              <ServiceItem key={service._id} service={service} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
