import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Filter, Navigation } from "lucide-react";

interface ServiceFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  radius: number;
  setRadius: (value: number) => void;
  useLocation: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  categories: string[] | undefined;
  onGetLocation: () => void;
  onClearLocation: () => void;
  setPage: (page: number) => void;
}

const ServiceFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  radius,
  setRadius,
  useLocation,
  userLocation,
  categories,
  onGetLocation,
  onClearLocation,
  setPage,
}: ServiceFiltersProps) => {
  return (
    <Card className="p-4 mb-8 gap-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="size-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        {/* Location Toggle */}
        {useLocation && userLocation ? (
          <Button variant="outline" size="sm" onClick={onClearLocation}>
            <MapPin className="size-4 mr-2" />
            Clear Location ({radius}km)
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onGetLocation}>
            <Navigation className="size-4" />
            Use My Location
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={category || "all"}
            onValueChange={(value) => setCategory(value === "all" ? "" : value)}
          >
            <SelectTrigger className="m-0 mt-2">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Radius */}
        {useLocation && userLocation && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Radius (km)</label>
            <Select
              value={radius.toString()}
              onValueChange={(value) => {
                setRadius(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="m-0 mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="15">15 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ServiceFilters;
