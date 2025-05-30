import React, { useState, useCallback } from 'react';
import { Quote } from '../types';
import { AlertCircle, FileText, CheckCircle, Trash2, Copy } from 'lucide-react';

interface BulkImportProps {
  quotes: Quote[];
  onChange: (quotes: Quote[]) => void;
}

const sampleQuotes = `"Life is what happens while you're busy making other plans." -- John Lennon
The only way to do great work is to love what you do. -- Steve Jobs
In three words I can sum up everything I've learned about life: it goes on. -- Robert Frost`;

const BulkImport: React.FC<BulkImportProps> = ({ quotes, onChange }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Quote[]>([]);

  const parseQuotes = useCallback((text: string): Quote[] => {
    // Try parsing as JSON first
    try {
      const jsonData = JSON.parse(text);
      if (Array.isArray(jsonData)) {
        return jsonData.map(quote => ({
          id: crypto.randomUUID(),
          text: quote.text || quote.content || quote.quote || '',
          source: quote.source || quote.author || '',
          link: quote.link || quote.url || ''
        }));
      }
    } catch {} // Not JSON, continue to other formats

    // Parse line by line
    const lines = text.split('\n').filter(line => line.trim());
    const parsedQuotes: Quote[] = [];
    let currentQuote: Partial<Quote> = {};

    for (const line of lines) {
      const authorMatch = line.match(/--\s*(.+)$/);
      if (authorMatch) {
        // Line contains author
        const [fullMatch, author] = authorMatch;
        const quoteText = line.replace(fullMatch, '').trim();
        parsedQuotes.push({
          id: crypto.randomUUID(),
          text: quoteText,
          source: author.trim(),
          link: ''
        });
      } else if (line.trim()) {
        // Just quote text
        parsedQuotes.push({
          id: crypto.randomUUID(),
          text: line.trim(),
          source: '',
          link: ''
        });
      }
    }

    return parsedQuotes;
  }, []);

  const handleInput = useCallback((value: string) => {
    setInput(value);
    try {
      const parsed = parseQuotes(value);
      setPreview(parsed);
      setError(null);
    } catch (err) {
      setError('Could not parse quotes. Please check the format.');
      setPreview([]);
    }
  }, [parseQuotes]);

  const handleImport = () => {
    if (preview.length > 0) {
      onChange(preview);
      setInput('');
      setPreview([]);
    }
  };

  const handleClear = () => {
    setInput('');
    setPreview([]);
    setError(null);
  };

  const handleUseSample = () => {
    handleInput(sampleQuotes);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Paste your quotes here..."
        />
        
        <div className="absolute top-2 right-2 space-x-2">
          <button
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleUseSample}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Use sample quotes"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {preview.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div className="space-y-2">
              {preview.map((quote) => (
                <div key={quote.id} className="text-sm">
                  <p className="text-gray-800">"{quote.text}"</p>
                  {quote.source && (
                    <p className="text-gray-600">— {quote.source}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {preview.length} quote{preview.length !== 1 ? 's' : ''} detected
            </div>
            <button
              onClick={handleImport}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Import Quotes
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Supported Formats
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• One quote per line with "-- Author" at the end</p>
          <p>• JSON array of quote objects</p>
          <p>• Plain text quotes (author can be added later)</p>
        </div>
      </div>
    </div>
  );
};

export default BulkImport;