'use client';

import { Users, Activity, Server } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: 'users' | 'sessions' | 'system';
  status?: 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
}

export function StatusCard({ title, value, icon, status = 'info', subtitle }: StatusCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <Users className="h-6 w-6" />;
      case 'sessions':
        return <Activity className="h-6 w-6" />;
      case 'system':
        return <Server className="h-6 w-6" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'info':
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            {subtitle && (
              <p className="text-sm opacity-75 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="text-4xl font-bold">
        {value}
      </div>
    </div>
  );
}

interface UsersStatusCardProps {
  count: number;
}

export function UsersStatusCard({ count }: UsersStatusCardProps) {
  return (
    <StatusCard
      title="Total Users"
      value={count}
      icon="users"
      status="success"
      subtitle="Registered in the system"
    />
  );
}

interface SessionsStatusCardProps {
  count: number;
}

export function SessionsStatusCard({ count }: SessionsStatusCardProps) {
  return (
    <StatusCard
      title="Active Sessions"
      value={count}
      icon="sessions"
      status="info"
      subtitle="Currently logged in"
    />
  );
}

interface SystemStatusCardProps {
  status: string;
  uptime: string;
}

export function SystemStatusCard({ status, uptime }: SystemStatusCardProps) {
  const getStatusType = (statusText: string): 'success' | 'warning' | 'error' => {
    switch (statusText.toLowerCase()) {
      case 'online':
        return 'success';
      case 'degraded':
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <StatusCard
      title="System Status"
      value={status}
      icon="system"
      status={getStatusType(status)}
      subtitle={`Uptime: ${uptime}`}
    />
  );
}
