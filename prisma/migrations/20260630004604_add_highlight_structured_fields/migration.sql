-- AlterTable
ALTER TABLE "Highlight" ADD COLUMN     "audience" TEXT,
ADD COLUMN     "eventName" TEXT,
ADD COLUMN     "impactMetrics" TEXT,
ADD COLUMN     "keyTakeaways" TEXT,
ADD COLUMN     "technologies" TEXT,
ADD COLUMN     "transcript" TEXT;

-- AlterTable
ALTER TABLE "HighlightSlide" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'slide';

-- CreateTable
CREATE TABLE "HighlightResource" (
    "id" TEXT NOT NULL,
    "highlightId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'link',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HighlightResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HighlightResource_highlightId_order_idx" ON "HighlightResource"("highlightId", "order");

-- AddForeignKey
ALTER TABLE "HighlightResource" ADD CONSTRAINT "HighlightResource_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "Highlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
