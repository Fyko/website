-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "short" TEXT NOT NULL,
    "long" TEXT NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);
