import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useDeleteAccount } from "@/lib/query/useUser";

const AccountSettings = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const deleteAccountMutation = useDeleteAccount();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  const handleDeleteAccount = async () => {
    if (confirmEmail !== user?.email) {
      toast.error("Email doesn't match");
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync();
      toast.success("Account deleted successfully");
      await logout();
      navigate("/login");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to delete account";
      toast.error(errorMessage);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      {/* Danger Zone */}
      <Card className="p-6 space-y-4 border-destructive">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Delete Account</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. Please be certain.
              This will permanently delete:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4 ml-4">
              <li>• Your profile information</li>
              <li>• All your pets' data</li>
              <li>• Your booking history</li>
              <li>• Your saved addresses</li>
              <li>• All associated data</li>
            </ul>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="size-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This action <strong>cannot be undone</strong>. This will permanently
                delete your account and remove all your data from our servers.
              </p>
              <div className="space-y-2">
                <Label htmlFor="confirmEmail">
                  Type your email <strong>{user?.email}</strong> to confirm:
                </Label>
                <Input
                  id="confirmEmail"
                  type="email"
                  placeholder={user?.email}
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmEmail("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={confirmEmail !== user?.email || deleteAccountMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAccountMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountSettings;
