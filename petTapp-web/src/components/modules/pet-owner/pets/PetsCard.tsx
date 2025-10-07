import { Card } from "@/components/ui/card";
import type { Pet } from "@/types/pets";
import { Badge } from "@/components/ui/badge";
import { Calendar, MarsStroke } from "lucide-react";

const PetsCard = ({ pet, onClick }: { pet: Pet; onClick: () => void }) => {
  return (
    <Card
      onClick={onClick}
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl gap-0 p-0"
    >
      {/* Image Section with Gradient Overlay */}
      <div className="relative h-48 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={pet.images?.profile}
          alt={pet.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Species Badge */}
        <Badge
          variant="default"
          className="absolute top-3 left-3 shadow-lg backdrop-blur-sm bg-primary/90"
        >
          {pet.species.toUpperCase()}
        </Badge>

        {/* Pet Name Overlay */}
        <div className="absolute bottom-3 left-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
            {pet.name}
          </h3>
          <p className="text-sm text-white/90 font-medium">{pet.breed}</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-3">
        {/* Stats Grid */}
        <div className="flex flex-row items-center gap-4">
          {/* Age */}
          <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-muted border border-primary">
            <Calendar className="size-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Age</span>
              <span className="text-sm font-semibold">
                {pet.age >= 1
                  ? `${pet.age} ${pet.age === 1 ? "yr" : "yrs"}`
                  : `${Math.round(pet.age * 12)} ${
                      Math.round(pet.age * 12) === 1 ? "month" : "months"
                    }`}
              </span>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-muted border border-primary">
            <MarsStroke className="size-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Gender</span>
              <span className="text-sm font-semibold capitalize">
                {pet.gender}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PetsCard;
