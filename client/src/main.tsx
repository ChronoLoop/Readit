import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import 'styles/index.scss';
import { QueryClient, QueryClientProvider } from 'react-query';
// import { ReactQueryDevtools } from 'react-query/devtools';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            {/* <ReactQueryDevtools /> */}
        </QueryClientProvider>
    </React.StrictMode>
);
