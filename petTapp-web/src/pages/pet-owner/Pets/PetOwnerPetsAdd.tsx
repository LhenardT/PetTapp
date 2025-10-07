import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatePet } from "@/lib/query/usePet";
import { toast } from "sonner";
import { useState } from "react";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, "Pet name is required"),
  species: z.enum(["dog", "cat", "bird", "fish", "rabbit", "hamster", "guinea-pig", "reptile", "other"]),
  breed: z.string().min(1, "Breed is required"),
  age: z.number().min(0, "Age must be 0 or greater"),
  gender: z.enum(["male", "female"]),
  weight: z.number().min(0, "Weight must be greater than 0"),
  color: z.string().min(1, "Color is required"),
  medicalHistory: z
    .array(
      z.object({
        condition: z.string().min(1, "Condition is required"),
        diagnosedDate: z.string().min(1, "Diagnosed date is required"),
        treatment: z.string().min(1, "Treatment is required"),
        notes: z.string().optional(),
      })
    )
    .optional(),
  vaccinations: z
    .array(
      z.object({
        vaccine: z.string().min(1, "Vaccine name is required"),
        administeredDate: z.string().min(1, "Administered date is required"),
        nextDueDate: z.string().min(1, "Next due date is required"),
        veterinarian: z.string().min(1, "Veterinarian is required"),
      })
    )
    .optional(),
  specialInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PetOwnerPetsAdd = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const createPetMutation = useCreatePet();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      species: "dog",
      breed: "",
      age: 0,
      gender: "male",
      weight: 0,
      color: "",
      medicalHistory: [],
      vaccinations: [],
      specialInstructions: "",
    },
  });

  const {
    fields: medicalHistoryFields,
    append: appendMedicalHistory,
    remove: removeMedicalHistory,
  } = useFieldArray({
    control: form.control,
    name: "medicalHistory",
  });

  const {
    fields: vaccinationFields,
    append: appendVaccination,
    remove: removeVaccination,
  } = useFieldArray({
    control: form.control,
    name: "vaccinations",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  async function onSubmit(values: FormValues) {
    try {
      // Create the pet with optional profile image in a single API call
      await createPetMutation.mutateAsync({
        petData: values,
        profileImage: profileImage || undefined,
      });

      toast.success("Pet added successfully!");
      navigate("/pet-owner/my-pets");
    } catch (error) {
      toast.error("Failed to add pet. Please try again.");
      console.error(error);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="outline" onClick={() => navigate("/pet-owner/my-pets")}>
        <ChevronLeft className="size-4" /> Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Add New Pet</h1>
        <p className="text-muted-foreground">
          Fill in the details about your pet
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                {previewUrl && (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                      src={previewUrl}
                      alt="Pet preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col items-center gap-2">
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Max size: 5MB. Formats: JPEG, PNG, WebP
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Buddy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Species</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select species" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="bird">Bird</SelectItem>
                          <SelectItem value="fish">Fish</SelectItem>
                          <SelectItem value="rabbit">Rabbit</SelectItem>
                          <SelectItem value="hamster">Hamster</SelectItem>
                          <SelectItem value="guinea-pig">Guinea Pig</SelectItem>
                          <SelectItem value="reptile">Reptile</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breed</FormLabel>
                      <FormControl>
                        <Input placeholder="Golden Retriever" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="3"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="25.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Golden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Medical History</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendMedicalHistory({
                      condition: "",
                      diagnosedDate: "",
                      treatment: "",
                      notes: "",
                    })
                  }
                >
                  <Plus className="size-4 mr-2" />
                  Add Record
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicalHistoryFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg space-y-4 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeMedicalHistory(index)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                    <FormField
                      control={form.control}
                      name={`medicalHistory.${index}.condition`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <FormControl>
                            <Input placeholder="Condition" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medicalHistory.${index}.diagnosedDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosed Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medicalHistory.${index}.treatment`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatment</FormLabel>
                          <FormControl>
                            <Input placeholder="Treatment" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medicalHistory.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Notes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              {medicalHistoryFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No medical history added yet. Click "Add Record" to get
                  started.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Vaccinations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vaccinations</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendVaccination({
                      vaccine: "",
                      administeredDate: "",
                      nextDueDate: "",
                      veterinarian: "",
                    })
                  }
                >
                  <Plus className="size-4 mr-2" />
                  Add Vaccination
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {vaccinationFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg space-y-4 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeVaccination(index)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                    <FormField
                      control={form.control}
                      name={`vaccinations.${index}.vaccine`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vaccine</FormLabel>
                          <FormControl>
                            <Input placeholder="Vaccine name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`vaccinations.${index}.administeredDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Administered Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`vaccinations.${index}.nextDueDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`vaccinations.${index}.veterinarian`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Veterinarian</FormLabel>
                          <FormControl>
                            <Input placeholder="Vet name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              {vaccinationFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No vaccinations added yet. Click "Add Vaccination" to get
                  started.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special care instructions..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/pet-owner/my-pets")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPetMutation.isPending}
            >
              {createPetMutation.isPending ? "Adding..." : "Add Pet"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PetOwnerPetsAdd;
