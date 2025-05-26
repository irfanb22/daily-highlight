import { useState, useCallback } from 'react';

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
      // Start reading the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const fileContent = e.target?.result as string;
          setProgress(50); // File read complete

          const response = await fetch('/.netlify/functions/upload-file', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              fileContent,
            }),
          });

          setProgress(90); // Upload complete

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to process file');
          }

          setProgress(100);
          setStatus('success');
          setMessage(`Successfully processed ${data.quotesCount} quotes from your file!`);
          
          // Reset form
          setFile(null);
          setEmail('');
        } catch (error) {
          setStatus('error');
          setMessage(error instanceof Error ? error.message : 'An error occurred while processing your file');
        }
      };

      reader.onerror = () => {
        setStatus('error');
        setMessage('Failed to read the file');
      };

      reader.readAsText(file);
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while processing your file');
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