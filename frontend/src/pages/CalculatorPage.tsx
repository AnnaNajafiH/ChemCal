import React, { useState, useEffect } from 'react';
import App from '../App';


const CalculatorPage: React.FC = () => {
  // Add a loading effect when the calculator first appears
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for visual effect
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="calculator-page relative min-h-screen">
      {/* Add decorative floating elements in background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="atom-bg-decoration top-10 right-10 opacity-10 dark:opacity-5"></div>
        <div className="molecule-bg-decoration bottom-20 left-10 opacity-10 dark:opacity-5"></div>
      </div>
      
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 z-50">
          <div className="text-center">
            <div className="loading-animation mb-4">
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="bubble"></div>
              <div className="flask-container absolute inset-0 flex items-center justify-center">
                <div className="flask"></div>
                <div className="liquid"></div>
              </div>
            </div>
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">Loading Calculator</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Preparing chemical formulas...</p>
          </div>
        </div>
      ) : (
        <div className="fade-in-slide-up">
          <App />
        </div>
      )}
    </div>
  );
};

export default CalculatorPage;
