"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

export default function MigrateAIDataPage() {
  const [runningMode, setRunningMode] = useState<'dry-run' | 'execute' | null>(null);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const runMigration = async (dryRun: boolean) => {
    setRunningMode(dryRun ? 'dry-run' : 'execute');
    setResult(null);

    try {
      const response = await fetch("/api/admin/migrate-ai-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dryRun }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Migration failed");
      }

      setResult(data);

      if (data.success) {
        toast.success(
          dryRun
            ? `Dry run completed: ${data.photosMigrated} photos would be migrated`
            : `Migration completed: ${data.photosMigrated} photos migrated`
        );
      } else {
        toast.error(`Migration completed with ${data.errors.length} error(s)`);
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error(error instanceof Error ? error.message : "Migration failed");
    } finally {
      setRunningMode(null);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">AI Data Migration</h1>
        <p className="text-muted-foreground">
          Migrate legacy AI analysis data to the new PhotoAIReport table
        </p>
      </div>

      {/* Warning Card */}
      <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>What this does:</strong> Copies existing AI analysis data from legacy Photo
            fields to the new PhotoAIReport table, preserving historical analysis data.
          </p>
          <p>
            <strong>Why:</strong> The old system stored only 1 analysis per photo (overwrites on
            re-analysis). The new system maintains full history in a separate table.
          </p>
          <p>
            <strong>Safety:</strong> This migration is idempotent - safe to run multiple times.
            Already migrated photos will be skipped.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Run Migration</CardTitle>
          <CardDescription>
            Always run a dry run first to preview what will be migrated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={() => runMigration(true)}
              disabled={runningMode !== null}
              variant="outline"
              className="flex-1"
            >
              {runningMode === 'dry-run' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Dry Run (Preview)
                </>
              )}
            </Button>
            <Button
              onClick={() => runMigration(false)}
              disabled={runningMode !== null}
              variant="default"
              className="flex-1"
            >
              {runningMode === 'execute' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Execute Migration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Migration Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Photos:</span>
                  <span className="ml-2 font-semibold">{result.totalPhotos}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 font-semibold">{(result.duration / 1000).toFixed(2)}s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">With Legacy AI:</span>
                  <span className="ml-2 font-semibold">{result.photosWithLegacyAI}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Already Migrated:</span>
                  <span className="ml-2 font-semibold">{result.photosAlreadyMigrated}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Migrated:</span>
                  <span className="ml-2 font-semibold text-green-600">{result.photosMigrated}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Skipped:</span>
                  <span className="ml-2 font-semibold">{result.photosSkipped}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Errors:</span>
                  <span className="ml-2 font-semibold text-red-600">{result.errors.length}</span>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-red-600">Errors:</h3>
                  <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 space-y-1">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-800 dark:text-red-300">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Steps to Migrate</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Dry Run (Sandbox):</strong> Click "Dry Run" to preview what will be migrated
              in your local sandbox
            </li>
            <li>
              <strong>Execute (Sandbox):</strong> If results look good, click "Execute Migration"
              to test in sandbox
            </li>
            <li>
              <strong>Deploy to Production:</strong> Deploy your code with the migration endpoint
              to production
            </li>
            <li>
              <strong>Run on Production:</strong> Navigate to this page on production and repeat
              the dry run + execute
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
