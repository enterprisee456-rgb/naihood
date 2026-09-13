import { ListingType, PropertyType } from "@prisma/client";
import { z } from "zod";

export const listingQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  county: z.string().trim().max(100).optional(),
  town: z.string().trim().max(100).optional(),
  estate: z.string().trim().max(100).optional(),
  type: z.enum([ListingType.RENT, ListingType.SALE]).optional(),
  propertyType: z.enum(Object.values(PropertyType) as [PropertyType, ...PropertyType[]]).optional(),
  minPrice: z.coerce.number().int().nonnegative().max(2_000_000_000).optional(),
  maxPrice: z.coerce.number().int().positive().max(2_000_000_000).optional(),
  minBedrooms: z.coerce.number().int().nonnegative().max(50).optional(),
  minBathrooms: z.coerce.number().int().nonnegative().max(50).optional(),
});

export type ListingQuery = z.infer<typeof listingQuerySchema>;
