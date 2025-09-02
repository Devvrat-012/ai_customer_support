"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Edit, Trash2, Save, X, FileText, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { addAlert } from '@/lib/store/alertSlice';
import { 
  selectProfile, 
  selectProfileLoading, 
  updateProfile, 
  fetchProfile,
  deleteCompanyData
} from '@/lib/store/profileSlice';

interface CompanyDataViewerProps {
  onDataUpdated: () => void;
}

export function CompanyDataViewer({ onDataUpdated }: CompanyDataViewerProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedData, setEditedData] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();
  
  // Use Redux for profile data
  const profile = useAppSelector(selectProfile);
  const profileLoading = useAppSelector(selectProfileLoading);
  const companyData = profile?.companyInfo || '';

  const fetchCompanyData = () => {
    // Use Redux action instead of direct API call
    dispatch(fetchProfile());
  };

  const handleEdit = () => {
    setEditedData(companyData);
    setIsViewDialogOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editedData.trim()) {
      dispatch(addAlert({
        type: 'error',
        title: 'Empty content',
        message: 'Please provide some company data content'
      }));
      return;
    }

    setIsUpdating(true);
    try {
      // Use Redux action instead of direct API call
      await dispatch(updateProfile({ companyInfo: editedData })).unwrap();
      
      dispatch(addAlert({
        type: 'success',
        title: 'Update successful',
        message: 'Company data updated successfully'
      }));
      
      setIsEditDialogOpen(false);
      onDataUpdated();
    } catch (error) {
      dispatch(addAlert({
        type: 'error',
        title: 'Update failed',
        message: error as string || 'An error occurred during update'
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Use Redux action instead of direct API call
      await dispatch(deleteCompanyData()).unwrap();
      
      dispatch(addAlert({
        type: 'success',
        title: 'Delete successful',
        message: 'Company data and widget key deleted successfully'
      }));
      
      setIsDeleteDialogOpen(false);
      setIsViewDialogOpen(false);
      onDataUpdated();
    } catch (error) {
      dispatch(addAlert({
        type: 'error',
        title: 'Delete failed',
        message: error as string || 'An error occurred during deletion'
      }));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchCompanyData}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Company Data
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Company Data
            </DialogTitle>
            <DialogDescription>
              View your uploaded company information. You can edit or delete this data as needed.
            </DialogDescription>
          </DialogHeader>
          
          {profileLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-data-view">Company Data Content</Label>
                <Textarea
                  id="company-data-view"
                  value={companyData}
                  readOnly
                  className="min-h-[300px] max-h-[400px] resize-y bg-white/70 dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Characters: {companyData.length} / 50,000
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" className='text-gray-900 dark:text-gray-100' onClick={() => setIsViewDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button variant="outline" className='text-gray-900 dark:text-gray-100' onClick={handleEdit} disabled={profileLoading}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={profileLoading}
              className='text-gray-900 dark:text-gray-100'
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Company Data
            </DialogTitle>
            <DialogDescription>
              Edit your company information. This data will be used to train your AI assistant.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-data-edit">Company Data Content</Label>
              <Textarea
                id="company-data-edit"
                placeholder="Enter your company information here..."
                value={editedData}
                onChange={(e) => setEditedData(e.target.value)}
                className="min-h-[300px] max-h-[400px] resize-y"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Characters: {editedData.length} / 50,000
              </p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" className='text-gray-900 dark:text-gray-100' onClick={() => setIsEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={isUpdating || !editedData.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Updating...' : 'Update Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Company Data
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your company data? This action cannot be undone.
              <br />
              <strong className="text-destructive">Note: This will also delete your widget key since it depends on company data.</strong>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" className='text-gray-900 dark:text-gray-100' onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className='text-gray-900 dark:text-gray-100'
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
