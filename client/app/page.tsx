'use client';

import { useState, useEffect } from 'react';

interface HealthCheck {
  message: string;
  timestamp: string;
  version: string;
}

export default function Home() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [isHealthy, setIsHealthy] = useState<boolean>(false);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch('/api/health');
        const data: HealthCheck = await response.json();
        setApiStatus(data.message);
        setIsHealthy(true);
      } catch (error) {
        setApiStatus('API is not responding');
        setIsHealthy(false);
      }
    };

    checkApi();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          💑 Married4Life
        </h1>
        <p className="text-center text-xl mb-8">
          Your fullstack relationship management application
        </p>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">API Status</h2>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-lg">{apiStatus}</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Frontend: Next.js 14 with TypeScript
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Backend: Express with TypeScript
          </p>
        </div>
      </div>
    </main>
  );
}
