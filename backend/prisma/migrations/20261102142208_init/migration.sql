/*
  Warnings:

  - You are about to drop the column `first_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `user` table. All the data in the column will be lost.
  - Added the required column `name` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "first_name",
DROP COLUMN "is_verified",
DROP COLUMN "last_name",
DROP COLUMN "verified",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "proof_back_url" TEXT,
ADD COLUMN     "proof_front_url" TEXT;

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");
