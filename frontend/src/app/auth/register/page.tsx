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
import NextLink from 'next/link';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { Alert, CircularProgress } from '@mui/material';
import { userService } from '../../services/userService';
import { useUser } from '../../UserContext';

const defaultTheme = createTheme();

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const theme = useTheme();
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBlur = (field: 'name' | 'email' | 'password' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

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
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation is required';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    validate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, password, confirmPassword]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validate()) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      try {
        // Use the userService to create user (registers and adds to users table)
        await userService.createUser({
          name,
          email,
          password,
        });

        setSuccess('Registration successful! Logging you in...');
        
        // Auto-login the user after successful registration
        setTimeout(async () => {
          try {
            const loginSuccess = await login(email, password);
            if (loginSuccess) {
              router.push('/');
            } else {
              // If auto-login fails, redirect to login page
              setError('Registration successful but auto-login failed. Please login manually.');
              setTimeout(() => {
                router.push('/auth/login');
              }, 2000);
            }
          } catch (loginError) {
            setError('Registration successful but auto-login failed. Please login manually.');
            setTimeout(() => {
              router.push('/auth/login');
            }, 2000);
          }
        }, 1500);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
        setError(errorMessage);
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
            {/* Back button positioned at top-left of register box */}
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
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Register
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%', position: 'relative' }}>
            {/* Success and Error Alerts */}
            {success && (
              <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            <TextField
                margin="normal"
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
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
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
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
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                error={touched.confirmPassword && !!errors.confirmPassword}
                helperText={touched.confirmPassword && errors.confirmPassword}
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" component="span">
                    {"Already have an account? "}
                </Typography>
                <Link href="/auth/login" variant="body2">
                    {"Login"}
                </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
} 