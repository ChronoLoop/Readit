import GlobalModalsContainer from 'containers/GlobalModalsContainer';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components';
import { HomePage, SubreaditPage, SubmitPostPage, UserPage } from './pages';
import ThemeProvider from './providers/ThemeProvider';

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route
                            path="r/:subreaditName/*"
                            element={<SubreaditPage />}
                        />
                        <Route
                            path="r/:subreaditName/submit"
                            element={<SubmitPostPage />}
                        />
                        <Route path="u/:username/*" element={<UserPage />} />

                        <Route path="submit" element={<SubmitPostPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
                <GlobalModalsContainer />
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
