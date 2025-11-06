import { Card } from "@/components/ui/card";
import { Award } from "lucide-react";

interface BadgeCardProps {
  name: string;
  description: string;
  earned?: boolean;
  iconUrl?: string;
}

export function BadgeCard({ name, description, earned = false, iconUrl }: BadgeCardProps) {
  return (
    <Card 
      className={`p-4 text-center transition-smooth ${
        earned 
          ? "shadow-float bg-card" 
          : "opacity-50 grayscale bg-muted"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        {iconUrl ? (
          <img src={iconUrl} alt={name} className="h-16 w-16" />
        ) : (
          <Award className={`h-16 w-16 ${earned ? "text-primary" : "text-muted-foreground"}`} />
        )}
        <h3 className="font-semibold">{name}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}
