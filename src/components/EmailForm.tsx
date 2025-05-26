import React from 'react';
import { Mail } from 'lucide-react';

interface EmailFormProps {
  email: string;
  setEmail: (email: string) => void;
  isDisabled: boolean;
}

const EmailForm: React.FC<EmailFormProps> = ({ email, setEmail, isDisabled }) => {
  return (
    <div className="mb-6">
      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
        Email Address
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="email"
          name="email"
          id="email"
          className={`block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isDisabled}
          required
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        We'll send 3 quotes daily to this email address.
      </p>
    </div>
  );
};

export default EmailForm;