import { useState, useEffect } from 'react';
import { FaTrash, FaFlask, FaHistory, FaPencilAlt, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import React from 'react';
import API_URL from '../config';

// Basic client-side formula validation
const isFormulaValid = (formula: string): boolean => {
  // Check if formula only contains valid characters
  if (!formula || !/^[A-Za-z0-9\(\)]+$/.test(formula)) {
    return false;
  }
  
  // Check for balanced parentheses
  let stack = 0;
  for (let i = 0; i < formula.length; i++) {
    if (formula[i] === '(') {
      stack++;
    } else if (formula[i] === ')') {
      stack--;
      if (stack < 0) return false; // More closing than opening parentheses
    }
  }
  
  return stack === 0; // All parentheses should be balanced
};



interface FormulaHistoryItem {
  id: number;
  formula: string;
  molar_mass: number;
  timestamp: string;
  boiling_point?: string | null;
  melting_point?: string | null;
  density?: string | null;
  state_at_room_temp?: string | null;
  iupac_name?: string | null;
  hazard_classification?: string | null;
  structure_image_url?: string | null;
  structure_image_svg_url?: string | null;
  compound_url?: string | null;
}

interface FormulaHistoryProps {
  refresh?: number;
  onFormulaSelect?: (formula: string) => void;
}

const FormulaHistory: React.FC<FormulaHistoryProps> = ({ refresh = 0, onFormulaSelect }) => {
  const [history, setHistory] = useState<FormulaHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormula, setEditFormula] = useState<string>("");
  const [isValidEdit, setIsValidEdit] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/history?limit=50`);
        
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
  }, [refresh]);
  
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

  // Handle delete function
  const deleteHistoryItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this formula?')) return;
    
    try {
      const response = await fetch(`${API_URL}/history/${id}`, {
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
  
  // Handle edit functions
  const handleEditChange = (value: string) => {
    setEditFormula(value);
    setIsValidEdit(isFormulaValid(value));
  };

  const startEditing = (item: FormulaHistoryItem) => {
    setEditingId(item.id);
    setEditFormula(item.formula);
    setIsValidEdit(isFormulaValid(item.formula));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormula("");
    setIsValidEdit(true);
  };

  const saveEdit = async (id: number) => {
    if (!isValidEdit) {
      alert('Please fix the formula before saving. Check for balanced parentheses and valid characters.');
      return;
    }
    
    try {
      console.log(`Attempting to update formula with ID ${id} to: ${editFormula}`);
      
      const response = await fetch(`${API_URL}/history/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formula: editFormula }),
      });
      
      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to update formula');
      }
      
      // Update the item in the history
      setHistory(history.map(item => 
        item.id === id ? responseData : item
      ));
      
      setEditingId(null);
    } catch (err) {
      console.error('Error updating formula:', err);
      alert(`Failed to update formula: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setError('Failed to update formula');
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
          {editingId === item.id ? (
            <div className="flex flex-col mb-2">
              <div className="flex items-center">
                <input
                  type="text"
                  value={editFormula}
                  onChange={(e) => handleEditChange(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded dark:bg-gray-700 ${
                    !isValidEdit ? 'border-red-500' : 'dark:border-gray-600'
                  } dark:text-white`}
                  placeholder="Enter chemical formula"
                />
                <button 
                  onClick={() => saveEdit(item.id)}
                  className={`ml-2 p-2 ${
                    !isValidEdit ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                  }`}
                  title="Save"
                  disabled={!isValidEdit}
                >
                  <FaSave />
                </button>
                <button 
                  onClick={cancelEditing}
                  className="ml-2 p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title="Cancel"
                >
                  <FaTimes />
                </button>
              </div>
              {!isValidEdit && (
                <div className="mt-1 flex items-center text-red-500 text-xs">
                  <FaExclamationTriangle className="mr-1" />
                  <span>Invalid formula. Check parentheses and characters.</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaFlask className="text-blue-500 dark:text-blue-400 mr-2" />
                  <span 
                    className="font-medium dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => onFormulaSelect && onFormulaSelect(item.formula)}
                    title="Click to use this formula"
                  >
                    {formatFormula(item.formula)}
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-300 font-mono">{item.molar_mass.toFixed(4)} g/mol</span>
              </div>

              {/* Display molecular structure if available */}
              {item.structure_image_url && (
                <div className="mt-3 flex justify-center border-t pt-3 border-gray-100 dark:border-gray-700">
                  <a 
                    href={item.compound_url || item.structure_image_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src={item.structure_image_url} 
                      alt={`Molecular structure of ${item.formula}`}
                      className="max-h-44 min-h-36 w-auto object-contain rounded-lg bg-white p-2 shadow-sm border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-200"
                    />
                  </a>
                </div>
              )}

              {/* Display additional properties if they exist */}
              {(item.iupac_name || item.state_at_room_temp || item.density || 
                item.melting_point || item.boiling_point || item.hazard_classification) && (
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs border-t pt-2 border-gray-100 dark:border-gray-700">
                  {item.iupac_name && (
                    <>
                      <div className="text-gray-500 dark:text-gray-400">IUPAC:</div>
                      <div className="text-gray-600 dark:text-gray-300">{item.iupac_name}</div>
                    </>
                  )}
                  
                  {item.state_at_room_temp && (
                    <>
                      <div className="text-gray-500 dark:text-gray-400">State:</div>
                      <div className="text-gray-600 dark:text-gray-300">{item.state_at_room_temp}</div>
                    </>
                  )}
                  
                  {item.density && (
                    <>
                      <div className="text-gray-500 dark:text-gray-400">Density:</div>
                      <div className="text-gray-600 dark:text-gray-300">{item.density}</div>
                    </>
                  )}
                  
                  {item.melting_point && (
                    <>
                      <div className="text-gray-500 dark:text-gray-400">Melting pt:</div>
                      <div className="text-gray-600 dark:text-gray-300">{item.melting_point}</div>
                    </>
                  )}
                  
                  {item.boiling_point && (
                    <>
                      <div className="text-gray-500 dark:text-gray-400">Boiling pt:</div>
                      <div className="text-gray-600 dark:text-gray-300">{item.boiling_point}</div>
                    </>
                  )}
                  
                  {item.hazard_classification && (
                    <>
                      <div className="text-gray-500 dark:text-gray-400">Hazard:</div>
                      <div className="text-gray-600 dark:text-gray-300">{item.hazard_classification}</div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(item.timestamp).toLocaleString()}
            </div>
            <div className="flex space-x-2">
              {editingId !== item.id && (
                <button
                  onClick={() => startEditing(item)}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-1"
                  title="Edit formula"
                >
                  <FaPencilAlt />
                </button>
              )}
              <button
                onClick={() => deleteHistoryItem(item.id)}
                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1"
                title="Delete from history"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormulaHistory;
