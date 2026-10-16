import { Badge, type BadgeTone } from "@/components/atoms/Badge";
import type { ProductTag } from "@/types/product";

const tagTones: Record<ProductTag, BadgeTone> = {
  Bestseller: "warning",
  New: "info",
};

export function ProductTagBadges({ tag }: { tag?: ProductTag }) {
  if (!tag) return null;
  return (
    <Badge tone={tagTones[tag]} className="normal-case">
      {tag}
    </Badge>
  );
}
