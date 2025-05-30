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
      try {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse response:', text);
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        throw new Error('Failed to read server response');
      }

      setProgress(100);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process quotes');
      }

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