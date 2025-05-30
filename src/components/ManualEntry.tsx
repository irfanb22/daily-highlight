import React, { useEffect } from 'react';
import { Quote } from '../types';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface ManualEntryProps {
  quotes: Quote[];
  onChange: (quotes: Quote[]) => void;
}

const ManualEntry: React.FC<ManualEntryProps> = ({ quotes, onChange }) => {
  useEffect(() => {
    if (quotes.length === 0) {
      // Start with one empty row
      onChange([{
        id: crypto.randomUUID(),
        text: '',
        source: '',
        link: ''
      }]);
    }
  }, []);

  const handleChange = (id: string, field: keyof Quote, value: string) => {
    const updatedQuotes = quotes.map(quote =>
      quote.id === id ? { ...quote, [field]: value } : quote
    );
    onChange(updatedQuotes);
  };

  const addRow = () => {
    onChange([...quotes, {
      id: crypto.randomUUID(),
      text: '',
      source: '',
      link: ''
    }]);
  };

  const removeRow = (id: string) => {
    onChange(quotes.filter(quote => quote.id !== id));
  };

  return (
    <div className="space-y-4">
      {quotes.map((quote, index) => (
        <div
          key={quote.id}
          className="flex items-start space-x-2 group bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-150"
        >
          <div className="cursor-move text-gray-400 hover:text-gray-600 mt-2">
            <GripVertical className="w-4 h-4" />
          </div>
          
          <div className="flex-grow space-y-2">
            <input
              type="text"
              value={quote.text}
              onChange={(e) => handleChange(quote.id, 'text', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your quote"
            />
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={quote.source}
                onChange={(e) => handleChange(quote.id, 'source', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Author or source"
              />
              
              <input
                type="url"
                value={quote.link || ''}
                onChange={(e) => handleChange(quote.id, 'link', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://... (optional)"
              />
            </div>
          </div>

          <button
            onClick={() => removeRow(quote.id)}
            className="text-gray-400 hover:text-red-500 transition-colors duration-150 mt-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        onClick={addRow}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Quote
      </button>
    </div>
  );
};

export default ManualEntry;