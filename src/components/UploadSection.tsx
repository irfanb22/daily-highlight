import React from 'react';
import QuoteSpreadsheet from './QuoteSpreadsheet';
import EmailForm from './EmailForm';
import UploadStatus from './UploadStatus';
import SignUpModal from './SignUpModal';
import AccountSetup from './AccountSetup';
import { useUploadState } from '../hooks/useUploadState';

const UploadSection: React.FC = () => {
  const { 
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
  } = useUploadState();

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
        <div className="p-6 sm:p-8">
          <QuoteSpreadsheet 
            quotes={quotes}
            onChange={setQuotes}
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
                quotes.length === 0 || !email || status === 'uploading'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
              }`}
              disabled={quotes.length === 0 || !email || status === 'uploading'}
              onClick={handleSubmit}
            >
              {status === 'uploading' ? 'Processing...' : 'Subscribe to Daily Quotes'}
            </button>
          </div>
        </div>
      </div>

      {showSignUp && (
        <SignUpModal
          isOpen={showSignUp}
          onClose={() => setShowSignUp(false)}
          email={email}
          onSuccess={handleSignUpSuccess}
        />
      )}

      {showAccountSetup && userId && (
        <AccountSetup
          userId={userId}
          onComplete={handleSetupComplete}
        />
      )}
    </>
  );
};