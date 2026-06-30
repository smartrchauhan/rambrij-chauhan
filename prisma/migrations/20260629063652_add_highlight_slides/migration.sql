-- CreateTable
CREATE TABLE "HighlightSlide" (
    "id" TEXT NOT NULL,
    "highlightId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HighlightSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HighlightSlide_highlightId_order_idx" ON "HighlightSlide"("highlightId", "order");

-- AddForeignKey
ALTER TABLE "HighlightSlide" ADD CONSTRAINT "HighlightSlide_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "Highlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
