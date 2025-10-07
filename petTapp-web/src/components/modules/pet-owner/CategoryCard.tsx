import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

const CategoryCard = ({ title, Icon }: { title: string; Icon: LucideIcon }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Card className="gap-0 p-6 sm:p-8 md:p-10 lg:p-12 bg-transparent border-primary border-2 text-primary hover:bg-primary hover:text-white transition-all duration-200 group">
        <Icon className="stroke-2 size-6 group-hover:scale-150 transition-all duration-200" />
      </Card>
      <p className="text-center text-sm text-primary font-medium">{title}</p>
    </div>
  );
};

export default CategoryCard;
