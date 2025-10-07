import { useState, useEffect } from "react";
import { useGetServices, useGetServiceCategories } from "@/lib/query/useService";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import ServiceFilters from "@/components/modules/pet-owner/services/ServiceFilters";
import ServiceGrid from "@/components/modules/pet-owner/services/ServiceGrid";
import ServicePagination from "@/components/modules/pet-owner/services/ServicePagination";

const PetOwnerServices = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [radius, setRadius] = useState<number>(10); // Default 10km radius
  const [useLocation, setUseLocation] = useState(false);
  const limit = 12;

  // Read category from URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const { data: categoriesData } = useGetServiceCategories();
  const { data: servicesData, isLoading } = useGetServices({
    page,
    limit,
    search: debouncedSearch || undefined,
    category: category || undefined,
    latitude: useLocation && userLocation ? userLocation.latitude : undefined,
    longitude: useLocation && userLocation ? userLocation.longitude : undefined,
    radius: useLocation && userLocation ? radius : undefined,
  });

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.loading("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setUseLocation(true);
        setPage(1);
        toast.dismiss();
        toast.success("Location enabled! Showing nearby services");
      },
      (error) => {
        toast.dismiss();
        toast.error("Unable to get your location. Please enable location services.");
        console.error("Geolocation error:", error);
      }
    );
  };

  const handleClearLocation = () => {
    setUseLocation(false);
    setUserLocation(null);
    setPage(1);
    toast.success("Location filter cleared");
  };

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Pet Services</h1>
        <p className="text-muted-foreground">
          Browse and book the best services for your pets
        </p>
      </div>

      {/* Filters */}
      <ServiceFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        radius={radius}
        setRadius={setRadius}
        useLocation={useLocation}
        userLocation={userLocation}
        categories={categoriesData}
        onGetLocation={handleGetLocation}
        onClearLocation={handleClearLocation}
        setPage={setPage}
      />

      {/* Results Count */}
      {servicesData && (
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {servicesData.data.length} of {servicesData.pagination.total} services
        </div>
      )}

      {/* Services Grid */}
      <ServiceGrid services={servicesData?.data} isLoading={isLoading} />

      {/* Pagination */}
      {servicesData && (
        <ServicePagination
          currentPage={page}
          totalPages={servicesData.pagination.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default PetOwnerServices;
