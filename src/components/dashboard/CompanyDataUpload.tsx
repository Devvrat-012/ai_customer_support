"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, Save, X } from 'lucide-react';
import { useAppDispatch } from '@/lib/store/hooks';
import { addAlert } from '@/lib/store/alertSlice';
import { updateProfile } from '@/lib/store/profileSlice';

interface CompanyDataUploadProps {
  hasExistingData: boolean;
  onDataUpdated: () => void;
}

export function CompanyDataUpload({ hasExistingData, onDataUpdated }: CompanyDataUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a text file
    if (!file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
      dispatch(addAlert({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please select a text file (.txt)'
      }));
      return;
    }

    // Check file size (50KB limit)
    if (file.size > 50000) {
      dispatch(addAlert({
        type: 'error',
        title: 'File too large',
        message: 'File size must be less than 50KB'
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      setFileName(file.name);
      setIsDialogOpen(true);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!fileContent.trim()) {
      dispatch(addAlert({
        type: 'error',
        title: 'Empty content',
        message: 'Please provide some company data content'
      }));
      return;
    }

    setIsUploading(true);
    try {
      // Use Redux action instead of direct API call
      await dispatch(updateProfile({ companyInfo: fileContent })).unwrap();
      
      dispatch(addAlert({
        type: 'success',
        title: 'Upload successful',
        message: 'Company data uploaded successfully'
      }));
      
      setIsDialogOpen(false);
      setFileContent('');
      setFileName('');
      onDataUpdated();
    } catch (error) {
      dispatch(addAlert({
        type: 'error',
        title: 'Upload failed',
        message: error as string || 'An error occurred during upload'
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const resetDialog = () => {
    setIsDialogOpen(false);
    setFileContent('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,text/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Dialog open={isDialogOpen} onOpenChange={resetDialog}>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {hasExistingData ? 'Replace Company Data' : 'Upload Company Data'}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview & Edit Company Data
            </DialogTitle>
            <DialogDescription>
              {fileName && `File: ${fileName} | `}
              Review and edit your company data before uploading. This information will be used to train your AI assistant.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-data">Company Data Content</Label>
              <Textarea
                id="company-data"
                placeholder="Enter or paste your company information here..."
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="min-h-[300px] max-h-[400px] resize-y"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Characters: {fileContent.length} / 50,000
              </p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" className='text-gray-100' onClick={resetDialog}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !fileContent.trim()}
              className='text-gray-100'
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : hasExistingData ? 'Update Data' : 'Upload Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
