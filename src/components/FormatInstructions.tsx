import React, { useState } from 'react';
import { Copy, Check, FileJson, FileText, Mail } from 'lucide-react';

const jsonTemplate = {
  quotes: [
    {
      text: "Life is what happens while you're busy making other plans.",
      source: "John Lennon",
      link: "https://example.com/quote1"
    },
    {
      text: "The only way to do great work is to love what you do.",
      source: "Steve Jobs"
    },
    {
      text: "In three words I can sum up everything I've learned about life: it goes on.",
      source: "Robert Frost",
      link: "https://example.com/quote3"
    }
  ]
};

const txtTemplate = `Life is what happens while you're busy making other plans.
-- John Lennon
-- https://example.com/quote1
==
The only way to do great work is to love what you do.
-- Steve Jobs
==
In three words I can sum up everything I've learned about life: it goes on.
-- Robert Frost
-- https://example.com/quote3`;

const FormatInstructions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'json' | 'txt'>('json');
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedTxt, setCopiedTxt] = useState(false);

  const copyToClipboard = async (text: string, format: 'json' | 'txt') => {
    try {
      await navigator.clipboard.writeText(
        format === 'json' ? JSON.stringify(jsonTemplate, null, 2) : text
      );
      if (format === 'json') {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      } else {
        setCopiedTxt(true);
        setTimeout(() => setCopiedTxt(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'json'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('json')}
        >
          <FileJson className="w-4 h-4 inline mr-2" />
          JSON Format
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'txt'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('txt')}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Text Format
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'json' ? (
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-700">JSON Template</h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(jsonTemplate, null, 2), 'json')}
                className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 flex items-center"
              >
                {copiedJson ? (
                  <Check className="w-4 h-4 mr-1 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {copiedJson ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(jsonTemplate, null, 2)}
            </pre>
            <p className="text-xs text-gray-500 mt-2">
              The "link" field is optional and can be omitted.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-700">Text Template</h3>
              <button
                onClick={() => copyToClipboard(txtTemplate, 'txt')}
                className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 flex items-center"
              >
                {copiedTxt ? (
                  <Check className="w-4 h-4 mr-1 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {copiedTxt ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
              {txtTemplate}
            </pre>
            <ul className="text-xs text-gray-500 mt-2 space-y-1">
              <li>• Use -- to separate quote from source</li>
              <li>• Add a second -- for optional link</li>
              <li>• Use == to separate different quotes</li>
            </ul>
          </div>
        )}

        {/* Preview Section */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Mail className="w-4 h-4 mr-1" />
            Email Preview
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <blockquote className="text-sm italic text-gray-700 mb-2">
              "Life is what happens while you're busy making other plans."
            </blockquote>
            <p className="text-xs text-gray-500">
              — John Lennon
              <a href="#" className="text-blue-500 hover:text-blue-600 ml-1">
                (source)
              </a>
            </p>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Tips</h4>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Use any text editor to create these files</li>
            <li>• Make sure each quote has both text and source</li>
            <li>• Links are optional but must start with http:// or https://</li>
            <li>• Save the file with .json or .txt extension</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FormatInstructions;