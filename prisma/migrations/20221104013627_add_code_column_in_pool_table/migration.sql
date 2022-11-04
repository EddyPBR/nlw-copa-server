/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Pool` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pool_code_key" ON "Pool"("code");
