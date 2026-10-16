import type { IconType } from "react-icons";
import { Card } from "@/components/atoms/Card";

export interface ComingSoonProps {
  icon: IconType;
  message?: string;
}

export function ComingSoon({ icon: Icon, message = "This section is coming soon." }: ComingSoonProps) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <Icon className="h-10 w-10 text-champagne-500" />
      <p className="text-sm text-ink-muted">{message}</p>
    </Card>
  );
}
