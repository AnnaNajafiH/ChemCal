import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MoleculeViewer from '../components/animation';
import ErlenmeyerFlask from '../components/ErlenmeyerFlask';
import { FaArrowRight, FaFlask, FaCalculator, FaDatabase } from 'react-icons/fa';
import { BiAtom } from 'react-icons/bi';
import { Navbar } from '../layouts';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has already set a preference
    const savedMode = localStorage.getItem('darkMode');
    // Otherwise check for system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedMode ? savedMode === 'true' : prefersDark;
  });
  
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  const handleGetStarted = () => {
    navigate('/calculator');
  };
  
  return (
    <div className="welcome-page-container min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 dark:bg-gray-900">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} showHomeLink={false} />
      
      <div className="text-center mb-8 mt-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-center">
          <BiAtom className="text-blue-600 dark:text-blue-400 mr-3 h-12 w-12 animate-spin-slow" />
          ChemCalc
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Your chemistry tool for calculating molar mass and exploring chemical properties
        </p>
      </div>
      
      <div className="welcome-card bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden p-6 mb-8 max-w-5xl w-full dark:shadow-blue-900/20">
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div 
              className="w-full md:w-1/2 molecule-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-900 p-4 rounded-lg shadow-inner cursor-pointer hover:shadow-lg transition-all duration-300"
            >
              <MoleculeViewer 
                width={420} 
                height={320} 
                backgroundColor="#f5f7ff"
              />
              <p className="text-center text-sm text-blue-600 dark:text-blue-400 mt-2">
                Drag to explore the vibrant 3D model of 3,5-Xylenol
              </p>
            </div>
          
          <div className="w-full md:w-1/2 space-y-5">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <FaFlask className="text-blue-600 dark:text-blue-400 mr-2" />
              Chemistry Made Easy
            </h2>
            
            <div className="space-y-5">
              <div className="flex items-start transform transition-all duration-300 hover:translate-x-2 hover:shadow-lg p-3 rounded-lg dark:hover:shadow-blue-900/20">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4 shadow-md">
                  <FaCalculator className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">Precise Calculations</h3>
                  <p className="text-gray-600 dark:text-gray-400">Calculate accurate molar mass for any chemical formula with our advanced algorithm</p>
                </div>
              </div>
              
              <div className="flex items-start transform transition-all duration-300 hover:translate-x-2 hover:shadow-lg p-3 rounded-lg dark:hover:shadow-blue-900/20">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4 shadow-md">
                  <BiAtom className="text-blue-600 dark:text-blue-400 text-xl animate-spin-slow" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">Molecular Visualization</h3>
                  <p className="text-gray-600 dark:text-gray-400">Explore interactive 3D models of molecular structures with intuitive controls</p>
                </div>
              </div>
              
              <div className="flex items-start transform transition-all duration-300 hover:translate-x-2 hover:shadow-lg p-3 rounded-lg dark:hover:shadow-blue-900/20">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4 shadow-md">
                  <FaDatabase className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">Comprehensive Data</h3>
                  <p className="text-gray-600 dark:text-gray-400">Access detailed physical properties from PubChem database for thousands of compounds</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleGetStarted}
              className="mt-8 w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center text-lg font-medium"
            >
              Get Started
              <FaArrowRight className="ml-2" />
            </button>
                  
      {/* Flask animation in the corner */}
      <div className="absolute bottom-10 right-10 w-48 h-64 z-10 hover:scale-110 transition-transform duration-300 flask-highlight">
        <div className="tooltip relative cursor-pointer" data-tip="Pipetting in progress!">
          <ErlenmeyerFlask />
          <div className="text-center text-sm text-blue-600 dark:text-blue-400 font-medium mt-2 bg-white/70 dark:bg-gray-800/70 rounded-md px-2 py-1 backdrop-blur-sm shadow-sm">
            Watch the experiment!
          </div>
        </div>
      </div>

          </div>
        </div>
      </div>
      
      <div className="text-center p-4 mt-4 backdrop-blur-sm bg-white/30 dark:bg-gray-800/50 rounded-lg shadow-inner border border-white/50 dark:border-gray-700/50 w-full max-w-5xl">
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

    </div>
  );
};

export default WelcomePage;
