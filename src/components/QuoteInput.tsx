import React, { useState } from 'react';
import { Quote } from '../types';
import BulkImport from './BulkImport';
import ManualEntry from './ManualEntry';
import { Clipboard, Table2 } from 'lucide-react';

interface QuoteInputProps {
  quotes: Quote[];
  onChange: (quotes: Quote[]) => void;
}

const QuoteInput: React.FC<QuoteInputProps> = ({ quotes, onChange }) => {
  const [mode, setMode] = useState<'bulk' | 'manual'>('bulk');

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setMode('bulk')}
          className={`flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
            mode === 'bulk'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Clipboard className="w-4 h-4 mr-2" />
          Bulk Import
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
            mode === 'manual'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Table2 className="w-4 h-4 mr-2" />
          Manual Entry
        </button>
      </div>

      {mode === 'bulk' ? (
        <BulkImport quotes={quotes} onChange={onChange} />
      ) : (
        <ManualEntry quotes={quotes} onChange={onChange} />
      )}
    </div>
  );
};

export default QuoteInput;