import { ListingType, PropertyType } from "@prisma/client";
import { z } from "zod";

export const listingQuerySchema = z.object({
  q: z.string().trim().optional(),
  county: z.string().trim().optional(),
  town: z.string().trim().optional(),
  estate: z.string().trim().optional(),
  type: z.enum([ListingType.RENT, ListingType.SALE]).optional(),
  propertyType: z.enum(Object.values(PropertyType) as [PropertyType, ...PropertyType[]]).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  minBedrooms: z.coerce.number().int().nonnegative().optional(),
  minBathrooms: z.coerce.number().int().nonnegative().optional(),
});

export type ListingQuery = z.infer<typeof listingQuerySchema>;
