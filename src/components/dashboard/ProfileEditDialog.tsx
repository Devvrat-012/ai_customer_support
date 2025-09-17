"use client";

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { selectProfile, updateProfile } from '@/lib/store/profileSlice';
import { updateUser } from '@/lib/store/authSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    companyName: profile?.companyName || '',
    companyInfo: profile?.companyInfo || '',
  });

  // Reset form data when dialog opens
  useEffect(() => {
    if (open && profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        companyName: profile.companyName || '',
        companyInfo: profile.companyInfo || '',
      });
    }
  }, [open, profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "First name and last name are required.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        companyName: formData.companyName.trim() || undefined,
        companyInfo: formData.companyInfo.trim() || undefined,
      };

      const result = await dispatch(updateProfile(updateData));
      
      if (updateProfile.fulfilled.match(result)) {
        // Also update the auth state to reflect changes in the UI immediately
        dispatch(updateUser({
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          companyName: updateData.companyName || null,
          companyInfo: updateData.companyInfo || null,
        }));
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        onOpenChange(false);
      } else {
        throw new Error(result.payload as string || 'Failed to update profile');
      }
      
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        companyName: profile.companyName || '',
        companyInfo: profile.companyInfo || '',
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Edit Profile
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Update your personal and company information
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Company Information</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Name
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter your company name"
                className="w-full"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyInfo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Description
              </Label>
              <Textarea
                id="companyInfo"
                value={formData.companyInfo}
                onChange={(e) => handleInputChange('companyInfo', e.target.value)}
                placeholder="Brief description of your company and what you do..."
                className="w-full min-h-[80px] resize-none"
                disabled={isLoading}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {formData.companyInfo.length}/500 characters
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}