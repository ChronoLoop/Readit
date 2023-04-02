import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import 'styles/index.scss';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'services';
import { DevTools } from 'devTools';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            <DevTools />
        </QueryClientProvider>
    </React.StrictMode>
);
