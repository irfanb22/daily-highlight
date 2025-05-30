import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

export interface Quote {
  id: string;
  text: string;
  source: string;
  link?: string;
}

interface QuoteSpreadsheetProps {
  quotes: Quote[];
  onChange: (quotes: Quote[]) => void;
}

const QuoteSpreadsheet: React.FC<QuoteSpreadsheetProps> = ({ quotes, onChange }) => {
  const [localQuotes, setLocalQuotes] = useState<Quote[]>(quotes);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (quotes.length === 0) {
      // Initialize with 3 empty rows
      const initialQuotes: Quote[] = Array(3).fill(null).map(() => ({
        id: crypto.randomUUID(),
        text: '',
        source: '',
        link: ''
      }));
      setLocalQuotes(initialQuotes);
      onChange(initialQuotes);
    }
  }, []);

  const validateQuote = (quote: Quote): string[] => {
    const errors: string[] = [];
    if (!quote.text.trim()) errors.push('Quote text is required');
    if (!quote.source.trim()) errors.push('Source is required');
    if (quote.link && !quote.link.startsWith('http')) {
      errors.push('Link must start with http:// or https://');
    }
    return errors;
  };

  const handleChange = (id: string, field: keyof Quote, value: string) => {
    const updatedQuotes = localQuotes.map(quote =>
      quote.id === id ? { ...quote, [field]: value } : quote
    );
    setLocalQuotes(updatedQuotes);
    
    // Validate the changed quote
    const quoteErrors = validateQuote(updatedQuotes.find(q => q.id === id)!);
    setErrors(prev => ({
      ...prev,
      [id]: quoteErrors
    }));

    // Only emit valid quotes
    const validQuotes = updatedQuotes.filter(quote => 
      quote.text.trim() && quote.source.trim()
    );
    onChange(validQuotes);
  };

  const addRow = () => {
    const newQuote: Quote = {
      id: crypto.randomUUID(),
      text: '',
      source: '',
      link: ''
    };
    setLocalQuotes([...localQuotes, newQuote]);
  };

  const removeRow = (id: string) => {
    const updatedQuotes = localQuotes.filter(quote => quote.id !== id);
    setLocalQuotes(updatedQuotes);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    onChange(updatedQuotes.filter(quote => 
      quote.text.trim() && quote.source.trim()
    ));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string, field: keyof Quote) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      
      const currentCell = e.target as HTMLElement;
      const currentRow = currentCell.closest('tr');
      const isLastRow = currentRow === currentRow?.parentElement?.lastElementChild;
      const isLastCell = field === 'link';

      if (isLastCell && isLastRow) {
        addRow();
        setTimeout(() => {
          const inputs = tableRef.current?.querySelectorAll('input');
          const lastRow = inputs?.[inputs.length - 3];
          lastRow?.focus();
        }, 0);
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table ref={tableRef} className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quote Text *
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source *
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Link
            </th>
            <th className="w-12 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {localQuotes.map((quote, index) => (
            <tr
              key={quote.id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-4 py-2 text-sm text-gray-500">
                {index + 1}
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={quote.text}
                  onChange={(e) => handleChange(quote.id, 'text', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, quote.id, 'text')}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your quote"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={quote.source}
                  onChange={(e) => handleChange(quote.id, 'source', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, quote.id, 'source')}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Author or source"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="url"
                  value={quote.link || ''}
                  onChange={(e) => handleChange(quote.id, 'link', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, quote.id, 'link')}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => removeRow(quote.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-150"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={addRow}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Row
        </button>

        {Object.keys(errors).length > 0 && (
          <div className="flex items-center text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            Please fill in all required fields
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteSpreadsheet;