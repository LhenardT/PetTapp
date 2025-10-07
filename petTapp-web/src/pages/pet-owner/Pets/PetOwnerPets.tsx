import PetsCard from "@/components/modules/pet-owner/pets/PetsCard";
import PetsListItem from "@/components/modules/pet-owner/pets/PetsListItem";
import { useGetPets } from "@/lib/query/usePet";
import { Skeleton } from "@/components/ui/skeleton";
import type { Pet } from "@/types/pets";
import { Button } from "@/components/ui/button";
import { Plus, Grid3x3, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState, useMemo } from "react";

type ViewMode = "grid" | "list";

const PetOwnerPets = () => {
  const navigate = useNavigate();
  const { data: pets, isLoading } = useGetPets();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Memoize the pet list to prevent unnecessary re-renders
  const petList = useMemo(() => pets || [], [pets]);

  const renderPetCard = (pet: Pet) => (
    <PetsCard
      onClick={() => navigate(`/pet-owner/my-pets/${pet._id}`)}
      key={pet._id}
      pet={pet}
    />
  );

  const renderPetListItem = (pet: Pet) => (
    <PetsListItem
      key={pet._id}
      onClick={() => navigate(`/pet-owner/my-pets/${pet._id}`)}
      pet={pet}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-primary">My Pets</h1>

        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid3x3 className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            variant="outline"
            onClick={() => navigate("/pet-owner/my-pets/add")}
          >
            <Plus className="size-4" />
            Add Pet
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: petList.length || 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-40 w-full" />
              ))
            : petList.map(renderPetCard)}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            petList.map(renderPetListItem)
          )}
        </div>
      )}
    </div>
  );
};

export default PetOwnerPets;
