import React from 'react';
import { BookOpen } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="mb-8 text-center">
      <div className="flex items-center justify-center mb-3">
        <BookOpen className="w-8 h-8 text-blue-500 mr-2" />
        <h1 className="text-3xl font-bold text-gray-800">Daily Quotes</h1>
      </div>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Upload your text/markdown files to receive 3 random quotes daily via email.
        Start your mornings with inspiration tailored from your favorite content.
      </p>
    </header>
  );
};

export default Header;