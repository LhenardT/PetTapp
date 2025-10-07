import { CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";

const PaymentOptions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payment Options</h2>
        <p className="text-muted-foreground">
          Manage your payment methods
        </p>
      </div>

      {/* Placeholder Content */}
      <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="size-16 rounded-full bg-muted flex items-center justify-center">
          <CreditCard className="size-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Payment Options Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We're working on integrating payment methods.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PaymentOptions;
