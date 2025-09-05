'use client';

import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';
import { ReactNode, useMemo, useState } from 'react';
import { ColorModeContext } from './ColorModeContext';
import { UserProvider } from './UserContext';

// ----------------------------------------------------------------------

// theme registry component that provides light/dark mode switching functionality
export default function ThemeRegistry({ children }: { children: ReactNode }) {
  // current theme mode state - defaults to light mode
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // color mode context value with toggle function
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        // toggle between light and dark modes
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  // create Material-UI theme based on current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          // custom dark mode colors for better visual hierarchy
          ...(mode === 'dark'
            ? {
                background: {
                  default: '#1B2635',  // dark blue background
                  paper: '#2C3E50',    // slightly lighter blue for cards/panels
                },
              }
            : {}),
        },
      }),
    [mode],
  );

  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          {/* css baseline for consistent styling across browsers */}
          <CssBaseline />
          <UserProvider>
            {children}
          </UserProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </NextAppDirEmotionCacheProvider>
  );
} 