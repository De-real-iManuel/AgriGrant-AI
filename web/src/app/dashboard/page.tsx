import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import DashboardLayout from './Components/DashboardLayout';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  );
}
