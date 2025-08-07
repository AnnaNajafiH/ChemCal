import { useState, useEffect } from 'react';
import './App.css';
import FormulaHistory from './components/FormulaHistory';
import MoleculeViewer from './components/animation';
import { FaFlask, FaHistory, FaSave, FaCalculator, FaInfoCircle, FaExclamationTriangle, FaHome} from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { BiAtom } from 'react-icons/bi';
import React from 'react';
import API_URL from './config';
import { Link } from 'react-router-dom';



// Types definition
interface FormulaResult {
  formula: string;
  molar_mass: number;
  unit: string;
  boiling_point?: string | null;
  melting_point?: string | null;
  density?: string | null;
  state_at_room_temp?: string | null;
  iupac_name?: string | null;
  hazard_classification?: string | null;
  structure_image_url?: string | null;
  structure_image_svg_url?: string | null;
  compound_url?: string | null;
  error?: string;
}

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

function App() {
  const [formula, setFormula] = useState<string>('');
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyRefresh, setHistoryRefresh] = useState<number>(0);
  const [showFormula, setShowFormula] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);

  // Validate formula on input change
  const handleFormulaChange = (value: string) => {
    setFormula(value);
    setIsValid(isFormulaValid(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formula.trim()) {
      setError('Please enter a chemical formula');
      return;
    }
    
    if (!isValid) {
      setError('Formula appears to be invalid. Check for balanced parentheses and valid characters.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Calculating molar mass for formula: ${formula}`);
      
      const response = await fetch(`${API_URL}/molar-mass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formula }),
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to calculate molar mass');
      }
      
      setResult(data);
      
      // Trigger history refresh
      setHistoryRefresh(prev => prev + 1);
    } catch (err) {
      console.error('Error calculating molar mass:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // We can remove this function as saving is already done automatically when calculating
  // and the /save endpoint has been removed from the backend
  const handleFormulaSelect = (selectedFormula: string) => {
    setFormula(selectedFormula);
    // Optionally close history panel if it's shown
    if (showHistory) setShowHistory(false);
  };

  // Toggle dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  return (
    <div className={`min-h-screen chemistry-bg ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-b from-blue-50 to-indigo-50'} transition-all duration-300`}>
      <header className={`border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BiAtom className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className={`md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>ChemCalc</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
                      <Link 
          to="/" 
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FaHome className="mr-1" />
          <span>Home</span>
        </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`molecule-bg rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-6 md:p-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className={`mb-6 p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} periodic-element`}>
                  <div className="flex items-center mb-4">
                    <FaFlask className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
                    <h2 className={`sm:text-xl md:text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-gray-900'}`}>Calculate Molar Mass</h2>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="formula" className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>
                        Chemical Formula
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="text"
                          id="formula"
                          className={`formula-input block w-full px-4 py-3 border ${
                            darkMode ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-400'
                          } ${
                            formula && !isValid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'
                          } rounded-md shadow-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                          placeholder="e.g., H2O, NaCl, Ca(OH)2"
                          value={formula}
                          onChange={(e) => handleFormulaChange(e.target.value)}
                          spellCheck="false"
                        />
                        {formula && !isValid && (
                          <div className="mt-1 text-red-500 text-xs">
                            Formula appears invalid. Check parentheses balance and characters.
                          </div>
                        )}
                        {formula && (
                          <button
                            type="button"
                            onClick={() => setFormula('')}
                            className={`absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500`}
                          >
                            <IoMdClose className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['NaCl', 'Ca(OH)2', 'C13H16O8', 'C6H12O6', 'C21H22O9'].map((example) => (
                          <button
                            key={example}
                            type="button"
                            onClick={() => setFormula(example)}
                            className={`inline-flex items-center px-2.5 py-1.5 border ${darkMode ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded text-xs font-medium transition-colors duration-200`}
                          >
                            {formatFormula(example)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${loading ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                    >
                      {loading ? (
                        <>
                          <span className="atom-loader mr-2"></span>
                          <span>Calculating...</span>
                        </>
                      ) : (
                        <>
                          <FaCalculator className="mr-2" />
                          <span>Calculate Molar Mass</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
                
                {error && (
                  <div className={`mt-4 ${darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-400'} border-l-4 p-4 rounded-md result-appear`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaExclamationTriangle className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {result && (
                  <div className={`mt-6 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg p-6 border ${darkMode ? 'border-blue-800/30' : 'border-blue-100'} result-appear`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                        <FaCalculator className="inline mr-2" /> Result
                      </h3>
                      <button 
                        onClick={() => setShowFormula(!showFormula)}
                        className={`text-xs ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} font-medium flex items-center`}>
                        <FaInfoCircle className="mr-1" />
                        {showFormula ? 'Hide Formula Details' : 'Show Formula Details'}
                      </button>
                    </div>
                    
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-md shadow-sm`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Formula:</div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} break-words`}>
                          {formatFormula(result.formula)}
                        </div>
                        
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Molar Mass:</div>
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {result.molar_mass} {result.unit}
                        </div>

                        {result.iupac_name && (
                          <>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>IUPAC Name:</div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} break-words`}>
                              {result.iupac_name}
                            </div>
                          </>
                        )}

                        {result.state_at_room_temp && (
                          <>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>State at Room Temp:</div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {result.state_at_room_temp}
                            </div>
                          </>
                        )}

                        {result.density && (
                          <>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Density:</div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {result.density}
                            </div>
                          </>
                        )}

                        {result.melting_point && (
                          <>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Melting Point:</div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {result.melting_point}
                            </div>
                          </>
                        )}

                        {result.boiling_point && (
                          <>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Boiling Point:</div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {result.boiling_point}
                            </div>
                          </>
                        )}

                        {result.hazard_classification && (
                          <>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hazard Classification:</div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {result.hazard_classification}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Display molecular structure if available */}
                      {result.structure_image_url ? (
                        <div className="mt-6 flex flex-col items-center border-t pt-5 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-center gap-8 flex-wrap">
                            <div>
                              <a 
                                href={result.compound_url || result.structure_image_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block hover:opacity-80 transition-opacity"
                              >
                                <img 
                                  src={result.structure_image_url} 
                                  alt={`Molecular structure of ${result.formula}`}
                                  className="max-h-60 min-h-48 w-auto object-contain rounded-lg bg-white p-3 shadow-md border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-200"
                                />
                              </a>
                              {result.compound_url && (
                                <a 
                                  href={result.compound_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="mt-2 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                                >
                                  <FaInfoCircle className="mr-1" size={10} />
                                  View more details
                                </a>
                              )}
                            </div>

                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 border-t pt-5 border-gray-200 dark:border-gray-700">
                          <div className="p-2 bg-white rounded-lg shadow-md border border-gray-100 dark:border-gray-700 dark:bg-gray-800 mx-auto" style={{ width: '240px' }}>
                            <MoleculeViewer width={240} height={240} />
                            <p className="text-center text-xs mt-2 text-gray-500 dark:text-gray-400">
                              3D Model (Water)
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {showFormula && (
                        <div className={`mt-4 p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-sm`}>
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Element</div>
                            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Count</div>
                            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Mass Contribution</div>
                          </div>
                          <div className="h-px w-full bg-gray-300 mb-2"></div>
                          {/* This would be populated with actual element breakdown data from backend */}
                          <div className="italic text-center text-xs mt-2 text-gray-500">
                            Detailed element breakdown requires API enhancement
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-end">
                        <span className="text-xs text-green-600 dark:text-green-400">
                          <FaSave className="inline-block sm:text-xxs mr-1.5" />
                          Automatically saved to history
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} h-full periodic-element`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FaHistory className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
                      <h2 className={`sm:text-l md:text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-gray-900'}`}>Formula History</h2>
                    </div>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className={`inline-flex items-center px-3 py-1.5 ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      {showHistory ? 'Hide History' : 'Show History'}
                    </button>
                  </div>
                  
                  {showHistory && (
                    <div key={historyRefresh} className="mt-2">
                      <FormulaHistory 
                        refresh={historyRefresh}
                        onFormulaSelect={handleFormulaSelect}
                      />
                    </div>
                  )}
                  
                  {!showHistory && (
                    <div className={`flex items-center justify-center h-48 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="text-center">
                        <FaHistory className="md:text-xl sm:text-lg h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>Click 'Show History' to view your saved formulas</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            &copy; {new Date().getFullYear()} Molar Mass Calculator - Professional Chemistry Tool
          </p>
          <div className="flex items-center mt-2 md:mt-0">
            <a 
              href="https://en.wikipedia.org/wiki/Molar_mass" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} mr-4`}
            >
              About Molar Mass
            </a>
            <a 
              href="https://pubchem.ncbi.nlm.nih.gov/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
            >
              PubChem Database
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App
