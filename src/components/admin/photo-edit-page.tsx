"use client";

import { useState, useEffect } from "react";
import { type Photo } from "@/types/photo";
import { PhotoPreview } from "./photo-preview";
import { PhotoEditForm } from "./photo-edit-form";
import { PhotoAIReportsTable } from "./photo-ai-reports-table";
import { PhotoAIReport } from "@/components/photography/photo-ai-report";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PhotoEditPageProps {
  photo: Photo;
}

export function PhotoEditPage({ photo: initialPhoto }: PhotoEditPageProps) {
  const [photo, setPhoto] = useState(initialPhoto);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Sync photo state when prop changes (e.g., after router.refresh() from AI analysis)
  useEffect(() => {
    setPhoto(initialPhoto);
  }, [initialPhoto]);

  const handlePhotoUpdate = (updatedPhoto: Photo) => {
    setPhoto(updatedPhoto);
  };

  const handleReportClick = (reportId: string) => {
    setSelectedReportId(selectedReportId === reportId ? null : reportId);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/photos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Photo</h1>
      </div>

      {/* Main Content: Preview + Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Production Preview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Production Preview</h2>
          <PhotoPreview photo={photo} />
        </div>

        {/* Right: Edit Form */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Edit Details</h2>
          <PhotoEditForm photo={photo} onSuccess={handlePhotoUpdate} />
        </div>
      </div>

      {/* AI Reports Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">AI Analysis Reports</h2>

        {/* Selected Report Display */}
        {selectedReportId && (() => {
          const selectedReport = photo.aiReports?.find(r => r.id === selectedReportId);

          return selectedReport ? (
            <div className="mb-6">
              <PhotoAIReport
                analysis={{
                  composition: {
                    score: selectedReport.compositionScore,
                    rationale: selectedReport.compositionRationale,
                  },
                  lighting: {
                    score: selectedReport.lightingScore,
                    rationale: selectedReport.lightingRationale,
                  },
                  subject: {
                    score: selectedReport.subjectScore,
                    rationale: selectedReport.subjectRationale,
                  },
                  technical: {
                    score: selectedReport.technicalScore,
                    rationale: selectedReport.technicalRationale,
                  },
                  creativity: {
                    score: selectedReport.creativityScore,
                    rationale: selectedReport.creativityRationale,
                  },
                  overall: selectedReport.overallScore,
                }}
              />
            </div>
          ) : null;
        })()}

        {/* Reports Table */}
        <PhotoAIReportsTable
          photo={photo}
          selectedReportId={selectedReportId}
          onReportClick={handleReportClick}
        />
      </div>
    </div>
  );
}
