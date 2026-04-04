import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import { styleReset } from "react95";
import original from "react95/dist/themes/original";
import "@react95/icons/icons.css";
import "./index.css";
import App from "./App";
import { createGlobalStyle } from "styled-components";
import ms_sans_serif from "react95/dist/fonts/ms_sans_serif.woff2";
import ms_sans_serif_bold from "react95/dist/fonts/ms_sans_serif_bold.woff2";

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif}') format('woff2');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif_bold}') format('woff2');
    font-weight: bold;
    font-style: normal;
  }
  body, input, select, textarea {
    font-family: 'ms_sans_serif';
  }
`;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyles />
    <ThemeProvider theme={original}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
