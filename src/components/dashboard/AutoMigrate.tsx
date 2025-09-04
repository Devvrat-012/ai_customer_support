"use client";

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { addAlert } from '@/lib/store/alertSlice';
import { fetchProfile } from '@/lib/store/profileSlice';

interface AutoMigrateProps {
  user: any;
  hasCompanyData: boolean;
}

export function AutoMigrate({ user, hasCompanyData }: AutoMigrateProps) {
  const [migrationChecked, setMigrationChecked] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const performAutoMigration = async () => {
      if (!user || !hasCompanyData || migrationChecked) return;

      try {
        const response = await fetch('/api/company-data/migrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          dispatch(addAlert({
            type: 'success',
            title: 'Data Migrated!',
            message: `Your company data has been automatically converted to a knowledge base with ${data.totalChunks} chunks.`
          }));
          
          // Refresh profile to update the state
          dispatch(fetchProfile());
        } else if (data.error && !data.error.includes('already been migrated')) {
          console.warn('Migration failed:', data.error);
        }
      } catch (error) {
        console.error('Auto-migration error:', error);
      } finally {
        setMigrationChecked(true);
      }
    };

    performAutoMigration();
  }, [user, hasCompanyData, migrationChecked, dispatch]);

  return null; // This component doesn't render anything
}
