import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MUNHIM_API, USMAN_API } from './api/config';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { createLogger } from './utils/logger';
import './index.css';

createLogger('app').info('Starting', { munhim: MUNHIM_API.baseUrl, usman: USMAN_API.baseUrl });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
