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
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has already set a preference
    const savedMode = localStorage.getItem('darkMode');
    // Otherwise check for system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedMode ? savedMode === 'true' : prefersDark;
  });
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
    localStorage.setItem('darkMode', darkMode.toString());
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
      <header className={`fixed top-0 left-0 right-0 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm z-50`}>
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className={`molecule-bg rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-6 md:p-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className={`mb-6 p-6 rounded-lg shadow-md backdrop-blur-sm ${darkMode ? 'bg-gray-700/90' : 'bg-blue-50/90'} periodic-element transform transition-all duration-300 hover:shadow-lg`}>
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
                      className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-md text-base font-medium text-white ${loading ? 'bg-blue-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="loading-animation scale-50 mr-2">
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                          </div>
                          <span>Calculating...</span>
                        </div>
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
                  <div className={`mt-6 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-xl p-0 border ${darkMode ? 'border-blue-800/30' : 'border-blue-100'} result-appear shadow-lg backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl overflow-hidden result-card-glow`}>
                    <div className={`flex items-center justify-between p-4 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} border-b ${darkMode ? 'border-blue-800/50' : 'border-blue-200'}`}>
                      <h3 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                        <div className="p-2 rounded-full bg-blue-500/10 mr-3">
                          <FaCalculator className="text-blue-500" />
                        </div>
                        Calculation Result
                      </h3>
                      <button 
                        onClick={() => setShowFormula(!showFormula)}
                        className={`text-xs px-3 py-1.5 rounded-full ${darkMode ? 'bg-blue-800/50 text-blue-300 hover:bg-blue-700/60' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} font-medium flex items-center transition-all duration-200`}>
                        <FaInfoCircle className="mr-1.5" />
                        {showFormula ? 'Hide Details' : 'Show Details'}
                      </button>
                    </div>
                    
                    <div className={`${darkMode ? 'bg-gray-800/95' : 'bg-white'} p-5`}>
                      {/* Main result section with highlighted formula and molar mass */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-5 border-b border-dashed border-gray-200 dark:border-gray-700">
                        <div className="mb-4 sm:mb-0">
                          <div className={`text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Chemical Formula</div>
                          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} break-words`}>
                            {formatFormula(result.formula)}
                          </div>
                        </div>
                        <div className={`flex flex-col items-end ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <div className={`text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Molar Mass</div>
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 value-pulse">
                            {result.molar_mass} <span className="text-sm ml-1">{result.unit}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Properties in a single consolidated box */}
                      <div className="mt-6">
                        <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Compound Properties
                        </h4>
                        
                        <div className={`p-5 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} property-card shadow-sm`}>
                          <div className="space-y-4">
                            {result.iupac_name && (
                              <div className="pb-3 border-b border-gray-200 dark:border-gray-600">
                                <span className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'} block mb-1`}>
                                  IUPAC Name
                                </span>
                                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} break-words`}>
                                  {result.iupac_name}
                                </span>
                              </div>
                            )}
                            
                            {result.state_at_room_temp && (
                              <div className="pb-3 border-b border-gray-200 dark:border-gray-600">
                                <span className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'} block mb-1`}>
                                  State at Room Temperature
                                </span>
                                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {result.state_at_room_temp}
                                </span>
                              </div>
                            )}
                            
                            {result.density && (
                              <div className="pb-3 border-b border-gray-200 dark:border-gray-600">
                                <span className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'} block mb-1`}>
                                  Density
                                </span>
                                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {result.density}
                                </span>
                              </div>
                            )}
                            
                            {result.melting_point && (
                              <div className="pb-3 border-b border-gray-200 dark:border-gray-600">
                                <span className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'} block mb-1`}>
                                  Melting Point
                                </span>
                                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {result.melting_point}
                                </span>
                              </div>
                            )}
                            
                            {result.boiling_point && (
                              <div className={`pb-3 ${result.hazard_classification ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}>
                                <span className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'} block mb-1`}>
                                  Boiling Point
                                </span>
                                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {result.boiling_point}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Keep hazard classification separate with special styling */}
                        {result.hazard_classification && (
                          <div className={`p-4 mt-3 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-50'} property-card border ${darkMode ? 'border-red-800/30' : 'border-red-200'}`}>
                            <div className="flex items-center mb-2">
                              <div className={`p-2 rounded-full ${darkMode ? 'bg-red-800/30' : 'bg-red-100'} mr-3`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-red-300' : 'text-red-600'}`} viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-red-300' : 'text-red-600'}`}>Hazard Classification</span>
                            </div>
                            <span className={`font-medium ${darkMode ? 'text-red-200' : 'text-red-700'} pl-10`}>
                              {result.hazard_classification}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Display molecular structure if available */}
                      {result.structure_image_url ? (
                        <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Molecular Structure
                          </h4>
                          <div className="flex items-center justify-center">
                            <div className="relative group">
                              <div className="absolute inset-0 rounded-xl opacity-75 blur-md group-hover:opacity-100 transition-opacity duration-300 -m-1"></div>
                              <div className="relative">
                                <a 
                                  href={result.compound_url || result.structure_image_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block hover:opacity-90 transition-opacity"
                                >
                                  <img 
                                    src={result.structure_image_url} 
                                    alt={`Molecular structure of ${result.formula}`}
                                    className="max-h-60 min-h-48 w-auto object-contain rounded-lg bg-white dark:bg-gray-900 p-4 shadow-md border border-gray-100 dark:border-gray-700 transform group-hover:scale-[1.02] transition-transform duration-300"
                                  />
                                </a>
                              </div>
                              {result.compound_url && (
                                <a 
                                  href={result.compound_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="mt-3 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center justify-center w-full bg-blue-50 dark:bg-blue-900/30 py-2 rounded-md transition-colors"
                                >
                                  <FaInfoCircle className="mr-2" size={14} />
                                  View detailed compound information
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            3D Molecule Visualization
                          </h4>
                          <div className="relative mx-auto" style={{ width: '280px' }}>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl opacity-75 blur-md -m-1"></div>
                            <div className="relative p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                              <MoleculeViewer width={260} height={260} />
                              <p className="text-center text-xs mt-3 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 py-2 rounded">
                                3D Visualization (Representative Model)
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {showFormula && (
                        <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
                            <FaInfoCircle className="mr-2" /> Formula Composition Details
                          </h4>
                          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
                            <div className="grid grid-cols-12 gap-2 mb-3">
                              <div className={`col-span-5 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Element</div>
                              <div className={`col-span-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Count</div>
                              <div className={`col-span-4 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Mass</div>
                            </div>
                            
                            {/* This assumes element details are passed from API result */}
                            {/* Example row structure that would be mapped over element data */}
                            <div className="space-y-2">
                              {/* Element rows would go here in a real implementation */}
                              {/* Placeholder for visualization */}
                              <div className={`grid grid-cols-12 gap-2 p-2 rounded ${darkMode ? 'bg-gray-800/70' : 'bg-white'} items-center`}>
                                <div className="col-span-5 flex items-center">
                                  <div className={`w-6 h-6 rounded-full ${darkMode ? 'bg-blue-800/50' : 'bg-blue-100'} flex items-center justify-center mr-2`}>
                                    <span className={`text-xs font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                      {result.formula.charAt(0)}
                                    </span>
                                  </div>
                                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                                    {/* Element name would go here */}
                                    {result.formula.match(/[A-Z][a-z]*/)?.[0] || 'Element'}
                                  </span>
                                </div>
                                <div className={`col-span-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {/* Element count would go here */}
                                  {result.formula.match(/\d+/)?.[0] || 'n'}
                                </div>
                                <div className={`col-span-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {/* Element mass contribution */}
                                  {(result.molar_mass / 2).toFixed(2)} g/mol
                                </div>
                              </div>
                              
                              {/* Placeholder for total */}
                              <div className={`grid grid-cols-12 gap-2 p-2 mt-2 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'} pt-2`}>
                                <div className="col-span-5 font-semibold text-sm uppercase tracking-wider">Total</div>
                                <div className="col-span-3"></div>
                                <div className={`col-span-4 font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                  {result.molar_mass} g/mol
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-100'}`}>
                            <div className="flex items-start">
                              <div className="mr-3 mt-1">
                                <FaInfoCircle className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                              </div>
                              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                The molar mass is calculated by summing the atomic weights of all atoms in the chemical formula. 
                                Values are based on the 2018 IUPAC atomic weight standards.
                              </p>
                            </div>
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
                <div className={`p-6 rounded-lg shadow-md backdrop-blur-sm ${darkMode ? 'bg-gray-700/90' : 'bg-gray-50/90'} h-full periodic-element transform transition-all duration-300 hover:shadow-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FaHistory className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
                      <h2 className={`sm:text-l md:text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-gray-900'}`}>Formula History</h2>
                    </div>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className={`inline-flex items-center px-3 py-1.5 ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md text-sm font-medium transition-colors duration-200 shadow-sm transform hover:scale-105`}
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
                    <div 
                      onClick={() => setShowHistory(true)}
                      className={`flex items-center justify-center h-48 ${darkMode ? 'text-gray-400' : 'text-gray-500'} cursor-pointer transform transition-all duration-300 hover:scale-105`}
                    >
                      <div className="text-center  w-full max-w-sm">
                        <div className="chemistry-animation mb-3">
                          <div className="beaker">
                            <div className="liquid">
                              <div className="bubble bubble1"></div>
                              <div className="bubble bubble1"></div>
                              <div className="bubble bubble1"></div>
                              <div className="bubble bubble1"></div>
                              <div className="bubble bubble2"></div>
                              <div className="bubble bubble2"></div>
                              <div className="bubble bubble2"></div>
                              <div className="bubble bubble3"></div>
                              <div className="bubble bubble3"></div>
                              <div className="bubble bubble3"></div>
                              <div className="bubble bubble4"></div>
                              <div className="bubble bubble4"></div>
                              <div className="bubble bubble4"></div>
                              <div className="bubble bubble5"></div>
                              <div className="bubble bubble5"></div>
                            </div>
                          </div>
                         
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-blue-600 dark:text-blue-400">Your Formula History</h3>
                        <p className="text-sm">Discover your previously calculated compounds and quickly access them again</p>
                        <button className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md shadow-sm hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm font-medium flex items-center justify-center mx-auto">
                          <FaHistory className="mr-1.5" /> Show History
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center p-4 mt-8 backdrop-blur-sm bg-white/30 dark:bg-gray-800/50 rounded-lg shadow-inner border border-white/50 dark:border-gray-700/50 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} ChemCalc - Professional Chemistry Tool
            </div>
            <div className="mt-2 md:mt-0 flex space-x-4">
              <a href="https://en.wikipedia.org/wiki/Molar_mass" target="_blank" rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-sm">About Molar Mass</a>
              <a href="https://pubchem.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-sm">PubChem Database</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App
