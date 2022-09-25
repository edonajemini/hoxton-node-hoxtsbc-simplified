/*
  Warnings:

  - You are about to drop the column `blog` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Transactions` table. All the data in the column will be lost.
  - You are about to drop the column `tittle` on the `Transactions` table. All the data in the column will be lost.
  - Added the required column `amount` to the `Transactions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transactions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transactions" ("id", "userId") SELECT "id", "userId" FROM "Transactions";
DROP TABLE "Transactions";
ALTER TABLE "new_Transactions" RENAME TO "Transactions";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
