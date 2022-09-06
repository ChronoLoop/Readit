import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components';
import { Home } from './pages';
import ThemeProvider from './providers/ThemeProvider';

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
