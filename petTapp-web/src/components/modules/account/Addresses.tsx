import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, MapPin, Star, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useGetAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/lib/query/useAddress";
import type { Address } from "@/lib/api/addresses";
import { toast } from "sonner";
import { MapPicker } from "@/components/ui/map-picker";

const Addresses = () => {
  const { data: addresses = [], isLoading } = useGetAddresses();
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Philippines",
    latitude: "",
    longitude: "",
  });

  const handleAddOrEdit = async () => {
    try {
      const addressData = {
        label: formData.label,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      if (editingAddress) {
        await updateAddressMutation.mutateAsync({
          id: editingAddress._id,
          data: addressData,
        });
        toast.success("Address updated successfully");
      } else {
        await createAddressMutation.mutateAsync(addressData);
        toast.success("Address added successfully");
      }
      resetForm();
    } catch (error) {
      toast.error(editingAddress ? "Failed to update address" : "Failed to add address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddressMutation.mutateAsync(id);
      toast.success("Default address updated");
    } catch (error) {
      toast.error("Failed to set default address");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddressMutation.mutateAsync(id);
      toast.success("Address deleted successfully");
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      latitude: address.latitude?.toString() || "",
      longitude: address.longitude?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      label: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Philippines",
      latitude: "",
      longitude: "",
    });
    setEditingAddress(null);
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Addresses</h2>
          <p className="text-muted-foreground">
            Manage your delivery addresses
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="size-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription>
                {editingAddress
                  ? "Update your address details"
                  : "Add a new delivery address"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Address Label</Label>
                <Input
                  id="label"
                  placeholder="Home, Work, etc."
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Textarea
                  id="street"
                  placeholder="123 Main Street, Unit 456"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Manila"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="Metro Manila"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="1000"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location on Map (Optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Click on the map to set your location
                </p>
                <MapPicker
                  latitude={formData.latitude ? parseFloat(formData.latitude) : undefined}
                  longitude={formData.longitude ? parseFloat(formData.longitude) : undefined}
                  onLocationSelect={(lat, lng) => {
                    setFormData({
                      ...formData,
                      latitude: lat.toString(),
                      longitude: lng.toString(),
                    });
                  }}
                />
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-xs text-muted-foreground">
                      Latitude
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="14.5995"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-xs text-muted-foreground">
                      Longitude
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="120.9842"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddOrEdit}
                  disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                >
                  {(createAddressMutation.isPending || updateAddressMutation.isPending) ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      {editingAddress ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editingAddress ? "Update Address" : "Add Address"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Address List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length === 0 ? (
          <Card className="col-span-2 p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="size-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No Addresses Yet</h3>
              <p className="text-sm text-muted-foreground">
                Add your first delivery address to get started
              </p>
            </div>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card
              key={address._id}
              className={`${address.isDefault && "ring-2 ring-primary"} p-4 space-y-3 relative`}
            >
              {address.isDefault && (
                <Badge className="absolute top-4 right-4">
                  <Star className="size-3 mr-1" />
                  Default
                </Badge>
              )}

              <div className="pr-20">
                <h3 className="font-semibold text-lg">{address.label}</h3>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p>{address.country}</p>
                {(address.latitude && address.longitude) && (
                  <p className="text-xs flex items-center gap-1">
                    <MapPin className="size-3" />
                    {address.latitude}, {address.longitude}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2 flex-wrap">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address._id)}
                    disabled={setDefaultAddressMutation.isPending}
                  >
                    {setDefaultAddressMutation.isPending ? (
                      <Loader2 className="size-3 mr-1 animate-spin" />
                    ) : (
                      <Star className="size-3 mr-1" />
                    )}
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(address)}
                >
                  <Pencil className="size-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(address._id)}
                >
                  <Trash2 className="size-3 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleteAddressMutation.isPending}
            >
              {deleteAddressMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Addresses;
