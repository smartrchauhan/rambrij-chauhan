-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "previousPostId" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_previousPostId_fkey" FOREIGN KEY ("previousPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
