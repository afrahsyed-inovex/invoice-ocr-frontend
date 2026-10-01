import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { USE_MOCK } from './api/config';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { createLogger } from './utils/logger';
import './index.css';

createLogger('app').info(`Starting in ${USE_MOCK ? 'mock' : 'live API'} mode`);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
