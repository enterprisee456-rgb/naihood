# Naihood API Contract

## `GET /api/listings`

Returns active property listings for the marketplace.

### Query parameters

- `q`: free-text search across title, description, county, town, and estate
- `county`: exact county filter
- `town`: exact town filter
- `estate`: exact estate filter
- `type`: `RENT` or `SALE`
- `propertyType`: `APARTMENT`, `HOUSE`, `BED_SITTER`, `STUDIO`, `LAND`, or `COMMERCIAL`
- `minPrice`: minimum price in KES
- `maxPrice`: maximum price in KES

### Success response

```json
{
  "data": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "type": "RENT",
      "propertyType": "APARTMENT",
      "priceKes": 28000,
      "bedrooms": 2,
      "bathrooms": 2,
      "amenities": "Parking,Water",
      "imageUrl": "https://...",
      "status": "ACTIVE",
      "location": {
        "county": "Trans-Nzoia",
        "town": "Kitale",
        "estate": "Milimani"
      },
      "owner": {
        "name": "Naihood Homes",
        "role": "AGENT"
      }
    }
  ],
  "meta": {
    "count": 1,
    "filters": {}
  }
}
```

Invalid query values return `400` with an `error` string and Zod validation details.
