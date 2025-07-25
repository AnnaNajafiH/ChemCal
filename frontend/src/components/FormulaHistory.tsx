import { useState, useEffect } from 'react';
import { FaTrash, FaFlask, FaHistory } from 'react-icons/fa';
import React from 'react';

interface FormulaHistoryItem {
  id: number;
  formula: string;
  molar_mass: number;
  timestamp: string;
}

const FormulaHistory: React.FC = () => {
  const [history, setHistory] = useState<FormulaHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/history');
        
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching history');
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);
  
  // Format formula with subscripts for display
  const formatFormula = (formula: string): React.ReactNode => {
    const parts = formula.split(/(\d+)/g);
    return (
      <span className="font-mono">
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            return <sub key={index}>{part}</sub>;
          }
          return part;
        })}
      </span>
    );
  };

  const deleteHistoryItem = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/history/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete history item');
      }
      
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting history item:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="atom-loader mr-3"></div>
        <span className="text-gray-500">Loading history...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-800 p-4 mb-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaHistory className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-300">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <FaHistory className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p>No calculation history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-80 overflow-auto pr-2 styled-scrollbar">
      {history.map((item) => (
        <div 
          key={item.id} 
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FaFlask className="text-blue-500 dark:text-blue-400 mr-2" />
              <span className="font-medium dark:text-white">
                {formatFormula(item.formula)}
              </span>
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-mono">{item.molar_mass.toFixed(4)} g/mol</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(item.timestamp).toLocaleString()}
            </div>
            <button
              onClick={() => deleteHistoryItem(item.id)}
              className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1"
              title="Delete from history"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormulaHistory;
