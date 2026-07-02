-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "nextPostId" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_nextPostId_fkey" FOREIGN KEY ("nextPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
