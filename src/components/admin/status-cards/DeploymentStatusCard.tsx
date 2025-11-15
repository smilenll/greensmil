import { CheckCircle2, XCircle, Clock, Loader2, Rocket } from 'lucide-react';
import { getDeploymentStatus, type DeploymentStatus } from '@/actions/deployment-actions';
import { StatusCard, type StatusVariant } from './StatusCard';

/**
 * DeploymentStatusCard - Fully self-contained component
 * Handles its own data fetching, transformation, and error handling
 */
export async function DeploymentStatusCard() {
  // Fetch data
  const response = await getDeploymentStatus();

  // Determine values based on response
  const isSuccess = response.status === 'success';
  const deployment: DeploymentStatus = isSuccess ? response.data : { status: 'UNAVAILABLE' };

  // Transform deployment status to icon
  const getIcon = () => {
    switch (deployment.status) {
      case 'SUCCEED':
        return <CheckCircle2 className="h-6 w-6" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-6 w-6" />;
      case 'RUNNING':
      case 'PROVISIONING':
        return <Loader2 className="h-6 w-6 animate-spin" />;
      case 'PENDING':
        return <Clock className="h-6 w-6" />;
      default:
        return <Rocket className="h-6 w-6" />;
    }
  };

  // Transform deployment status to variant
  const variant: StatusVariant =
    deployment.status === 'SUCCEED' ? 'success' :
    deployment.status === 'FAILED' || deployment.status === 'CANCELLED' ? 'destructive' :
    deployment.status === 'RUNNING' || deployment.status === 'PROVISIONING' ? 'default' :
    deployment.status === 'PENDING' ? 'warning' : 'secondary';

  // Transform deployment status to display text
  const statusText =
    deployment.status === 'SUCCEED' ? 'Deployed' :
    deployment.status === 'FAILED' ? 'Failed' :
    deployment.status === 'CANCELLED' ? 'Cancelled' :
    deployment.status === 'RUNNING' ? 'Deploying' :
    deployment.status === 'PROVISIONING' ? 'Provisioning' :
    deployment.status === 'PENDING' ? 'Pending' : 'Unavailable';

  // Transform deployment data to subtitle
  const subtitle = deployment.commitMessage ||
    (deployment.endTime ? `Last: ${new Date(deployment.endTime).toLocaleDateString()} ${new Date(deployment.endTime).toLocaleTimeString()}` : undefined) ||
    (deployment.branchName ? `Branch: ${deployment.branchName}` : 'Deployment status');

  // Render with all data handled internally
  return (
    <StatusCard
      title="Deployment Status"
      value={statusText}
      icon={getIcon()}
      variant={variant}
      subtitle={subtitle}
    />
  );
}
