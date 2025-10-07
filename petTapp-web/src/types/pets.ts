export interface MedicalHistory {
  condition: string;
  diagnosedDate: string;
  treatment: string;
  notes?: string;
}

export interface Vaccination {
  vaccine: string;
  administeredDate: string;
  nextDueDate: string;
  veterinarian: string;
}


export interface Pet {
  _id?: string;
  name: string;
  species: "dog" | "cat" | "bird" | "fish" | "rabbit" | "hamster" | "guinea-pig" | "reptile" | "other";
  breed: string;
  age: number;
  gender: "male" | "female";
  weight: number;
  color: string;
  medicalHistory?: MedicalHistory[];
  vaccinations?: Vaccination[];
  specialInstructions?: string;
  images?: {
    gallery: string[];
    profile: string;
  };
}