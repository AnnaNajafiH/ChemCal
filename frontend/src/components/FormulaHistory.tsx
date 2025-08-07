import { useState, useEffect } from 'react';
import { FaTrash, FaFlask, FaHistory, FaPencilAlt, FaSave, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
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
      <div className="flex flex-col items-center justify-center py-8">
        <div className="loading-animation mb-2 scale-75">
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
        </div>
        <span className="text-gray-500 dark:text-gray-400">Loading history...</span>
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
      <div className="text-center py-8 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg p-4 shadow-inner">
        <div className="chemistry-animation mb-4">
          <div className="flask-container">
            <div className="flask"></div>
            <div className="liquid"></div>
          </div>
        </div>
        <h3 className="mt-3 text-blue-600 dark:text-blue-400 font-medium">Your History Is Empty</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto">Calculate your first chemical formula to start building your history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[calc(90vh-12rem)] overflow-auto pr-2 styled-scrollbar">
      <div className="flex items-center mb-3">
        <FaHistory className="text-blue-500 dark:text-blue-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Your Saved Formulas</h3>
      </div>
      
      <div className="grid gap-3">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-200 backdrop-blur-sm transform hover:scale-[1.01] group"
          >
            {editingId === item.id ? (
              <div className="flex flex-col mb-2">
                <div className="flex flex-wrap items-center">
                  <input
                    type="text"
                    value={editFormula}
                    onChange={(e) => handleEditChange(e.target.value)}
                    className={`flex-1 min-w-0 px-3 py-2 border rounded dark:bg-gray-700 ${
                      !isValidEdit ? 'border-red-500' : 'dark:border-gray-600'
                    } dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Enter chemical formula"
                  />
                  <div className="flex mt-2 sm:mt-0 sm:ml-2">
                  <button 
                    onClick={() => saveEdit(item.id)}
                    className={`p-2 rounded-md ${
                      !isValidEdit 
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-800/40 dark:text-green-400 transition-colors'
                    }`}
                    title="Save"
                    disabled={!isValidEdit}
                  >
                    <FaSave />
                  </button>
                  <button 
                    onClick={cancelEditing}
                    className="ml-2 p-2 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-800/40 dark:text-red-400 transition-colors"
                    title="Cancel"
                  >
                    <FaTimes />
                  </button>
                </div>
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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3 flex-shrink-0">
                    <FaFlask className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  </div>
                  <div>
                    <span 
                      className="font-medium text-gray-800 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 break-words flex items-center"
                      onClick={() => onFormulaSelect && onFormulaSelect(item.formula)}
                      title="Click to use this formula"
                    >
                      {formatFormula(item.formula)}
                      <span className="inline-block ml-2 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
                        {item.molar_mass.toFixed(2)} g/mol
                      </span>
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Display molecular structure if available */}
              {item.structure_image_url && (
                <div className="mt-3 flex flex-col items-center border-t pt-3 border-gray-100 dark:border-gray-700">
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
                  {item.compound_url && (
                    <a 
                      href={item.compound_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                    >
                      <FaInfoCircle className="mr-1" size={10} />
                      View on PubChem
                    </a>
                  )}
                </div>
              )}

              {/* Display additional properties if they exist */}
              {(item.iupac_name || item.state_at_room_temp || item.density || 
                item.melting_point || item.boiling_point || item.hazard_classification) && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs border-t pt-2 border-gray-100 dark:border-gray-700">
                  {item.iupac_name && (
                    <>
                      <div className="text-gray-500 dark:text-gray-400">IUPAC:</div>
                      <div className="text-gray-600 dark:text-gray-300 break-words">{item.iupac_name}</div>
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
          <div className="flex justify-end items-center mt-3 border-t pt-3 border-gray-100 dark:border-gray-700">
            <div className="flex space-x-2">
              {editingId !== item.id && (
                <button
                  onClick={() => startEditing(item)}
                  className="flex items-center text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 text-blue-600 dark:text-blue-400 rounded-md transition-colors"
                  title="Edit formula"
                >
                  <FaPencilAlt className="mr-1" />
                  <span>Edit</span>
                </button>
              )}
              <button
                onClick={() => onFormulaSelect && onFormulaSelect(item.formula)}
                className="flex items-center text-xs px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-800/30 text-green-600 dark:text-green-400 rounded-md transition-colors"
                title="Use this formula"
              >
                <FaFlask className="mr-1" />
                <span>Use</span>
              </button>
              <button
                onClick={() => deleteHistoryItem(item.id)}
                className="flex items-center text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400 rounded-md transition-colors"
                title="Delete from history"
              >
                <FaTrash className="mr-1" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default FormulaHistory;
