/*
  Rename purchase/sale pricing fields safely.

  Purchase:
    PurchaseItem.purchasePrice -> rate

  Sale:
    SaleItem.sellingPrice -> mrp

  Medicine:
    latestPurchasePrice -> latestRate

  MedicineBatch:
    Existing rate already contains the purchase rate.
    Old purchasePrice is therefore removed.
    Medicine.sellingPrice is removed because MRP now
    belongs to MedicineBatch.
*/


/*
 * Medicine
 *
 * Preserve latest purchase-price data by renaming
 * the existing summary field.
 */
ALTER TABLE "Medicine"
RENAME COLUMN "latestPurchasePrice" TO "latestRate";


/*
 * Medicine sellingPrice
 *
 * Selling price is no longer stored at Medicine level.
 * MRP belongs to the batch.
 */
ALTER TABLE "Medicine"
DROP COLUMN "sellingPrice";


/*
 * MedicineBatch
 *
 * `rate` already exists and contains the purchase rate.
 *
 * The old `purchasePrice` column is redundant.
 */
ALTER TABLE "MedicineBatch"
DROP COLUMN "purchasePrice";


/*
 * PurchaseItem
 *
 * Rename instead of drop + add so all historical
 * purchase records are preserved.
 */
ALTER TABLE "PurchaseItem"
RENAME COLUMN "purchasePrice" TO "rate";


/*
 * SaleItem
 *
 * Rename instead of drop + add so all historical
 * sales retain their original selling price.
 */
ALTER TABLE "SaleItem"
RENAME COLUMN "sellingPrice" TO "mrp";
