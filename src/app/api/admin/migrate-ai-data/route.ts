import { NextRequest, NextResponse } from 'next/server';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import type { Schema } from '../../../../../amplify/data/resource';
import { requireRole } from '@/lib/auth-server';
import { cookies } from 'next/headers';
import outputs from '../../../../../amplify_outputs.json';

const cookieBasedClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});

interface MigrationResult {
  success: boolean;
  totalPhotos: number;
  photosWithLegacyAI: number;
  photosAlreadyMigrated: number;
  photosMigrated: number;
  photosSkipped: number;
  errors: string[];
  duration: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify admin access
    await requireRole('admin');

    const { dryRun } = await request.json();

    const result: MigrationResult = {
      success: true,
      totalPhotos: 0,
      photosWithLegacyAI: 0,
      photosAlreadyMigrated: 0,
      photosMigrated: 0,
      photosSkipped: 0,
      errors: [],
      duration: 0,
    };

    // Step 1: Fetch all photos
    const { data: photos, errors: photoErrors } = await cookieBasedClient.models.Photo.list();

    if (photoErrors) {
      result.success = false;
      result.errors.push(`Failed to fetch photos: ${JSON.stringify(photoErrors)}`);
      result.duration = Date.now() - startTime;
      return NextResponse.json(result);
    }

    if (!photos || photos.length === 0) {
      result.duration = Date.now() - startTime;
      return NextResponse.json(result);
    }

    result.totalPhotos = photos.length;

    // Step 2: Process each photo with legacy AI data
    for (const photo of photos) {
      // Skip photos without legacy AI analysis
      if (!photo.aiAnalyzed || !photo.aiOverallScore) {
        result.photosSkipped++;
        continue;
      }

      result.photosWithLegacyAI++;

      // Check if this photo already has reports in PhotoAIReport table
      try {
        const { data: existingReports } = await cookieBasedClient.models.PhotoAIReport.list({
          filter: { photoId: { eq: photo.id } },
        });

        if (existingReports && existingReports.length > 0) {
          result.photosAlreadyMigrated++;
          continue;
        }
      } catch (error) {
        result.errors.push(`Photo ${photo.id}: Failed to check existing reports - ${error}`);
        continue;
      }

      // Validate that we have complete legacy data
      const hasCompleteData =
        photo.aiCompositionScore !== null &&
        photo.aiLightingScore !== null &&
        photo.aiSubjectScore !== null &&
        photo.aiTechnicalScore !== null &&
        photo.aiCreativityScore !== null &&
        photo.aiOverallScore !== null;

      if (!hasCompleteData) {
        result.photosSkipped++;
        continue;
      }

      // Prepare migration data
      const reportData = {
        photoId: photo.id,
        compositionScore: photo.aiCompositionScore || 0,
        compositionRationale: photo.aiCompositionRationale || '',
        lightingScore: photo.aiLightingScore || 0,
        lightingRationale: photo.aiLightingRationale || '',
        subjectScore: photo.aiSubjectScore || 0,
        subjectRationale: photo.aiSubjectRationale || '',
        technicalScore: photo.aiTechnicalScore || 0,
        technicalRationale: photo.aiTechnicalRationale || '',
        creativityScore: photo.aiCreativityScore || 0,
        creativityRationale: photo.aiCreativityRationale || '',
        overallScore: photo.aiOverallScore,
        analyzedAt: photo.aiAnalyzedAt || photo.createdAt || new Date().toISOString(),
      };

      if (!dryRun) {
        // Create the report in PhotoAIReport table
        try {
          const { data: newReport, errors: createErrors } = await cookieBasedClient.models.PhotoAIReport.create(reportData);

          if (createErrors || !newReport) {
            result.errors.push(`Photo ${photo.id}: Failed to create report - ${JSON.stringify(createErrors)}`);
          } else {
            result.photosMigrated++;
          }
        } catch (error) {
          result.errors.push(`Photo ${photo.id}: Exception during migration - ${error}`);
        }
      } else {
        result.photosMigrated++;
      }
    }

    result.duration = Date.now() - startTime;
    result.success = result.errors.length === 0;

    return NextResponse.json(result);
  } catch (error) {
    console.error('[migrate-ai-data] Error:', error);

    // Handle authorization errors
    if (error instanceof Error) {
      if (error.message.includes('Authentication required') ||
          error.message.includes('not authenticated')) {
        return NextResponse.json(
          { error: 'Authentication required', success: false },
          { status: 401 }
        );
      }
      if (error.message.includes('Role') ||
          error.message.includes('Admin access required')) {
        return NextResponse.json(
          { error: 'Admin access required', success: false },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Migration failed',
        success: false,
      },
      { status: 500 }
    );
  }
}
