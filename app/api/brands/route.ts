import { makeTaxonomyRoute } from "@/lib/taxonomyRoute";
import { brandSchema } from "@/features/brands/schema";

const route = makeTaxonomyRoute({ resource: "brands", key: "brand", label: "brand", inputSchema: brandSchema });

export const GET = route.GET;
export const POST = route.POST;
