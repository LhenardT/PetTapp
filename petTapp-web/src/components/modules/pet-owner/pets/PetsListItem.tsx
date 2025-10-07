import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MarsStroke } from "lucide-react";
import type { Pet } from "@/types/pets";

interface PetsListItemProps {
  pet: Pet;
  onClick: () => void;
}

const PetsListItem = ({ pet, onClick }: PetsListItemProps) => {
  return (
    <Card
      onClick={onClick}
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer p-0"
    >
      <div className="flex flex-row items-center gap-4 p-2">
        {/* Image */}
        <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
          <img
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            src={pet.images?.profile}
            alt={pet.name}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold truncate">{pet.name}</h3>
            <Badge variant="default">{pet.species.toUpperCase()}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{pet.breed}</p>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <span className="text-sm">
                {pet.age >= 1
                  ? `${pet.age} ${pet.age === 1 ? "yr" : "yrs"}`
                  : `${Math.round(pet.age * 12)} ${
                      Math.round(pet.age * 12) === 1 ? "month" : "months"
                    }`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MarsStroke className="size-4 text-primary" />
              <span className="text-sm capitalize">{pet.gender}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PetsListItem;
