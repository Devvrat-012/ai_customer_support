import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { processDocument } from '@/lib/vector/knowledge';

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = authResult.user;

    // Get current user data including company info
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        companyInfo: true,
        companyName: true,
      }
    });

    if (!userData?.companyInfo) {
      return NextResponse.json(
        { error: 'No company data found to migrate' }, 
        { status: 400 }
      );
    }

    // Check if migration has already been done
    const existingKnowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        userId: user.userId,
        name: 'Company Data (Migrated)',
      }
    });

    if (existingKnowledgeBase) {
      return NextResponse.json(
        { error: 'Company data has already been migrated to knowledge base' },
        { status: 400 }
      );
    }

    // Create knowledge base from company data
    const knowledgeBaseName = userData.companyName 
      ? `${userData.companyName} - Company Data` 
      : 'Company Data (Migrated)';

    const result = await processDocument(
      user.userId,
      userData.companyInfo,
      {
        name: knowledgeBaseName,
        description: 'Migrated from legacy company data',
        sourceType: 'MANUAL',
      }
    );

    // Clear the old company_info field after successful migration
    await prisma.user.update({
      where: { id: user.userId },
      data: { companyInfo: null }
    });

    return NextResponse.json({
      success: true,
      message: 'Company data successfully migrated to knowledge base',
      knowledgeBaseId: result.knowledgeBaseId,
      totalChunks: result.totalChunks
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate company data' },
      { status: 500 }
    );
  }
}
