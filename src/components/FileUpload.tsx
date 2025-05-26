import React, { useCallback, useState } from 'react';
import { Upload, File } from 'lucide-react';
import { isValidFileType } from '../utils/fileUtils';

interface FileUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
  status: string;
  setStatus: (status: string) => void;
  setMessage: (message: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  file, 
  setFile, 
  status,
  setStatus,
  setMessage 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== 'uploading') {
      setIsDragging(true);
    }
  }, [status]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (status === 'uploading') return;
    
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  }, [status]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === 'uploading' || !e.target.files) return;
    processFile(e.target.files[0]);
  }, [status]);

  const processFile = (selectedFile: File) => {
    if (!selectedFile) return;
    
    if (!isValidFileType(selectedFile)) {
      setStatus('error');
      setMessage('Please upload only .txt or .json files');
      return;
    }
    
    setFile(selectedFile);
    setStatus('ready');
    setMessage('');
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : file 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          {file ? (
            <div className="flex items-center justify-center flex-col">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <File className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Drag and drop your file here
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Supported file types: .txt, .json
              </p>
            </>
          )}
          
          {!file && (
            <div>
              <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span>Browse Files</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".txt,.json"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={status === 'uploading'}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm">
        <h3 className="font-medium text-gray-900 mb-2">File Format Examples:</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-gray-700 font-medium mb-1">.txt format:</h4>
            <pre className="bg-white p-2 rounded border border-gray-200 text-gray-600 text-xs">
{`Quote text here
-- Author/Source
-- https://example.com (optional)
==
Another quote
-- Another source`}</pre>
          </div>
          
          <div>
            <h4 className="text-gray-700 font-medium mb-1">.json format:</h4>
            <pre className="bg-white p-2 rounded border border-gray-200 text-gray-600 text-xs">
{`{
  "quotes": [
    {
      "text": "Quote text",
      "source": "Author/Source",
      "link": "https://example.com"
    }
  ]
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;