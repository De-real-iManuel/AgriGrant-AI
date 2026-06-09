'use client';
import React from 'react';
import AuthGuard from '@/components/ui/AuthGuard';
import FarmerPortal from './components/FarmerPortal';

export default function FarmerPortalPage() {
  return (
    <AuthGuard>
      <FarmerPortal />
    </AuthGuard>
  );
}
