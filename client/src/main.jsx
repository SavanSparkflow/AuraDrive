import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '16px',
          fontSize: '13px',
          fontWeight: '500',
          padding: '12px 16px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        success: {
          iconTheme: {
            primary: '#7C3AED',
            secondary: '#FFFFFF'
          }
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FFFFFF'
          }
        }
      }}
    />
  </React.StrictMode>
);
