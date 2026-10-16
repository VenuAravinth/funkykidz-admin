import { makeTaxonomyRoute } from "@/lib/taxonomyRoute";
import { categorySchema } from "@/features/categories/schema";

const route = makeTaxonomyRoute({ resource: "categories", key: "category", label: "category", inputSchema: categorySchema });

export const GET = route.GET;
export const POST = route.POST;
