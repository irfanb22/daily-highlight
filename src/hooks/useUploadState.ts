import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Quote } from '../components/QuoteSpreadsheet';

export const useUploadState = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (quotes.length === 0 || !email) return;

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
      setProgress(50);

      const response = await fetch('/.netlify/functions/upload-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          quotes: quotes.map(({ id, ...quote }) => quote) // Remove internal id before sending
        }),
      });

      setProgress(75);

      let data;
      if (!response.ok) {
        // Handle error responses
        const errorText = await response.text();
        try {
          // Try to parse error response as JSON
          data = JSON.parse(errorText);
          throw new Error(data.message || `Error: ${response.statusText}`);
        } catch (parseError) {
          // If parsing fails, use the raw text or status
          throw new Error(errorText || `Error: ${response.statusText}`);
        }
      }

      // Handle successful response
      data = await response.json();
      setProgress(100);

      setStatus('success');
      setMessage(`Successfully processed ${data.quotesCount} quotes!`);
      
      // Show sign up modal
      setShowSignUp(true);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'An error occurred while processing your quotes');
    }
  }, [quotes, email]);

  const handleSignUpSuccess = (newUserId: string) => {
    setUserId(newUserId);
    setShowSignUp(false);
    setShowAccountSetup(true);
  };

  const handleSetupComplete = () => {
    setShowAccountSetup(false);
    // Reset form
    setQuotes([]);
    setEmail('');
    setStatus('idle');
  };

  return {
    quotes,
    email,
    status,
    progress,
    message,
    showSignUp,
    showAccountSetup,
    userId,
    setQuotes,
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