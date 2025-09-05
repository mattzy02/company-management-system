'use client';

import * as React from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  TextField,
  Typography,
  Avatar,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import { useUser } from '../../UserContext';

// Account management page
export default function AccountPage() {
  const theme = useTheme();
  const { user, logout, updateProfile, changePassword } = useUser();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  
  // Form data state management for profile information
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    country: user?.country || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Update form data when user changes state management for profile information
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        country: user.country || '',
      }));
    }
  }, [user]);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // save button click for profile information and password change
  const handleSave = async () => {
    // when save button is clicked, set loading
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update profile information using provided form data
      const profileUpdateSuccess = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        country: formData.country,
      });

      // if profile update fails, throw error
      if (!profileUpdateSuccess) {
        throw new Error('Failed to update profile information');
      }

      // Change password if attempting to change password
      if (formData.newPassword || formData.confirmPassword) {
        // if current password is not provided, throw error
        if (!formData.currentPassword) {
          throw new Error('Current password is required to change password');
        }
        // if new password and confirm password do not match, throw error
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        // change password using provided form data
        const passwordChangeSuccess = await changePassword(formData.currentPassword, formData.newPassword);
        // if password change fails, throw error
        if (!passwordChangeSuccess) {
          throw new Error('Failed to change password. Please check your current password.');
        }
      }
      
      // set success with message if successful
      setSuccess('Profile updated successfully!');
      
      // Clear password fields for password change section
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

    } catch (err) {
      // if error, set error with message
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {

      setLoading(false);
    }
  };

  // handle input change for profile information and password change
  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // if user not logged in, show error
  if (!user) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          Please log in first to access your account settings.
        </Alert>
      </Container>
    );
  }

  // account management page
  return (
    <>
      <Head>
        <title>Account Settings | Dashboard</title>
      </Head>

      {/* Container for account management page */}
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Stack spacing={1}>
            {/* Header */}
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Account Settings
            </Typography>
            {/* Description */}
            <Typography variant="body2" color="text.secondary">
              Manage your account information and security settings
            </Typography>
          </Stack>

          {/* Alerts */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Profile Information Card */}
          <Card sx={{ borderRadius: 3 }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, minHeight: 400 }}>
                {/* Left Column - Avatar and Basic Info */}
                <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 300px' }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stack spacing={3} alignItems="center">
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        fontSize: '3rem',
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      {user.avatar || user.name?.charAt(0) || 'U'}
                    </Avatar>
                    {/* Basic Info */}
                    <Box sx={{ textAlign: 'center' }}>
                      {/* Name */}
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {user.name}
                      </Typography>
                      {/* Email */}
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Right Column - Editable Fields */}
                <Box sx={{ flex: 1, maxWidth: { md: '60%' } }}>
                  <Stack spacing={3}>
                     <Box>
                       <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                         Personal Information
                       </Typography>
                       {/* All editable fields */}
                       <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          {/* first column - full name and phone number */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                              label="Full Name"
                              value={formData.name}
                              onChange={handleInputChange('name')}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& input': {
                                    color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                                  },
                                },
                              }}
                            />
                            
                            <TextField
                              label="Phone Number"
                              value={formData.phone}
                              onChange={handleInputChange('phone')}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& input': {
                                    color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                                  },
                                },
                              }}
                            />
                          </Box>
                          
                          {/* second column - address and country */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                              label="Address"
                              value={formData.address}
                              onChange={handleInputChange('address')}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& input': {
                                    color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                                  },
                                },
                              }}
                            />
                            
                            <TextField
                              label="Country"
                              value={formData.country}
                              onChange={handleInputChange('country')}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '& input': {
                                    color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                                  },
                                },
                              }}
                            />
                          </Box>
                        </Box>
                     </Box>

                    <Divider />

                    {/* Password Change Section */}
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Change Password
                      </Typography>
                      <Stack spacing={3}>
                        {/* Current Password */}
                        <FormControl fullWidth>
                           <InputLabel>Current Password</InputLabel>
                           <OutlinedInput
                             type={showCurrentPassword ? 'text' : 'password'}
                             value={formData.currentPassword}
                             onChange={handleInputChange('currentPassword')}
                             label="Current Password"
                             startAdornment={
                               <InputAdornment position="start">
                                 <LockIcon color="action" />
                               </InputAdornment>
                             }
                             endAdornment={
                               <InputAdornment position="end">
                                 <IconButton
                                   onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                   edge="end"
                                 >
                                   {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                 </IconButton>
                               </InputAdornment>
                             }
                             sx={{
                               '& input': {
                                 color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                               },
                             }}
                           />
                         </FormControl>

                        {/* New Password */}
                        <FormControl fullWidth>
                           <InputLabel>New Password</InputLabel>
                           <OutlinedInput
                             type={showNewPassword ? 'text' : 'password'}
                             value={formData.newPassword}
                             onChange={handleInputChange('newPassword')}
                             label="New Password"
                             startAdornment={
                               <InputAdornment position="start">
                                 <LockIcon color="action" />
                               </InputAdornment>
                             }
                             endAdornment={
                               <InputAdornment position="end">
                                 <IconButton
                                   onClick={() => setShowNewPassword(!showNewPassword)}
                                   edge="end"
                                 >
                                   {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                 </IconButton>
                               </InputAdornment>
                             }
                             sx={{
                               '& input': {
                                 color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                               },
                             }}
                           />
                         </FormControl>

                        {/* Confirm New Password */}
                        <FormControl fullWidth>
                           <InputLabel>Confirm New Password</InputLabel>
                           <OutlinedInput
                             type={showConfirmPassword ? 'text' : 'password'}
                             value={formData.confirmPassword}
                             onChange={handleInputChange('confirmPassword')}
                             label="Confirm New Password"
                             startAdornment={
                               <InputAdornment position="start">
                                 <LockIcon color="action" />
                               </InputAdornment>
                             }
                             endAdornment={
                               <InputAdornment position="end">
                                 <IconButton
                                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                   edge="end"
                                 >
                                   {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                 </IconButton>
                               </InputAdornment>
                             }
                             sx={{
                               '& input': {
                                 color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                               },
                             }}
                           />
                         </FormControl>
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Save Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                        size="large"
                        sx={{ borderRadius: 2, px: 4 }}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                    
                </Box>
              </Box>

                    
            </Box>
          </Card>
        </Stack>
      </Container>
    </>
  );
}
