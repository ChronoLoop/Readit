import GlobalModalsContainer from 'containers/GlobalModalsContainer';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components';
import { Home, Subreadit, SubmitPost } from './pages';
import ThemeProvider from './providers/ThemeProvider';

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route
                            path="r/:subreaditName/*"
                            element={<Subreadit />}
                        />
                        <Route
                            path="r/:subreaditName/submit"
                            element={<SubmitPost />}
                        />
                        <Route path="submit" element={<SubmitPost />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
                <GlobalModalsContainer />
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
