-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "heading" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "imagePath" TEXT,
    "imagePrompt" TEXT,
    "suggestedImageText" TEXT,
    "hashtags" TEXT NOT NULL DEFAULT '[]',
    "logoKey" TEXT,
    "logoVariant" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "linkedinPostId" TEXT,
    "publishAs" TEXT NOT NULL DEFAULT 'PERSONAL',
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trademark" TEXT NOT NULL DEFAULT '',
    "logoKey" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "logoKey" TEXT NOT NULL DEFAULT '',
    "hashtags" TEXT NOT NULL DEFAULT '[]',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "anthropicApiKey" TEXT NOT NULL DEFAULT '',
    "openaiApiKey" TEXT NOT NULL DEFAULT '',
    "linkedinClientId" TEXT NOT NULL DEFAULT '',
    "linkedinClientSecret" TEXT NOT NULL DEFAULT '',
    "linkedinAccessToken" TEXT NOT NULL DEFAULT '',
    "linkedinPersonUrn" TEXT NOT NULL DEFAULT '',
    "linkedinOrgId" TEXT NOT NULL DEFAULT '',
    "companyName" TEXT NOT NULL DEFAULT 'XGRC Software',
    "companyLinkedInUrl" TEXT NOT NULL DEFAULT '',
    "defaultPublishAs" TEXT NOT NULL DEFAULT 'PERSONAL',
    "brandData" TEXT NOT NULL DEFAULT '{}',
    "writerConfig" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
