import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useUploadState = () => {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const fileContent = e.target?.result as string;
          setProgress(50);

          const response = await fetch('/.netlify/functions/upload-file', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              fileContent,
              fileName: file.name
            }),
          });

          setProgress(90);

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to process file');
          }

          setProgress(100);
          setStatus('success');
          setMessage(`Successfully processed ${data.quotesCount} quotes from your file!`);
          
          // Show sign up modal
          setShowSignUp(true);
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

  const handleSignUpSuccess = (newUserId: string) => {
    setUserId(newUserId);
    setShowSignUp(false);
    setShowAccountSetup(true);
  };

  const handleSetupComplete = () => {
    setShowAccountSetup(false);
    // Reset form
    setFile(null);
    setEmail('');
    setStatus('idle');
  };

  return {
    file,
    email,
    status,
    progress,
    message,
    showSignUp,
    showAccountSetup,
    userId,
    setFile,
    setEmail,
    setStatus,
    setProgress,
    setMessage,
    setShowSignUp,
    handleSubmit,
    handleSignUpSuccess,
    handleSetupComplete
  };
};