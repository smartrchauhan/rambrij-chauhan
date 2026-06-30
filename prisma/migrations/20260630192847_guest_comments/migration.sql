-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "guestEmail" TEXT,
ADD COLUMN     "guestName" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;
