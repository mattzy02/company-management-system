'use client';

import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../../ColorModeContext';
import { useUser } from '../../UserContext';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import NextLink from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { Alert, CircularProgress } from '@mui/material';

const defaultTheme = createTheme();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { login } = useUser();
  const router = useRouter();

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Must be a valid email';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    validate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) {
      setLoading(true);
      setLoginError(null);
      
      try {
        const success = await login(email, password);
        if (success) {
          setLoginSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          setLoginError('Invalid email or password');
        }
      } catch (error) {
        setLoginError('Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%', position: 'relative' }}>
            {/* Back button positioned at top-left of login box */}
            <Box sx={{ position: 'absolute', top: -160, left: 0 }}>
              <NextLink href="/" passHref>
                <IconButton 
                  sx={{ 
                    bgcolor: 'grey.700', 
                    color: 'white',
                    '&:hover': { bgcolor: 'grey.800' }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </NextLink>
            </Box>
            
            {/* Login hint */}
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'action.hover', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: theme.palette.mode === 'dark' ? 'grey.600' : 'divider' 
            }}>
              <Typography variant="body2" sx={{ 
                textAlign: 'center',
                color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary'
              }}>
                <strong>Demo Login:</strong> Use <code style={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit' }}>demo@demo.com</code> with password <code style={{ color: theme.palette.mode === 'dark' ? 'white' : 'inherit' }}>demo</code>
              </Typography>
            </Box>
            
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300',
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'grey.500' : 'grey.400',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '& input': {
                    color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.700',
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300',
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.mode === 'dark' ? 'grey.500' : 'grey.400',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '& input': {
                    color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.700',
                },
              }}
            />
            <Box sx={{ textAlign: 'left', width: '100%', mt: 1 }}>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2,
                backgroundColor: theme.palette.mode === 'light' ? 'primary.dark' : 'primary.light',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' ? 'primary.main' : 'primary.dark',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            
            {/* Success message below login button */}
            {loginSuccess && (
              <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
                {loginSuccess}
              </Alert>
            )}
            
            {/* Error message below login button */}
            {loginError && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {loginError}
              </Alert>
            )}
            
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" component="span">
                    {"Don't have an account? "}
                </Typography>
                <Link href="/auth/register" variant="body2">
                    {"Register"}
                </Link>
            </Box>
            </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
} 