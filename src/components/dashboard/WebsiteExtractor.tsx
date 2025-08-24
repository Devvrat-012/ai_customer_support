"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Loader2, Save, Upload, FileText, Link, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { CompanyDataUpload } from './CompanyDataUpload';

interface WebsiteExtractorProps {
  hasExistingData: boolean;
  onDataUpdated: () => void;
}

export function WebsiteExtractor({ hasExistingData, onDataUpdated }: WebsiteExtractorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteUrls, setWebsiteUrls] = useState<string[]>(['']);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState('multiple');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [extractionProgress, setExtractionProgress] = useState<{url: string, status: 'pending' | 'success' | 'error', message?: string}[]>([]);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const addUrlField = () => {
    setWebsiteUrls([...websiteUrls, '']);
  };

  const removeUrlField = (index: number) => {
    if (websiteUrls.length > 1) {
      const newUrls = websiteUrls.filter((_, i) => i !== index);
      setWebsiteUrls(newUrls);
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...websiteUrls];
    newUrls[index] = value;
    setWebsiteUrls(newUrls);
  };

  const handleSingleUrlExtraction = async () => {
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
        const successMessage = result.data?.isAppended ? 
          `Content appended to existing data (${Math.round((result.data?.contentLength || 0) / 1000)}KB added)` : 
          `Successfully extracted content from ${websiteUrl} (${Math.round((result.data?.contentLength || 0) / 1000)}KB)`;
          
        setMessage(successMessage);
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

  const handleMultiUrlExtraction = async () => {
    const validUrls = websiteUrls.filter(url => url.trim() && validateUrl(url.trim()));
    
    if (validUrls.length === 0) {
      setMessage('Please enter at least one valid URL');
      setMessageType('error');
      return;
    }

    setIsExtracting(true);
    setMessage('');
    setExtractionProgress(validUrls.map(url => ({ url, status: 'pending' })));

    try {
      // Extract from multiple URLs sequentially to avoid overwhelming the server
      const results = [];
      for (let i = 0; i < validUrls.length; i++) {
        const url = validUrls[i];
        setExtractionProgress(prev => 
          prev.map(item => 
            item.url === url ? { ...item, status: 'pending', message: 'Extracting...' } : item
          )
        );

        try {
          const response = await fetch('/api/website-extract', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ websiteUrl: url }),
          });

          const result = await response.json();
          
          if (result.success) {
            results.push({ url, success: true });
            
            // Show different message based on whether content was appended
            const successMessage = result.data?.isAppended ? 
              `Appended to existing content (${Math.round((result.data?.contentLength || 0) / 1000)}KB)` : 
              `Extracted successfully (${Math.round((result.data?.contentLength || 0) / 1000)}KB)`;
              
            setExtractionProgress(prev => 
              prev.map(item => 
                item.url === url ? { ...item, status: 'success', message: successMessage } : item
              )
            );
          } else {
            results.push({ url, success: false, error: result.message });
            setExtractionProgress(prev => 
              prev.map(item => 
                item.url === url ? { ...item, status: 'error', message: result.message || 'Extraction failed' } : item
              )
            );
          }
        } catch (error) {
          results.push({ url, success: false, error: error instanceof Error ? error.message : 'Failed to extract' });
          setExtractionProgress(prev => 
            prev.map(item => 
              item.url === url ? { ...item, status: 'error', message: error instanceof Error ? error.message : 'Failed to extract' } : item
            )
          );
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;

      if (successCount === totalCount) {
        setMessage(`Successfully extracted content from all ${totalCount} URLs`);
        setMessageType('success');
        setTimeout(() => {
          setIsOpen(false);
          setWebsiteUrls(['']);
          setExtractionProgress([]);
          onDataUpdated();
        }, 2000);
      } else if (successCount > 0) {
        setMessage(`Extracted content from ${successCount} out of ${totalCount} URLs`);
        setMessageType('success');
        setTimeout(() => {
          onDataUpdated();
        }, 2000);
      } else {
        setMessage('Failed to extract content from any URLs');
        setMessageType('error');
      }
    } catch {
      setMessage('An unexpected error occurred during extraction');
      setMessageType('error');
    } finally {
      setIsExtracting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {hasExistingData ? 'Update Company Data' : 'Add Company Data'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Add Company Data
          </DialogTitle>
          <DialogDescription>
            Choose how you want to add your company data. You can extract data from your website automatically or upload a text file manually.
          </DialogDescription>
        </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Single URL
              </TabsTrigger>
              <TabsTrigger value="multiple" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Multiple URLs
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload File
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="website" className="space-y-4 mt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">Single URL Extraction</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Extract content from a single webpage. Best for testing or extracting from a specific page.
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
                    onClick={handleSingleUrlExtraction} 
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
                  We&apos;ll scan this specific page and extract its content for training your AI assistant.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="multiple" className="space-y-4 mt-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900 dark:text-green-100">Multiple URLs Extraction (Recommended)</h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Extract content from multiple pages for comprehensive AI training. Include your homepage, about page, pricing, FAQ, etc.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Smart Content Appending:</strong> New extractions will be added to your existing company data, 
                    not replace it. This allows you to build comprehensive training data from multiple sources.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Website URLs</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addUrlField}
                    disabled={isExtracting}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add URL
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {websiteUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="relative flex-1">
                        <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="url"
                          placeholder={`https://yourcompany.com${index === 0 ? '' : index === 1 ? '/about' : index === 2 ? '/pricing' : '/page'}`}
                          value={url}
                          onChange={(e) => updateUrl(index, e.target.value)}
                          className="pl-10"
                          disabled={isExtracting}
                        />
                      </div>
                      {websiteUrls.length > 1 && (
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => removeUrlField(index)}
                          disabled={isExtracting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={handleMultiUrlExtraction} 
                  disabled={isExtracting || websiteUrls.every(url => !url.trim())}
                  className="w-full"
                  size="lg"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting from {websiteUrls.filter(url => url.trim()).length} URLs...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Extract from {websiteUrls.filter(url => url.trim()).length} URLs
                    </>
                  )}
                </Button>
                
                {/* Progress tracking */}
                {extractionProgress.length > 0 && (
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm">Extraction Progress:</h4>
                    {extractionProgress.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {item.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                        {item.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {item.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                        <span className="flex-1 truncate">{item.url}</span>
                        {item.message && (
                          <span className={`text-xs ${
                            item.status === 'success' ? 'text-green-600' : 
                            item.status === 'error' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {item.message}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {message && (
                  <div className={`text-sm p-3 rounded-lg ${
                    messageType === 'success' 
                      ? 'text-green-700 bg-green-50 border border-green-200' 
                      : 'text-red-700 bg-red-50 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}
                
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="font-medium mb-1">💡 Pro Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Include your homepage, about page, pricing, and FAQ pages</li>
                    <li>Add product/service pages that customers ask about most</li>
                    <li>Include policy pages (privacy, terms, support) for better responses</li>
                    <li>We&apos;ll process URLs one by one to ensure quality extraction</li>
                  </ul>
                </div>
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
      </DialogContent>
    </Dialog>
  );
}
