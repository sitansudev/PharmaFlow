/*
  Remove accidental duplicate latestPurchasePrice column.

  latestRate is the canonical field.
  latestPurchasePrice was recreated accidentally and is empty.
*/

ALTER TABLE "Medicine"
DROP COLUMN "latestPurchasePrice";
