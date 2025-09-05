'use client';
import { createContext } from 'react';

// React context for managing theme color mode (light/dark) across the application.
export const ColorModeContext = createContext({ toggleColorMode: () => {} }); 