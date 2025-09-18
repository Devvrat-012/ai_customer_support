import type { Metadata } from 'next';
import KnowledgeBaseManager from '@/components/dashboard/KnowledgeBaseManager';

export const metadata: Metadata = {
  title: 'Knowledge Base | Makora',
  description: 'Manage your AI knowledge base for enhanced customer support',
};

export default function KnowledgeBasePage() {
  return <KnowledgeBaseManager />;
}
