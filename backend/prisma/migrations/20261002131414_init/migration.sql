-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "issuer" TEXT NOT NULL,
    "acsUrl" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL DEFAULT '',
    "relayState" TEXT NOT NULL DEFAULT '',
    "signResponse" BOOLEAN NOT NULL DEFAULT true,
    "digestAlgorithm" TEXT NOT NULL DEFAULT 'sha256',
    "signatureAlgorithm" TEXT NOT NULL DEFAULT 'rsa-sha256',
    "lifetimeInSeconds" INTEGER NOT NULL DEFAULT 3600,
    "authnContextClassRef" TEXT NOT NULL,
    "allowRequestAcsUrl" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SamlRequest" (
    "id" TEXT NOT NULL,
    "samlId" TEXT,
    "issuer" TEXT,
    "acsUrl" TEXT,
    "relayState" TEXT,
    "forceAuthn" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SamlRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
