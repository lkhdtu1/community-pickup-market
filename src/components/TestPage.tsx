// Test page component to verify all interface fixes in the browser
import React, { useState, useEffect } from 'react';
import { runAllTests } from '../tests/test-runner';

const TestPage = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };
    
    console.error = (...args) => {
      logs.push('ERROR: ' + args.join(' '));
      originalError(...args);
    };

    try {
      runAllTests();
      setTestResults(logs);
    } catch (error) {
      logs.push(`FATAL ERROR: ${error}`);
      setTestResults(logs);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Product Interface Test Suite
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This test suite verifies that all the Product interface fixes are working correctly:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Backend UUID string compatibility</li>
              <li>Product to CartItem conversions</li>
              <li>Component prop interfaces</li>
              <li>API response transformations</li>
              <li>Cart operations with string IDs</li>
            </ul>
          </div>

          <button
            onClick={runTests}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-medium ${
              isRunning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white transition-colors`}
          >
            {isRunning ? '🔄 Running Tests...' : '▶️ Run All Tests'}
          </button>

          {testResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                {testResults.map((log, index) => (
                  <div 
                    key={index} 
                    className={`${
                      log.includes('ERROR') ? 'text-red-400' : 
                      log.includes('PASS') ? 'text-green-400' : 
                      log.includes('FAIL') ? 'text-red-400' :
                      log.includes('✅') ? 'text-green-400' :
                      log.includes('❌') ? 'text-red-400' :
                      'text-gray-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Manual Testing</h3>
            <p className="text-blue-800 text-sm">
              After running these tests, you can also manually test:
            </p>
            <ul className="list-disc list-inside text-blue-800 text-sm mt-2 space-y-1">
              <li>Add products to cart from Products page</li>
              <li>View cart with items</li>
              <li>Filter products by category and producer</li>
              <li>Click on producer cards</li>
              <li>Check that all components display correctly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
