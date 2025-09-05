import * as React from 'react';
import DashboardLayout from './DashboardLayout';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <DashboardLayout>{children}</DashboardLayout>
  );
} 