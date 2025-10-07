import { useState } from "react";
import { cn } from "@/lib/utils";
import { User, CreditCard, MapPin, Lock, Settings } from "lucide-react";
import AccountProfile from "@/components/modules/account/AccountProfile";
import PaymentOptions from "@/components/modules/account/PaymentOptions";
import Addresses from "@/components/modules/account/Addresses";
import ChangePassword from "@/components/modules/account/ChangePassword";
import AccountSettings from "@/components/modules/account/AccountSettings";

type Section = "account" | "payment" | "addresses" | "password" | "settings";

const sidebarItems = [
  { id: "account" as Section, label: "Account", icon: User },
  { id: "payment" as Section, label: "Payment Options", icon: CreditCard },
  { id: "addresses" as Section, label: "Addresses", icon: MapPin },
  { id: "password" as Section, label: "Change Password", icon: Lock },
  { id: "settings" as Section, label: "Settings", icon: Settings },
];

const PetOwnerMyAccount = () => {
  const [activeSection, setActiveSection] = useState<Section>("account");

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return <AccountProfile />;
      case "payment":
        return <PaymentOptions />;
      case "addresses":
        return <Addresses />;
      case "password":
        return <ChangePassword />;
      case "settings":
        return <AccountSettings />;
      default:
        return <AccountProfile />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-lg p-4 space-y-2 sticky top-6">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-card border rounded-lg p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetOwnerMyAccount;
