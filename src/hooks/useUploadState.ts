import { useState, useCallback } from 'react';
import { simulateFileUpload } from '../utils/fileUtils';

export const useUploadState = () => {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!file || !email) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('uploading');
    setProgress(0);
    setMessage('');

    try {
      // Simulate file upload with progress updates
      await simulateFileUpload(
        (currentProgress) => setProgress(currentProgress),
        file.size
      );

      setStatus('success');
      setMessage('Your file was uploaded successfully!');
      
      // In a real app, we would make an API call here to register the email
      // and process the file on the server
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while uploading your file. Please try again.');
    }
  }, [file, email]);

  return {
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
  };
};