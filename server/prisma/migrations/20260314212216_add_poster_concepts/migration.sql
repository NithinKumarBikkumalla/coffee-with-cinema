-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "endings" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "posterConcepts" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "relationshipMap" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "roles" JSONB,
ADD COLUMN     "shotList" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collaborator_projectId_email_key" ON "Collaborator"("projectId", "email");

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
