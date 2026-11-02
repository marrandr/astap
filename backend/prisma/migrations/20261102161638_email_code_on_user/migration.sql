-- AlterTable
ALTER TABLE "user" ADD COLUMN     "email_code_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "email_code_expires_at" TIMESTAMP(3),
ADD COLUMN     "email_code_hash" TEXT,
ADD COLUMN     "email_code_sent_at" TIMESTAMP(3),
ADD COLUMN     "email_verified_at" TIMESTAMP(3),
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
