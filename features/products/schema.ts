import { z } from "zod";
import { productAttributeKeys, productGenders, productTags } from "@/types/product";

export const MAX_PRODUCT_IMAGES = 8;
export const MAX_PRODUCT_VARIANTS = 120;

const keyName = (label: string) =>
  z
    .string()
    .trim()
    .min(1, { error: `Enter a ${label}.` })
    .max(40)
    .regex(/^[^.$]+$/, { error: `A ${label} can't contain "." or "$".` });

// Optional product SKU code, e.g. "FK-DRS-0012". Saved upper-case; must be unique across products.
const SKU_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/_-]*$/;
const skuField = z
  .string()
  .trim()
  .max(40, { error: "SKU code can be up to 40 characters." })
  .refine((v) => v === "" || SKU_PATTERN.test(v), { error: "Use letters, numbers, - _ or / only (no spaces)." });

const attributesSchema = z.object(
  Object.fromEntries(productAttributeKeys.map((k) => [k, z.string().trim().max(100, { error: "Up to 100 characters." })])) as Record<
    (typeof productAttributeKeys)[number],
    z.ZodString
  >,
);

export const productSizeRowSchema = z.object({
  id: z.string().optional(),
  size: keyName("size"),
  stock: z
    .number({ error: "Enter stock." })
    .int({ error: "Whole numbers only." })
    .nonnegative({ error: "Can't be negative." })
    .nullable(),
});

export const productColorSchema = z.object({
  name: keyName("colour"),
  hex: z.string().regex(/^#[0-9a-f]{6}$/i),
  sizes: z.array(productSizeRowSchema).min(1, { error: "Add at least one size." }),
});

export type ProductColorInput = z.infer<typeof productColorSchema>;

export const productSchema = z
  .object({
    name: z.string().trim().min(2, { error: "Product name must be at least 2 characters." }).max(120),
    sku: skuField,
    categoryId: z.string().min(1, { error: "Select a category." }),
    brandId: z.string(),
    subcategory: z.string().trim().max(60),
    gender: z.enum(productGenders, { error: "Select a gender." }),
    tag: z.enum([...productTags, ""]),
    originalPrice: z.number({ error: "Enter the MRP." }).positive({ error: "MRP must be greater than 0." }),
    price: z.number({ error: "Enter the selling price." }).positive({ error: "Selling price must be greater than 0." }),
    costPrice: z.number({ error: "Enter the cost price." }).nonnegative({ error: "Cost price can't be negative." }),
    reorderLevel: z.number({ error: "Enter a reorder level." }).int().nonnegative({ error: "Can't be negative." }),
    shortDescription: z.string().trim().max(200),
    description: z.string().trim().max(5000),
    fabric: z.string().trim().max(300),
    fit: z.string().trim().max(300),
    care: z.string().trim().max(300),
    images: z.array(z.url()).max(MAX_PRODUCT_IMAGES, { error: `Up to ${MAX_PRODUCT_IMAGES} images per product.` }),
    attributes: attributesSchema,
    colors: z.array(productColorSchema).min(1, { error: "Add at least one colour." }),
    published: z.boolean(),
  })
  .refine((p) => p.price <= p.originalPrice, {
    path: ["price"],
    error: "Selling price can't be higher than the MRP.",
  })
  .superRefine((p, ctx) => {
    const colors = new Set<string>();
    let total = 0;
    p.colors.forEach((c, ci) => {
      const name = c.name.trim().toLowerCase();
      if (colors.has(name)) ctx.addIssue({ code: "custom", path: ["colors", ci, "name"], message: "This colour is already listed." });
      colors.add(name);
      const sizes = new Set<string>();
      c.sizes.forEach((s, si) => {
        const size = s.size.trim().toLowerCase();
        if (sizes.has(size)) ctx.addIssue({ code: "custom", path: ["colors", ci, "sizes", si, "size"], message: "Size already listed." });
        sizes.add(size);
      });
      total += c.sizes.length;
    });
    if (total > MAX_PRODUCT_VARIANTS) {
      ctx.addIssue({ code: "custom", path: ["colors"], message: `Up to ${MAX_PRODUCT_VARIANTS} colour and size combinations per product.` });
    }
  });

export type ProductInput = z.infer<typeof productSchema>;

export const productVariantWriteSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/).optional(),
  color: keyName("colour"),
  size: keyName("size"),
  stock: z.number().int().nonnegative().nullable().optional(),
});

export const productWriteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  sku: z.string().max(40).regex(SKU_PATTERN).nullable(),
  categoryId: z.string().regex(/^[a-f0-9]{24}$/),
  brandId: z.string().regex(/^[a-f0-9]{24}$/).nullable(),
  subcategory: z.string().max(60),
  gender: z.enum(productGenders),
  tag: z.enum(productTags).nullable(),
  price: z.number().positive(),
  oldPrice: z.number().nonnegative().nullable(),
  costPrice: z.number().nonnegative(),
  reorderLevel: z.number().int().nonnegative(),
  shortDescription: z.string().max(200),
  description: z.string().max(5000),
  fabric: z.string().max(300),
  fit: z.string().max(300),
  care: z.string().max(300),
  images: z.array(z.url()).max(MAX_PRODUCT_IMAGES),
  attributes: attributesSchema.partial(),
  colors: z.array(z.object({ name: keyName("colour"), hex: z.string().regex(/^#[0-9a-f]{6}$/i) })),
  variants: z.array(productVariantWriteSchema).min(1).max(MAX_PRODUCT_VARIANTS),
  published: z.boolean(),
});

export type ProductWrite = z.infer<typeof productWriteSchema>;

export const stockAdjustmentWriteSchema = z.object({
  reason: z.enum(["manual", "count", "received", "damaged", "returned", "correction", "transfer"]).optional(),
  note: z.string().max(300).optional(),
  adjustments: z
    .array(
      z.union([
        z.object({ variantId: z.string().regex(/^[a-f0-9]{24}$/), set: z.number().int().nonnegative() }),
        z.object({ variantId: z.string().regex(/^[a-f0-9]{24}$/), delta: z.number().int().refine((n) => n !== 0) }),
      ]),
    )
    .min(1)
    .max(MAX_PRODUCT_VARIANTS),
});

export type StockAdjustmentWrite = z.infer<typeof stockAdjustmentWriteSchema>;

export const signImageUrlsSchema = z.object({
  urls: z.array(z.url()).min(1).max(50),
});

// --- AI product details (Gemini, via the ERP backend) ---------------------------------------------------

export const analyzeImageSchema = z.object({
  imageUrl: z.url(),
  hints: z.object({ name: z.string().max(120), category: z.string().max(60), gender: z.string().max(10), description: z.string().max(1000) }).partial().optional(),
  regenerate: z.boolean().optional(),
});
