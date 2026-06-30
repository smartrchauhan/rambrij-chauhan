-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Comment_postId_approved_idx" ON "Comment"("postId", "approved");
