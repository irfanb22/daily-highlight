import React from 'react';
import FileUpload from './FileUpload';
import EmailForm from './EmailForm';
import UploadStatus from './UploadStatus';
import { useUploadState } from '../hooks/useUploadState';

const UploadSection: React.FC = () => {
  const { 
    file, 
    email, 
    status, 
    progress, 
    message,
    setFile, 
    setEmail, 
    setStatus,
    setProgress,
    setMessage,
    handleSubmit
  } = useUploadState();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
      <div className="p-6 sm:p-8">
        <FileUpload 
          file={file} 
          setFile={setFile}
          status={status}
          setStatus={setStatus}
          setMessage={setMessage}
        />
        
        <EmailForm 
          email={email}
          setEmail={setEmail}
          isDisabled={status === 'uploading'}
        />
        
        <UploadStatus 
          status={status}
          progress={progress}
          message={message}
        />
        
        <div className="mt-6">
          <button
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              !file || !email || status === 'uploading'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
            }`}
            disabled={!file || !email || status === 'uploading'}
            onClick={handleSubmit}
          >
            {status === 'uploading' ? 'Uploading...' : 'Subscribe to Daily Quotes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;