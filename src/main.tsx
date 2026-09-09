import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { GameFrameProvider } from './context/GameFrameContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './utils/visualSettings';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GameFrameProvider>
        <App />
      </GameFrameProvider>
    </ErrorBoundary>
  </StrictMode>,
);
