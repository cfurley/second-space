import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { api } from "../utils/api";

type MediaUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSpaceId?: string;
  currentUserId?: string;
  onMediaUploaded?: (mediaData: any) => void;
};

export function MediaUploadDialog({ 
  open, 
  onOpenChange, 
  currentSpaceId, 
  currentUserId,
  onMediaUploaded 
}: MediaUploadDialogProps) {
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaDescription, setMediaDescription] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // CWE-434: Security - Whitelist of allowed file types (matches backend)
  const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'txt', 'json'];
  const ALLOWED_MIME_TYPES = [
    'image/png',
    'image/jpeg', 
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
    'text/plain',
    'application/json'
  ];
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  const validateFile = (file: File): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop() || '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      errors.push(`File type .${extension} not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push(`File MIME type ${file.type} not allowed`);
    }

    // Check MIME type matches extension
    const mimeToExt: Record<string, string[]> = {
      'image/png': ['png'],
      'image/jpeg': ['jpg', 'jpeg'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'image/bmp': ['bmp'],
      'image/svg+xml': ['svg'],
      'text/plain': ['txt'],
      'application/json': ['json']
    };
    
    const validExtensions = mimeToExt[file.type];
    if (validExtensions && !validExtensions.includes(extension)) {
      errors.push('File type and extension do not match');
    }

    return { valid: errors.length === 0, errors };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (!file) {
      setMediaFile(null);
      setMediaPreview(null);
      return;
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(`File validation failed:\n${validation.errors.join('\n')}`);
      e.target.value = ''; // Clear the input
      setMediaFile(null);
      setMediaPreview(null);
      return;
    }

    setMediaFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
    }
  };

  const handleMediaSubmit = async () => {
    if (!currentSpaceId) {
      alert("Please select a space first");
      return;
    }
    
    if (!mediaFile) {
      alert("Please select a file to upload");
      return;
    }

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g., "data:image/png;base64,")
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(mediaFile);
      });
      
      console.log("Uploading media:", {
        filename: mediaFile.name,
        file_size: mediaFile.size,
        container_id: currentSpaceId
      });
      
      // Create media using backend API
      const result = await api.createMedia({
        container_id: parseInt(currentSpaceId), // Assuming container_id is the space ID
        filename: mediaFile.name,
        file_size: mediaFile.size,
        base64: base64,
        create_date_utc: new Date().toISOString()
      });
      
      // Notify parent component with the uploaded media data
      if (onMediaUploaded && result.success) {
        onMediaUploaded({
          type: 'image', // Adjust based on file type
          content: {
            id: result.data?.id,
            title: mediaTitle,
            description: mediaDescription,
            image: `data:${mediaFile.type};base64,${base64}`,
            timestamp: 'just now',
            fileName: mediaFile.name,
            fileType: mediaFile.type,
            fileSize: mediaFile.size
          }
        });
      }
      
      alert(`Media "${mediaTitle || mediaFile.name}" uploaded successfully!`);
      
      // Reset form and close dialog
      setMediaTitle("");
      setMediaDescription("");
      setMediaFile(null);
      setMediaPreview(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading media:", error);
      alert(`Failed to upload media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upload Media</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="mediaTitle">Title</Label>
            <Input
              id="mediaTitle"
              value={mediaTitle}
              onChange={(e) => setMediaTitle(e.target.value)}
              placeholder="Enter media title"
              className="w-full"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="mediaDescription">Description</Label>
            <Input
              id="mediaDescription"
              value={mediaDescription}
              onChange={(e) => setMediaDescription(e.target.value)}
              placeholder="Enter media description"
              className="w-full"
            />
          </div>

          {/* Drag and Drop File Area */}
          <div className="space-y-2">
            <Label>File</Label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50/50"
              onClick={() => document.getElementById('mediaFile')?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-blue-400', 'bg-blue-50/30');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/30');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/30');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  const event = { target: { files } } as any;
                  handleFileChange(event);
                }
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {mediaFile ? mediaFile.name : 'Drag and drop your file here'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    or click to browse
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Allowed: PNG, JPG, JPEG, GIF, WebP, BMP, SVG, TXT, JSON (Max 20MB)
                </p>
              </div>
              <Input
                id="mediaFile"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".png,.jpg,.jpeg,.gif,.webp,.bmp,.svg,.txt,.json"
              />
            </div>
          </div>

          {/* Preview Section */}
          {mediaPreview && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-4">
                <img 
                  src={mediaPreview} 
                  alt="Preview" 
                  className="max-w-full max-h-[300px] mx-auto rounded"
                />
              </div>
            </div>
          )}

          {/* File Info for non-images */}
          {mediaFile && !mediaFile.type.startsWith('image/') && (
            <div className="space-y-2">
              <Label>File Information</Label>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{mediaFile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{mediaFile.type || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{(mediaFile.size / 1024).toFixed(2)} KB</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleMediaSubmit} className="w-full sm:w-auto">Upload Media</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
