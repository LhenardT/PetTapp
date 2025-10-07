import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { lazy, Suspense } from "react";

// Components
import { ProtectedRoute } from "@/components/protected-route";

// Layouts (keep these eagerly loaded)
import MainLayout from "@/layout/main-layout";
import PetOwnerLayout from "@/layout/pet-owner-layout";
import BusinessOwnerLayout from "@/layout/business-owner-layout";
import AdminLayout from "@/layout/admin-layout";

// Public Routes (keep auth pages eagerly loaded for better UX)
import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";
import LandingPage from "@/pages/public/LandingPage";

// Lazy load all other pages
const PetOwnerDashboard = lazy(() => import("@/pages/pet-owner/PetOwnerDashboard"));
const PetOwnerServices = lazy(() => import("@/pages/pet-owner/services/PetOwnerServices"));
const PetOwnerServiceDetails = lazy(() => import("@/pages/pet-owner/services/PetOwnerServiceDetails"));
const PetOwnerSchedules = lazy(() => import("@/pages/pet-owner/PetOwnerSchedules"));
const PetOwnerPets = lazy(() => import("@/pages/pet-owner/Pets/PetOwnerPets"));
const PetOwnerMyAccount = lazy(() => import("@/pages/pet-owner/PetOwnerMyAccount"));
const PetOwnerPetsAdd = lazy(() => import("@/pages/pet-owner/Pets/PetOwnerPetsAdd"));
const PetOwnerPetsEdit = lazy(() => import("@/pages/pet-owner/Pets/PetOwnerPetsEdit"));
const PetOwnerPetsDetails = lazy(() => import("@/pages/pet-owner/Pets/PetOwnerPetsDetails"));
const PetOwnerBusinesses = lazy(() => import("@/pages/pet-owner/businesses/PetOwnerBusinesses"));
const BusinessDetailPage = lazy(() => import("@/pages/pet-owner/businesses/BusinessDetailPage"));
const BusinessDashboard = lazy(() => import("@/pages/business-owner/BusinessDashboard"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));
import AdvancedLoading from "@/components/AdvancedLoading";


export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["pet-owner"]} />}>
        <Route path="/pet-owner" element={<PetOwnerLayout />}>
          <Route index element={<Suspense fallback={<AdvancedLoading />}><PetOwnerDashboard /></Suspense>} />
          <Route path="services" element={<Suspense fallback={<AdvancedLoading />}><PetOwnerServices /></Suspense>} />
          <Route path="services/:id" element={<Suspense fallback={<AdvancedLoading />}><PetOwnerServiceDetails /></Suspense>} />
          <Route path="schedules" element={<Suspense fallback={<AdvancedLoading />}><PetOwnerSchedules /></Suspense>} />
          <Route path="my-pets" element={<Suspense fallback={<AdvancedLoading />}><PetOwnerPets /></Suspense>} />
          <Route path="my-pets/add" element={<Suspense fallback={<AdvancedLoading />}><PetOwnerPetsAdd /></Suspense>} />
          <Route path="my-pets/:id" element={<Suspense fallback={<AdvancedLoading />}><PetOwnerPetsDetails /></Suspense>} />
          <Route path="my-pets/:id/edit" element={<Suspense fallback={<AdvancedLoading />}><PetOwnerPetsEdit /></Suspense>} />
          <Route path="my-account" element={<Suspense fallback={<AdvancedLoading />}><PetOwnerMyAccount /></Suspense>} />
          <Route path="businesses" element={<Suspense fallback={<AdvancedLoading />}><PetOwnerBusinesses /></Suspense>} />
          <Route path="businesses/:id" element={<Suspense fallback={<AdvancedLoading />}><BusinessDetailPage /></Suspense>} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["business-owner"]} />}>
        <Route path="/business-owner" element={<BusinessOwnerLayout />}>
          <Route index element={<Suspense fallback={<AdvancedLoading />}><BusinessDashboard /></Suspense>} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Suspense fallback={<AdvancedLoading />}><AdminDashboard /></Suspense>} />
        </Route>
      </Route>

      <Route path="*" element={<Suspense fallback={<AdvancedLoading />}><NotFound /></Suspense>} />
    </>
  )
);
