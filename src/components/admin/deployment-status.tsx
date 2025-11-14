'use client';

import { useEffect, useState } from 'react';
import { getDeploymentStatus, type DeploymentStatus } from '@/actions/deployment-actions';
import { RefreshCw, CheckCircle2, XCircle, Clock, Loader2, GitCommit, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Format duration from seconds to human-readable string
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

export function DeploymentStatusCard() {
  const [status, setStatus] = useState<DeploymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const deploymentStatus = await getDeploymentStatus();
      setStatus(deploymentStatus);
    } catch (error) {
      console.error('Failed to fetch deployment status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStatus();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (!status) {
    return null;
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'SUCCEED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'FAILED':
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'RUNNING':
      case 'PROVISIONING':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'SUCCEED':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'RUNNING':
      case 'PROVISIONING':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'SUCCEED':
        return 'Deployed Successfully';
      case 'FAILED':
        return 'Deployment Failed';
      case 'CANCELLED':
        return 'Deployment Cancelled';
      case 'RUNNING':
        return 'Deploying...';
      case 'PROVISIONING':
        return 'Provisioning...';
      case 'PENDING':
        return 'Pending Deployment';
      case 'UNAVAILABLE':
        return 'Status Unavailable';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-medium">{getStatusText()}</h3>
            {status.branchName && (
              <p className="text-sm opacity-75">Branch: {status.branchName}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStatus}
            disabled={loading}
            title="Refresh status"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {status.buildUrl && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              title="View in Amplify Console"
            >
              <a href={status.buildUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {status.commitMessage && (
          <div className="flex items-start gap-2">
            <GitCommit className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{status.commitMessage}</p>
              {status.commitId && (
                <p className="text-xs opacity-75 font-mono">{status.commitId}</p>
              )}
            </div>
          </div>
        )}

        {status.duration && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Duration: {formatDuration(status.duration)}</span>
          </div>
        )}

        {status.endTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Completed: {new Date(status.endTime).toLocaleString()}
            </span>
          </div>
        )}

        {status.status === 'RUNNING' && status.startTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Started: {new Date(status.startTime).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-current/20">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <span>Auto-refresh every 30 seconds</span>
        </label>
      </div>
    </div>
  );
}
