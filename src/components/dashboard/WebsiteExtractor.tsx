"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Loader2, Save, X, Upload, FileText, Link } from 'lucide-react';
import { CompanyDataUpload } from './CompanyDataUpload';

interface WebsiteExtractorProps {
  hasExistingData: boolean;
  onDataUpdated: () => void;
}

export function WebsiteExtractor({ hasExistingData, onDataUpdated }: WebsiteExtractorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState('website');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleWebsiteExtraction = async () => {
    if (!websiteUrl.trim()) {
      setMessage('Please enter a website URL');
      setMessageType('error');
      return;
    }

    if (!validateUrl(websiteUrl)) {
      setMessage('Please enter a valid URL starting with http:// or https://');
      setMessageType('error');
      return;
    }

    setIsExtracting(true);
    setMessage('');
    try {
      const response = await fetch('/api/website-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteUrl }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`Successfully extracted content from ${websiteUrl}`);
        setMessageType('success');
        setIsOpen(false);
        setWebsiteUrl('');
        onDataUpdated();
      } else {
        throw new Error(result.message || 'Website extraction failed');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to extract website data');
      setMessageType('error');
    } finally {
      setIsExtracting(false);
    }
  };

  const resetForm = () => {
    setIsOpen(false);
    setWebsiteUrl('');
    setActiveTab('website');
    setMessage('');
  };

  if (!isOpen) {
    return (
      <Button 
        size="sm" 
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        <Upload className="h-4 w-4 mr-2" />
        {hasExistingData ? 'Update Company Data' : 'Add Company Data'}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Add Company Data</h2>
            </div>
            <Button variant="outline" size="sm" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Choose how you want to add your company data. You can extract data from your website automatically or upload a text file manually.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Extract from Website
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Manual Upload
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="website" className="space-y-4 mt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">Automatic Website Extraction</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Enter your website URL and we'll automatically extract relevant content to train your AI assistant.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="website-url">Website URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="website-url"
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="pl-10"
                      disabled={isExtracting}
                    />
                  </div>
                  <Button 
                    onClick={handleWebsiteExtraction} 
                    disabled={isExtracting || !websiteUrl.trim()}
                    className="min-w-[100px]"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Extract
                      </>
                    )}
                  </Button>
                </div>
                
                {message && (
                  <div className={`text-sm p-3 rounded-lg ${
                    messageType === 'success' 
                      ? 'text-green-700 bg-green-50 border border-green-200' 
                      : 'text-red-700 bg-red-50 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We'll scan your website and extract relevant content for training your AI assistant.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="mt-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 mb-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-orange-900 dark:text-orange-100">Manual File Upload</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      Upload a text file containing your company information, policies, or FAQ data.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <CompanyDataUpload 
                  hasExistingData={hasExistingData} 
                  onDataUpdated={() => {
                    onDataUpdated();
                    setIsOpen(false);
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
