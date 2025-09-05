'use client';

import * as React from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';

// modal style, center the modal in the viewport
const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

// company type
export type Company = {
  id: string | null;
  name: string;
  level: number;
  country: string;
  city: string;
  foundedYear: number;
  annualRevenue: number;
  employees: number;
};

// empty company
const emptyCompany: Company = { 
  id: null, 
  name: '', 
  level: 1, 
  country: '', 
  city: '', 
  foundedYear: new Date().getFullYear(), // Default to current year
  annualRevenue: 0, 
  employees: 0 
};

// company modal props
interface CompanyModalProps {
  open: boolean;               // controls modal visibility
  onClose: () => void;         // when modal should be closed
  company: Company | null;     // Company data to edit (null for new company)
  onSave: (company: Company) => void; // when company data is saved
}


// company modal for creating and editing company
export default function CompanyModal({ open, onClose, company, onSave }: CompanyModalProps) {
  const [formData, setFormData] = React.useState<Company>(company || emptyCompany);

  // update form data when company prop changes and reset form to empty company when creating new company
  React.useEffect(() => {
    setFormData(company || emptyCompany);
  }, [company, open]);

  // handle input field changes, automatically converts number inputs to numeric values and preserves other field types as strings
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({ 
        ...formData, 
        [name]: type === 'number' ? parseFloat(value) || 0 : value 
    });
  };

  // pass current form data to parent component when save button is clicked
  const handleSave = () => {
    onSave(formData);
  };

  // if we're in edit mode (company exists) or create mode (company is null) to display the correct title
  const isEditMode = company !== null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* Modal Header - title based on edit/create mode */}
        <Typography variant="h6" component="h2">
          {isEditMode ? 'Edit Company' : 'Add Company'}
        </Typography>

        {/* name field */}
        <TextField
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        {/* level field - numeric input for hierarchy level */}
        <TextField
          name="level"
          label="Level"
          type="number"
          value={formData.level}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        {/* country field */}
        <TextField
          name="country"
          label="Country"
          value={formData.country}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        {/* city field */}
        <TextField
          name="city"
          label="City"
          value={formData.city}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        {/* Founded Year Field - numeric input for year */}
        <TextField
          name="foundedYear"
          label="Founded Year"
          type="number"
          value={formData.foundedYear}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        {/* Annual Revenue Field - Numeric input for revenue */}
        <TextField
          name="annualRevenue"
          label="Annual Revenue"
          type="number"
          value={formData.annualRevenue}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        {/* Employees Field - Numeric input for employee count */}
        <TextField
          name="employees"
          label="Employees"
          type="number"
          value={formData.employees}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        {/* save button */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
} 