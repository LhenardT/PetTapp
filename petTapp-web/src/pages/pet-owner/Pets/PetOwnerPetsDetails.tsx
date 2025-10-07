import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Edit, Calendar, Weight, Palette, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPetById } from "@/lib/api/pets";
import type { MedicalHistory, Vaccination } from "@/types/pets";
import AdvancedLoading from "@/components/AdvancedLoading";
import { useDeletePet } from "@/lib/query/usePet";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PetOwnerPetsDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: pet,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pet", id],
    queryFn: () => getPetById(id!),
    enabled: !!id,
  });

  const deletePetMutation = useDeletePet();

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deletePetMutation.mutateAsync(id);
      toast.success("Pet deleted successfully");
      navigate("/pet-owner/my-pets");
    } catch (error) {
      toast.error("Failed to delete pet");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AdvancedLoading />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Failed to load pet details</p>
        <Button onClick={() => navigate("/pet-owner/my-pets")}>
          Back to My Pets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/pet-owner/my-pets")}>
          <ChevronLeft className="size-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/pet-owner/my-pets/${id}/edit`)}
            variant="outline"
          >
            <Edit className="size-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="size-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {pet.name}'s profile and all associated data.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deletePetMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Hero Image with Info Overlay */}
        <div className="relative rounded-2xl overflow-hidden h-[400px] group">
          <img
            src={pet.images?.profile}
            alt={pet.name}
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute top-6 right-6">
            <Badge className="text-sm px-4 py-1.5">
              {pet.species?.toUpperCase()}
            </Badge>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-5xl font-bold text-white mb-3">{pet.name}</h1>
            <div className="flex items-center gap-6 text-white/90">
              <span className="text-lg">{pet.breed}</span>
              <span>•</span>
              <span className="capitalize text-lg">{pet.gender}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="border-2 border-primary text-center p-6 rounded-xl bg-muted/50">
            <Calendar className="text-primary size-6 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Age</p>
            <p className="text-2xl font-bold">
              {pet.age >= 1
                ? `${pet.age} ${pet.age === 1 ? "yr" : "yrs"}`
                : `${Math.round(pet.age * 12)} mo`}
            </p>
          </div>

          <div className="border-2 border-primary text-center p-6 rounded-xl bg-muted/50">
            <Weight className="text-primary size-6 mx-auto mb-2" />
            <p className="text-sm text-primary mb-1">Weight</p>
            <p className="text-2xl font-bold">{pet.weight} kg</p>
          </div>

          <div className="border-2 border-primary text-center p-6 rounded-xl bg-muted/50">
            <Palette className="text-primary size-6 mx-auto mb-2" />
            <p className="text-sm text-primary mb-1">Color</p>
            <p className="text-2xl font-bold">{pet.color}</p>
          </div>
        </div>

        {/* Medical History */}
        {pet.medicalHistory && pet.medicalHistory.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Medical History</h2>
            <div className="space-y-3">
              {pet.medicalHistory.map(
                (record: MedicalHistory, index: number) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {record.condition}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.diagnosedDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Treatment
                        </p>
                        <p className="text-sm">{record.treatment}</p>
                      </div>
                      {record.notes && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Notes
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {record.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Vaccinations */}
        {pet.vaccinations && pet.vaccinations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Vaccinations</h2>
            <div className="space-y-3">
              {pet.vaccinations.map(
                (vaccination: Vaccination, index: number) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {vaccination.vaccine}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Dr. {vaccination.veterinarian}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Administered
                        </p>
                        <p className="font-medium">
                          {new Date(
                            vaccination.administeredDate
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Next Due
                        </p>
                        <p className="font-medium">
                          {new Date(vaccination.nextDueDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {pet.specialInstructions && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Special Instructions</h2>
            <div className="p-5 rounded-xl border bg-card">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {pet.specialInstructions}
              </p>
            </div>
          </div>
        )}

        {/* Gallery */}
        {pet.images?.gallery && pet.images.gallery.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pet.images.gallery.map((image: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl overflow-hidden border hover:shadow-md transition-shadow"
                >
                  <img
                    src={image}
                    alt={`${pet.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetOwnerPetsDetails;
