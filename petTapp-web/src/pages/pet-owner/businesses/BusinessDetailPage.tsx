import { useParams, useNavigate } from "react-router-dom";
import { useGetBusinessById } from "@/lib/query/useBusiness";
import {
  BusinessHero,
  BusinessContact,
  BusinessLocation,
  BusinessCredentials,
  BusinessHours,
  BusinessServices,
} from "@/components/modules/pet-owner/businesses";
import { toast } from "sonner";
import { useEffect } from "react";
import AdvancedLoading from "@/components/AdvancedLoading";
const BusinessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: business, isLoading, isError } = useGetBusinessById(id!);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch business details");
      navigate("/pet-owner/businesses");
    }
  }, [isError, navigate]);

  if (isLoading) return <AdvancedLoading />;

  if (!business) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background space-y-6">
      <BusinessHero
        business={business}
        onBack={() => navigate("/pet-owner/businesses")}
      />

      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <BusinessServices businessId={business._id} />
            <BusinessContact business={business} />
            <BusinessLocation business={business} />
            <BusinessCredentials business={business} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <BusinessHours business={business} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailPage;
