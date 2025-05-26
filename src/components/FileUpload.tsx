import React, { useCallback, useState } from 'react';
import { Upload, File, Info } from 'lucide-react';
import { isValidFileType } from '../utils/fileUtils';
import FormatInstructions from './FormatInstructions';

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
  const [showInstructions, setShowInstructions] = useState(false);

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
              <div className="flex items-center justify-center mb-1">
                <p className="text-sm font-medium text-gray-700">
                  Drag and drop your file here
                </p>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Supported formats: .txt, .json
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

      {/* Format Instructions */}
      <div className={`transition-all duration-300 overflow-hidden ${
        showInstructions ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <FormatInstructions />
      </div>
    </div>
  );
};

export default FileUpload;