'use client';

import * as React from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

export type User = {
  id: number | null;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  address?: string;
  country?: string;
};

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (user: User) => void;
  onDelete?: (userId: number) => void;
}

const emptyUser: User = { id: null, name: '', email: '', phone: '', role: 'User', status: 'Active', address: '', country: '' };

export default function UserModal({ open, onClose, user, onSave, onDelete }: UserModalProps) {
  const [formData, setFormData] = React.useState<User>(user || emptyUser);

  React.useEffect(() => {
    setFormData(user || emptyUser);
  }, [user, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleDelete = () => {
    if (onDelete && user?.id) {
      onDelete(user.id);
    }
  };

  const isEditMode = user !== null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
                 <Typography variant="h6" component="h2" sx={{ color: 'text.primary' }}>
           {isEditMode ? 'Edit User' : 'Add User'}
         </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              name="phone"
              label="Phone"
              value={formData.phone || ''}
              onChange={handleChange}
              margin="normal"
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl margin="normal">
              <InputLabel>Role</InputLabel>
              <Select name="role" value={formData.role} label="Role" onChange={handleSelectChange}>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
              </Select>
            </FormControl>
            <FormControl margin="normal">
              <InputLabel>Status</InputLabel>
              <Select name="status" value={formData.status} label="Status" onChange={handleSelectChange}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="country"
              label="Country"
              value={formData.country || ''}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              name="address"
              label="Address"
              value={formData.address || ''}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
              maxRows={4}
            />
          </Box>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
} 