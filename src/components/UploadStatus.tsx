import React, { useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadStatusProps {
  status: string;
  progress: number;
  message: string;
}

const UploadStatus: React.FC<UploadStatusProps> = ({ status, progress, message }) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${progress}%`;
    }
  }, [progress]);

  if (status === 'idle' && !message) {
    return null;
  }

  return (
    <div className="mb-6 overflow-hidden">
      {status === 'uploading' && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Uploading file...</p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              ref={progressRef}
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 text-right">{progress}%</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-start p-4 bg-green-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">{message}</p>
            <p className="text-xs text-green-700 mt-1">
              Check your inbox for your first set of quotes tomorrow!
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start p-4 bg-red-50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800">{message}</p>
        </div>
      )}
    </div>
  );
};

export default UploadStatus;