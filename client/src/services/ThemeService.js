import {createTheme, ThemeProvider} from "@mui/material/styles";

const defaultTheme = createTheme();


export const SiteTheme = ({children}) => {
    return (
        <ThemeProvider theme={defaultTheme}>
            {children}
        </ThemeProvider>
    );
}
