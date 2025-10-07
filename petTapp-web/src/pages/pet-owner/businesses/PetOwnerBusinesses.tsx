import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetBusinesses } from "@/lib/query/useBusiness";
import type { BusinessType, GetBusinessesParams } from "@/types/business";
import { BusinessCard } from "@/components/modules/pet-owner/businesses/BusinessCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";

const businessTypes: { value: BusinessType; label: string }[] = [
  { value: "veterinary", label: "Veterinary" },
  { value: "grooming", label: "Grooming" },
  { value: "boarding", label: "Boarding" },
  { value: "daycare", label: "Daycare" },
  { value: "training", label: "Training" },
  { value: "pet-shop", label: "Pet Shop" },
  { value: "other", label: "Other" },
];

const PetOwnerBusinesses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<BusinessType | "all">("all");
  const [selectedCity, setSelectedCity] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const params: GetBusinessesParams = {
    page,
    limit: 9,
  };

  if (debouncedSearch) params.search = debouncedSearch;
  if (selectedType !== "all") params.businessType = selectedType as BusinessType;
  if (selectedCity) params.city = selectedCity;

  const { data, isLoading, isError } = useGetBusinesses(params);

  if (isError) {
    toast.error("Failed to fetch businesses");
  }

  const handleBusinessClick = (businessId: string) => {
    navigate(`/pet-owner/businesses/${businessId}`);
  };

  const handleTypeFilter = (type: BusinessType | "all") => {
    setSelectedType(type);
    setPage(1);
  };

  const activeFiltersCount = [
    selectedType !== "all",
    selectedCity !== "",
    debouncedSearch !== "",
  ].filter(Boolean).length;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar Filters */}
      <div
        className={`${
          showFilters ? "w-80" : "w-0"
        } transition-all duration-300 border-r bg-background overflow-hidden relative z-10`}
      >
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </div>

            <Separator />

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            {/* City Filter */}
            <div className="space-y-2">
              <Label htmlFor="city">Location</Label>
              <div className="relative">
                <Input
                  id="city"
                  placeholder="Enter city..."
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                />
                {selectedCity && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSelectedCity("")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Business Type */}
            <div className="space-y-3">
              <Label>Business Type</Label>
              <RadioGroup
                value={selectedType}
                onValueChange={(value) => handleTypeFilter(value as BusinessType | "all")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All Types
                  </Label>
                </div>
                {businessTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="font-normal cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCity("");
                    setSelectedType("all");
                    setPage(1);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <div className="border-b bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Pet Care Businesses</h1>
                {data?.pagination && (
                  <p className="text-sm text-muted-foreground">
                    {data.pagination.total} businesses found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !data?.data || data.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <p className="text-lg font-medium">No businesses found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                  {data.data.map((business) => (
                    <BusinessCard
                      key={business._id}
                      business={business}
                      onClick={() => handleBusinessClick(business._id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination && data.pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: data.pagination.pages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === data.pagination!.pages ||
                            Math.abs(p - page) <= 1
                        )
                        .map((p, idx, arr) => (
                          <div key={p} className="flex items-center">
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={page === p ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(p)}
                              disabled={isLoading}
                            >
                              {p}
                            </Button>
                          </div>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setPage((p) => Math.min(data.pagination!.pages, p + 1))
                      }
                      disabled={page === data.pagination.pages || isLoading}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PetOwnerBusinesses;
