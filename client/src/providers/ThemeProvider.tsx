import {
    useState,
    useCallback,
    createContext,
    useEffect,
    useContext,
    ReactNode,
} from 'react';

interface ThemeProviderProps {
    children: ReactNode;
}
type ThemeContextValues = () => void;

const ThemeContext = createContext<ThemeContextValues | undefined>(undefined);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('Please wrap in ThemeProvider');
    }
    return context;
};

const LIGHT_THEME_CLASS = 'theme_light';
const DARK_THEME_CLASS = 'theme_dark';

const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState(DARK_THEME_CLASS);

    const toggleTheme = useCallback(() => {
        setTheme((prevTheme) =>
            prevTheme === LIGHT_THEME_CLASS
                ? DARK_THEME_CLASS
                : LIGHT_THEME_CLASS
        );
    }, []);

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    return (
        <ThemeContext.Provider value={toggleTheme}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
