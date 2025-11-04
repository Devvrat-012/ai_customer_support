"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { 
  fetchKnowledgeBases,
  selectKnowledgeBases,
  selectKnowledgeBaseStats,
  selectKnowledgeBaseStatus,
  selectKnowledgeBaseError,
  selectIsKnowledgeBaseFresh
} from '@/lib/store/knowledgeBaseSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

export default function KnowledgeBaseManager() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const knowledgeBases = useAppSelector(selectKnowledgeBases);
  const stats = useAppSelector(selectKnowledgeBaseStats);
  const loading = useAppSelector(selectKnowledgeBaseStatus) === 'loading';
  const error = useAppSelector(selectKnowledgeBaseError);
  // freshness can be used later if needed
  useAppSelector(selectIsKnowledgeBaseFresh);
  
  // Local state for form inputs and UI interactions
  const [uploadLoading, setUploadLoading] = useState(false);
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingKB, setDeletingKB] = useState<string | null>(null);
  const kbLoadedRef = useRef(false); // Track if we've attempted to load KB data

  // Form states
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    file: null as File | null,
  });

  const [websiteForm, setWebsiteForm] = useState({
    name: '',
    description: '',
    websiteUrl: '',
  });

  // Load knowledge bases using Redux - only attempt once
  useEffect(() => {
    // Only fetch if we haven't attempted yet AND status is idle (not loading)
    if (!kbLoadedRef.current && loading === false && (knowledgeBases.length === 0 || error === null)) {
      kbLoadedRef.current = true;
      dispatch(fetchKnowledgeBases());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file || !uploadForm.name) {
      toast({
        title: 'Error',
        description: 'Please provide a name and select a file',
        variant: 'destructive',
      });
      return;
    }

    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('name', uploadForm.name);
      if (uploadForm.description) {
        formData.append('description', uploadForm.description);
      }

      const response = await fetch('/api/knowledge-base/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: `Document uploaded and processed successfully. ${data.data.totalChunks} chunks created.`,
        });
        
        // Reset form
        setUploadForm({ name: '', description: '', file: null });
        
        // Reload data
        dispatch(fetchKnowledgeBases());
      } else {
        throw new Error(data.error || 'Upload failed');
      }

    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle website extraction
  const handleWebsiteExtraction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteForm.websiteUrl || !websiteForm.name) {
      toast({
        title: 'Error',
        description: 'Please provide a name and website URL',
        variant: 'destructive',
      });
      return;
    }

    setWebsiteLoading(true);

    try {
      const response = await fetch('/api/knowledge-base/website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(websiteForm),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: `Website content extracted and processed successfully. ${data.data.totalChunks} chunks created.`,
        });
        
        // Reset form
        setWebsiteForm({ name: '', description: '', websiteUrl: '' });
        
        // Reload data
        dispatch(fetchKnowledgeBases());
      } else {
        throw new Error(data.error || 'Website extraction failed');
      }

    } catch (error) {
      console.error('Website extraction error:', error);
      toast({
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'Failed to extract website content',
        variant: 'destructive',
      });
    } finally {
      setWebsiteLoading(false);
    }
  };

  // Delete knowledge base
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge-base/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Knowledge base deleted successfully',
        });
        dispatch(fetchKnowledgeBases());
      } else {
        throw new Error(data.error || 'Delete failed');
      }

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete knowledge base',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'ERROR': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'UPLOAD': return '📄';
      case 'WEBSITE': return '🌐';
      case 'MANUAL': return '✏️';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Knowledge Base</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your AI knowledge base for enhanced customer support</p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalKnowledgeBases}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Knowledge Bases</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.readyKnowledgeBases}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ready for Use</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.totalChunks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Chunks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.bySourceType?.WEBSITE || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">From Websites</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Knowledge Bases</TabsTrigger>
          <TabsTrigger value="upload">Upload Document</TabsTrigger>
          <TabsTrigger value="website">Extract Website</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {knowledgeBases.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <p className="text-lg mb-2">No knowledge bases yet</p>
                    <p>Upload a document or extract website content to get started</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              knowledgeBases.map((kb) => (
                <Card key={kb.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getSourceTypeIcon(kb.sourceType)}</span>
                        <div>
                          <CardTitle className="text-lg">{kb.name}</CardTitle>
                          {kb.description && (
                            <CardDescription>{kb.description}</CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(kb.status)}>
                          {kb.status}
                        </Badge>
                        <Dialog open={deleteDialogOpen && deletingKB === kb.id} onOpenChange={setDeleteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 cursor-pointer"
                              onClick={() => setDeletingKB(kb.id)}
                            >
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Knowledge Base</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete &ldquo;{kb.name}&rdquo;? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="cursor-pointer">
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  if (deletingKB) {
                                    handleDelete(deletingKB);
                                    setDeleteDialogOpen(false);
                                    setDeletingKB(null);
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-700 cursor-pointer"
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Chunks:</span>
                        <span className="ml-2 font-medium">{kb.chunkCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Source:</span>
                        <span className="ml-2 font-medium">{kb.sourceType}</span>
                      </div>
                      {kb.sourceUrl && (
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">URL:</span>
                          <a 
                            href={kb.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-700 underline break-all cursor-pointer"
                          >
                            {kb.sourceUrl}
                          </a>
                        </div>
                      )}
                      {kb.fileName && (
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">File:</span>
                          <span className="ml-2 font-medium">{kb.fileName}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Created:</span>
                        <span className="ml-2 font-medium">
                          {new Date(kb.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload text files, PDFs, or other documents to add to your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <Label htmlFor="upload-name">Knowledge Base Name</Label>
                  <Input
                    id="upload-name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter a name for this knowledge base"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="upload-description">Description (Optional)</Label>
                  <Textarea
                    id="upload-description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this document contains"
                  />
                </div>

                <div>
                  <Label htmlFor="upload-file">File</Label>
                  <Input
                    id="upload-file"
                    type="file"
                    accept=".txt,.md,.csv,.json,.html"
                    onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Supported formats: .txt, .md, .csv, .json, .html (max 5MB)
                  </p>
                </div>

                <Button type="submit" disabled={uploadLoading} className="w-full cursor-pointer">
                  {uploadLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Upload and Process'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website">
          <Card>
            <CardHeader>
              <CardTitle>Extract Website Content</CardTitle>
              <CardDescription>
                Extract and process content from any website to add to your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWebsiteExtraction} className="space-y-4">
                <div>
                  <Label htmlFor="website-name">Knowledge Base Name</Label>
                  <Input
                    id="website-name"
                    value={websiteForm.name}
                    onChange={(e) => setWebsiteForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter a name for this knowledge base"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="website-description">Description (Optional)</Label>
                  <Textarea
                    id="website-description"
                    value={websiteForm.description}
                    onChange={(e) => setWebsiteForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the website content"
                  />
                </div>

                <div>
                  <Label htmlFor="website-url">Website URL</Label>
                  <Input
                    id="website-url"
                    type="url"
                    value={websiteForm.websiteUrl}
                    onChange={(e) => setWebsiteForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="https://example.com"
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    The website will be crawled and its content will be extracted and processed
                  </p>
                </div>

                <Button type="submit" disabled={websiteLoading} className="w-full cursor-pointer">
                  {websiteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Extracting...
                    </>
                  ) : (
                    'Extract and Process'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
