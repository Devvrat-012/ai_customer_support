-- CreateEnum
CREATE TYPE "public"."CustomerConversationStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."CustomerMessageSender" AS ENUM ('CUSTOMER', 'AI');

-- CreateEnum
CREATE TYPE "public"."CustomerMessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE');

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "company_user_id" TEXT NOT NULL,
    "customer_name" TEXT,
    "customer_email" TEXT,
    "customer_phone" TEXT,
    "customer_meta" JSONB,
    "session_count" INTEGER NOT NULL DEFAULT 0,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_conversations" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "status" "public"."CustomerConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender" "public"."CustomerMessageSender" NOT NULL,
    "content" TEXT NOT NULL,
    "message_type" "public"."CustomerMessageType" NOT NULL DEFAULT 'TEXT',
    "ai_model" TEXT,
    "tokens_used" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_id_company_user_id_key" ON "public"."customers"("customer_id", "company_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_conversations_customer_id_session_id_key" ON "public"."customer_conversations"("customer_id", "session_id");

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_company_user_id_fkey" FOREIGN KEY ("company_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_conversations" ADD CONSTRAINT "customer_conversations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_messages" ADD CONSTRAINT "customer_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."customer_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
