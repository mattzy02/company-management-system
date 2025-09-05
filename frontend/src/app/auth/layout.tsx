'use client';

import { Box, Paper, IconButton, useTheme } from '@mui/material';
import { useContext } from 'react';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from '../ColorModeContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <IconButton
        sx={{ position: 'absolute', top: 16, right: 16 }}
        onClick={colorMode.toggleColorMode}
        color="inherit"
      >
        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {children}
      </Paper>
    </Box>
  );
} 