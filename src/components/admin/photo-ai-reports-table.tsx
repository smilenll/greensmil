"use client";

import { type Photo } from "@/types/photo";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PhotoAIReportsTableProps {
  photo: Photo;
  selectedReportId: string | null;
  onReportClick: (reportId: string) => void;
}

export function PhotoAIReportsTable({
  photo,
  selectedReportId,
  onReportClick,
}: PhotoAIReportsTableProps) {
  // Use the aiReports array from the photo (sorted newest first)
  const reports = photo.aiReports || [];

  if (reports.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No AI analysis reports available yet.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Use the &quot;Analyze with AI&quot; button above to generate an analysis report.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableCaption>AI Analysis Reports History</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Analyzed</TableHead>
            <TableHead>Overall Score</TableHead>
            <TableHead>Composition</TableHead>
            <TableHead>Lighting</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Technical</TableHead>
            <TableHead>Creativity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow
              key={report.id}
              className={selectedReportId === report.id ? "bg-muted/50" : ""}
            >
              <TableCell>
                {report.analyzedAt
                  ? new Date(report.analyzedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : "Unknown"}
              </TableCell>
              <TableCell>
                <Badge variant={getScoreBadgeVariant(report.overallScore || 0)}>
                  {report.overallScore?.toFixed(1) || "N/A"}/10
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {report.compositionScore?.toFixed(1) || "N/A"}/10
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {report.lightingScore?.toFixed(1) || "N/A"}/10
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {report.subjectScore?.toFixed(1) || "N/A"}/10
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {report.technicalScore?.toFixed(1) || "N/A"}/10
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {report.creativityScore?.toFixed(1) || "N/A"}/10
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReportClick(report.id)}
                >
                  {selectedReportId === report.id ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function getScoreBadgeVariant(score: number): "default" | "secondary" | "destructive" {
  if (score >= 8) return "default"; // Green/success
  if (score >= 6) return "secondary"; // Yellow/warning
  return "destructive"; // Red/error
}
