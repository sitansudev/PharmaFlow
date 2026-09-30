import { describe, expect, it } from "vitest";

import { getPagination } from "../../shared/utils/pagination.js";
import { medicineQuerySchema } from "./medicine.query.js";

describe("medicine list limits", () => {
  it("allows a list of up to 2,000 medicines", () => {
    expect(medicineQuerySchema.parse({ limit: 2000 }).limit).toBe(2000);
    expect(getPagination({ limit: 2000 }).take).toBe(2000);
  });

  it("rejects a medicine-list limit above 2,000", () => {
    expect(medicineQuerySchema.safeParse({ limit: 2001 }).success).toBe(false);
  });
});
