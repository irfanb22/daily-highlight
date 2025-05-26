import React from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Header />
        <UploadSection />
      </div>
    </div>
  );
}

export default App;