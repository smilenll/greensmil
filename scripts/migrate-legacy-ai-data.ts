#!/usr/bin/env tsx
/**
 * Migration Script: Legacy AI Analysis Data → PhotoAIReport Table
 *
 * This script migrates existing AI analysis data from legacy Photo model fields
 * to the new PhotoAIReport table, preserving historical analysis data.
 *
 * Problem:
 * - Old system stored AI analysis directly on Photo model (single report)
 * - New system uses PhotoAIReport table (multiple reports/history)
 * - Running new analysis overwrites legacy fields, losing old data
 *
 * Solution:
 * - Copy legacy AI data into PhotoAIReport table as historical record
 * - Preserve timestamp (aiAnalyzedAt) for historical accuracy
 *
 * Usage:
 *   # Dry run (preview changes)
 *   npm run migrate:ai-data -- --dry-run
 *
 *   # Execute migration
 *   npm run migrate:ai-data
 *
 *   # Verbose logging
 *   npm run migrate:ai-data -- --verbose
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import outputs from '../amplify_outputs.json';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose') || args.includes('-v');

// Simple logger
const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
  warn: (msg: string) => console.warn(`⚠️  ${msg}`),
  debug: (msg: string) => isVerbose && console.log(`🔍 ${msg}`),
};

// Configure Amplify for server-side usage
Amplify.configure(outputs, {
  ssr: true,
});

// Generate client with IAM authorization (for admin scripts)
const client = generateClient<Schema>({
  authMode: 'identityPool',
});

interface MigrationStats {
  totalPhotos: number;
  photosWithLegacyAI: number;
  photosAlreadyMigrated: number;
  photosMigrated: number;
  photosSkipped: number;
  errors: number;
}

async function migrateLegacyAIData(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    totalPhotos: 0,
    photosWithLegacyAI: 0,
    photosAlreadyMigrated: 0,
    photosMigrated: 0,
    photosSkipped: 0,
    errors: 0,
  };

  try {
    log.info('Starting migration of legacy AI analysis data...');
    log.info(`Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
    console.log();

    // Step 1: Fetch all photos
    log.info('Step 1: Fetching all photos...');
    const { data: photos, errors: photoErrors } = await client.models.Photo.list();

    if (photoErrors) {
      log.error(`Failed to fetch photos: ${JSON.stringify(photoErrors)}`);
      return stats;
    }

    if (!photos || photos.length === 0) {
      log.warn('No photos found in database');
      return stats;
    }

    stats.totalPhotos = photos.length;
    log.success(`Found ${stats.totalPhotos} photos`);
    console.log();

    // Step 2: Process each photo with legacy AI data
    log.info('Step 2: Processing photos with legacy AI data...');

    for (const photo of photos) {
      // Skip photos without legacy AI analysis
      if (!photo.aiAnalyzed || !photo.aiOverallScore) {
        log.debug(`Photo ${photo.id}: No legacy AI data, skipping`);
        stats.photosSkipped++;
        continue;
      }

      stats.photosWithLegacyAI++;
      log.info(`\nProcessing photo: ${photo.title} (${photo.id})`);

      // Check if this photo already has reports in PhotoAIReport table
      const { data: existingReports } = await client.models.PhotoAIReport.list({
        filter: { photoId: { eq: photo.id } },
      });

      if (existingReports && existingReports.length > 0) {
        log.debug(`  Already has ${existingReports.length} report(s) in PhotoAIReport table`);
        stats.photosAlreadyMigrated++;
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
        log.warn(`  Incomplete legacy AI data, skipping`);
        stats.photosSkipped++;
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

      log.debug(`  Legacy data: Overall=${reportData.overallScore}, Analyzed=${reportData.analyzedAt}`);

      if (isDryRun) {
        log.success(`  [DRY RUN] Would create PhotoAIReport with score ${reportData.overallScore}`);
        stats.photosMigrated++;
      } else {
        // Create the report in PhotoAIReport table
        try {
          const { data: newReport, errors: createErrors } = await client.models.PhotoAIReport.create(reportData);

          if (createErrors || !newReport) {
            log.error(`  Failed to create report: ${JSON.stringify(createErrors)}`);
            stats.errors++;
          } else {
            log.success(`  ✓ Migrated to PhotoAIReport (ID: ${newReport.id})`);
            stats.photosMigrated++;
          }
        } catch (error) {
          log.error(`  Exception during migration: ${error}`);
          stats.errors++;
        }
      }
    }

    console.log();
    log.info('Migration complete!');

  } catch (error) {
    log.error(`Fatal error during migration: ${error}`);
    stats.errors++;
  }

  return stats;
}

// Run migration
(async () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Photo AI Analysis Data Migration');
  console.log('═══════════════════════════════════════════════════════════');
  console.log();

  const startTime = Date.now();
  const stats = await migrateLegacyAIData();
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log();
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Migration Summary');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total photos:                ${stats.totalPhotos}`);
  console.log(`Photos with legacy AI:       ${stats.photosWithLegacyAI}`);
  console.log(`Already migrated:            ${stats.photosAlreadyMigrated}`);
  console.log(`Photos migrated:             ${stats.photosMigrated}`);
  console.log(`Photos skipped:              ${stats.photosSkipped}`);
  console.log(`Errors:                      ${stats.errors}`);
  console.log(`Duration:                    ${duration}s`);
  console.log('═══════════════════════════════════════════════════════════');

  if (isDryRun) {
    console.log();
    log.warn('DRY RUN MODE - No changes were made');
    log.info('Run without --dry-run to execute the migration');
  }

  if (stats.errors > 0) {
    console.log();
    log.error(`Migration completed with ${stats.errors} error(s)`);
    process.exit(1);
  }

  process.exit(0);
})();
