"use client";

import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";
import { CacheProvider } from '@emotion/react';
import { ReactNode, useMemo } from "react";
import createEmotionCache from '@/lib/emotion-cache';

// Colors from the provided mock
const basePalette = {
  // Dark blue active color across the UI
  primary: { main: "#404D75" },
  secondary: { main: "#00897b" },
  info: { main: "#d81b60" }, // used as tertiary accent
  background: { default: "#2A2D3A", paper: "rgba(255,255,255,0.24)" },
  text: { primary: "#E6EDF3", secondary: "rgba(255,255,255,0.86)" },
};

const shape = { borderRadius: 0 };

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          ...basePalette,
        },
        shape,
        typography: {
          fontFamily: `var(--font-geist-sans), system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial`,
          // Display styles from mock
          h1: { fontWeight: 700, letterSpacing: -0.5, fontSize: "3.75rem", lineHeight: 1.1 }, // Display Large
          h2: { fontWeight: 700, fontSize: "3rem", lineHeight: 1.15 }, // Display Medium
          h3: { fontWeight: 600, fontSize: "2.25rem", lineHeight: 1.2 }, // Display Small
          h4: { fontWeight: 700, fontSize: "1.75rem" },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 700 },
          overline: { textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 },
          subtitle1: { color: basePalette.text.secondary },
          body2: { color: basePalette.text.secondary },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              containedPrimary: {
                backgroundColor: basePalette.primary.main,
                '&:hover': { backgroundColor: '#344264' }
              },
              outlinedPrimary: {
                borderColor: basePalette.primary.main,
                color: basePalette.primary.main,
                '&:hover': { borderColor: '#344264', backgroundColor: 'rgba(64,77,117,0.08)' }
              }
            }
          },
          MuiTypography: {
            defaultProps: {
              variantMapping: { overline: "div" },
            },
          },
          MuiLink: {
            styleOverrides: {
              root: ({ theme }) => ({
                textDecoration: "none",
                transition: "color .2s, border-color .2s",
                borderBottom: "2px solid transparent",
                '&:hover': {
                  color: theme.palette.text.primary,
                  borderBottomColor: theme.palette.text.primary,
                },
              }),
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 0,
              },
            },
          },
          MuiButton: {
            defaultProps: { variant: "contained" },
          },
        },
      }),
    []
  );

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
}
