import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Upload, Download, Eye, Edit, Trash2, Search, Filter, Folder, File } from 'lucide-react';
import { toast } from 'sonner';
import { getDocuments, uploadDocument, downloadDocument, deleteDocument } from '@/lib/api';

interface Document {
  id: string;
  name: string;
  type: 'policy' | 'form' | 'resource' | 'report' | 'announcement' | 'other';
  category: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: number;
  fileType: string;
  downloadCount: number;
  tags: string[];
  permissions: {
    view: string[];
    download: string[];
    edit: string[];
  };
  isActive: boolean;
  version: string;
}

interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdBy: string;
  createdAt: string;
  documentCount: number;
  permissions: {
    view: string[];
    edit: string[];
  };
}

export const DocumentManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'document' | 'folder'>('document');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const documentTypes = ['policy', 'form', 'resource', 'report', 'announcement', 'other'];
  const categories = ['Academic', 'Administrative', 'Financial', 'HR', 'Student Affairs', 'General'];

  // Fetch documents from backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await getDocuments();
        setDocuments(docs);
        // If you have folders as a separate API, fetch and setFolders here
      } catch (e) {
        toast.error('Failed to load documents');
      }
    };
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const searchMatch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const typeMatch = filterType === 'all' || doc.type === filterType;
    const folderMatch = !selectedFolder || doc.category === selectedFolder;
    
    return searchMatch && typeMatch && folderMatch;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const uploadTime = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - uploadTime.getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'policy': return 'bg-red-100 text-red-800';
      case 'form': return 'bg-blue-100 text-blue-800';
      case 'resource': return 'bg-green-100 text-green-800';
      case 'report': return 'bg-purple-100 text-purple-800';
      case 'announcement': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateDocument = () => {
    setDialogType('document');
    setSelectedDocument(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleCreateFolder = () => {
    setDialogType('folder');
    setIsDialogOpen(true);
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsEditing(true);
    setDialogType('document');
    setIsDialogOpen(true);
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteDocument(docId);
      setDocuments(documents.filter(d => d.id !== docId));
      toast.success('Document deleted successfully');
    } catch (e) {
      toast.error('Failed to delete document');
    }
  };

  const handleDownloadDocument = (document: Document) => {
    // Increment download count
    setDocuments(documents.map(doc => 
      doc.id === document.id ? { ...doc, downloadCount: doc.downloadCount + 1 } : doc
    ));
    toast.success(`Downloading ${document.name}...`);
  };

  const handleUploadDocument = async (formData: FormData) => {
    try {
      const newDoc = await uploadDocument(formData);
      setDocuments([...documents, newDoc]);
      toast.success('Document uploaded successfully');
    } catch (e) {
      toast.error('Failed to upload document');
    }
  };

  const handleSaveDocument = (documentData: Partial<Document>) => {
    if (isEditing && selectedDocument) {
      setDocuments(documents.map(doc => 
        doc.id === selectedDocument.id ? { ...doc, ...documentData } : doc
      ));
      toast.success('Document updated successfully');
    } else {
      const newDocument: Document = {
        id: Date.now().toString(),
        uploadedBy: user?.firstName + ' ' + user?.lastName || 'User',
        uploadedAt: new Date().toISOString(),
        fileSize: Math.floor(Math.random() * 2000000) + 100000,
        downloadCount: 0,
        isActive: true,
        version: '1.0',
        permissions: {
          view: ['admin', 'teacher'],
          download: ['admin', 'teacher'],
          edit: ['admin'],
        },
        ...documentData as Document,
      };
      setDocuments([newDocument, ...documents]);
      toast.success('Document uploaded successfully');
    }
    setIsDialogOpen(false);
  };

  const handleSaveFolder = (folderData: Partial<Folder>) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      createdBy: user?.firstName + ' ' + user?.lastName || 'User',
      createdAt: new Date().toISOString(),
      documentCount: 0,
      permissions: {
        view: ['admin', 'teacher'],
        edit: ['admin'],
      },
      ...folderData as Folder,
    };
    setFolders([...folders, newFolder]);
    setIsDialogOpen(false);
    toast.success('Folder created successfully');
  };

  const canViewDocument = (document: Document) => {
    return document.permissions.view.includes(user?.role || '');
  };

  const canDownloadDocument = (document: Document) => {
    return document.permissions.download.includes(user?.role || '');
  };

  const canEditDocument = (document: Document) => {
    return document.permissions.edit.includes(user?.role || '');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600">Upload and manage school documents and resources</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleCreateFolder} variant="outline">
            <Folder className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={handleCreateDocument}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {documentTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(filteredDocuments) ? filteredDocuments : []).map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <FileText className="w-5 h-5 mt-0.5 text-blue-600" />
                      <div className="flex-1">
                        <span className="text-sm font-medium line-clamp-2">{document.name}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getTypeColor(document.type)} variant="secondary">
                            {document.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{document.fileType}</span>
                        </div>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {document.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{document.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(document.tags) ? document.tags : []).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Uploaded by {document.uploadedBy}</p>
                    <p>{getTimeAgo(document.uploadedAt)}</p>
                    <p>{formatFileSize(document.fileSize)} • {document.downloadCount} downloads</p>
                  </div>

                  <div className="flex space-x-1 pt-2">
                    {canViewDocument(document) && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                    {canDownloadDocument(document) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    )}
                    {canEditDocument(document) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditDocument(document)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                    {canEditDocument(document) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <Folder className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-medium">{folder.name}</h3>
                      <p className="text-sm text-gray-600">
                        {folder.documentCount} documents
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created by {folder.createdBy} • {getTimeAgo(folder.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <DocumentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        type={dialogType}
        document={selectedDocument}
        onSaveDocument={handleSaveDocument}
        onSaveFolder={handleSaveFolder}
        isEditing={isEditing}
        documentTypes={documentTypes}
        categories={categories}
      />
    </div>
  );
};

interface DocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'document' | 'folder';
  document: Document | null;
  onSaveDocument: (data: Partial<Document>) => void;
  onSaveFolder: (data: Partial<Folder>) => void;
  isEditing: boolean;
  documentTypes: string[];
  categories: string[];
}

const DocumentDialog = ({ 
  isOpen, 
  onClose, 
  type, 
  document, 
  onSaveDocument, 
  onSaveFolder, 
  isEditing, 
  documentTypes, 
  categories 
}: DocumentDialogProps) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (document && type === 'document') {
      setFormData(document);
    } else {
      setFormData({});
    }
  }, [document, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'document') {
      onSaveDocument(formData);
    } else {
      onSaveFolder(formData);
    }
    
    setFormData({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'document' 
              ? (isEditing ? 'Edit Document' : 'Upload Document')
              : 'Create Folder'
            }
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{type === 'document' ? 'Document' : 'Folder'} Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {type === 'document' && (
            <>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type || ''}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fileType">File Type</Label>
                <Select
                  value={formData.fileType || ''}
                  onValueChange={(value) => setFormData({ ...formData, fileType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Word">Word Document</SelectItem>
                    <SelectItem value="Excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="PowerPoint">PowerPoint</SelectItem>
                    <SelectItem value="Image">Image</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., handbook, policy, students"
                />
              </div>

              {!isEditing && (
                <div>
                  <Label htmlFor="file">Upload File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {type === 'document' 
                ? (isEditing ? 'Update' : 'Upload')
                : 'Create'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
