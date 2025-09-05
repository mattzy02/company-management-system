'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Button,
  Toolbar,
  TextField,
  InputAdornment,
  TableSortLabel,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  OutlinedInput,
  SelectChangeEvent,
  Divider,
  InputLabel,
  Card,
  Container,
  Avatar,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import UserModal, { User } from './UserModal';
import ConfirmationDialog from './ConfirmationDialog';
import { userService } from '../../services/userService';
import { useState, useEffect } from 'react';

type Order = 'asc' | 'desc';

function getComparator<T>(
  order: Order,
  orderBy: keyof T,
): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
    : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
}

function applySortFilter<T extends { [key: string]: any }>({
  array,
  comparator,
  filterName,
  filterRole,
  showDemoUsers,
}: {
  array: T[];
  comparator: (a: T, b: T) => number;
  filterName: string;
  filterRole: string;
  showDemoUsers: boolean;
}) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredUsers = stabilizedThis.map((el) => el[0]);

  // Filter out demo users if showDemoUsers is false
  if (!showDemoUsers) {
    filteredUsers = filteredUsers.filter((user) => user.email !== 'demo@demo.com');
  }

  if (filterName) {
    filteredUsers = filteredUsers.filter(
      (user) => user.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterRole && filterRole !== 'All') {
    filteredUsers = filteredUsers.filter((user) => user.role === filterRole);
  }

  return filteredUsers;
}


const initialUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', phone: '+1 (555) 123-4567', role: 'Admin', status: 'Active', address: '123 Main Street', country: 'United States' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+1 (555) 234-5678', role: 'User', status: 'Active', address: '456 Oak Avenue', country: 'Canada' },
  { id: 3, name: 'Sam Wilson', email: 'sam.wilson@example.com', phone: '+1 (555) 345-6789', role: 'User', status: 'Inactive', address: '789 Pine Road', country: 'United Kingdom' },
  { id: 4, name: 'Alice Johnson', email: 'alice.j@example.com', phone: '+1 (555) 456-7890', role: 'Manager', status: 'Active', address: '321 Elm Street', country: 'Australia' },
  { id: 5, name: 'Michael Brown', email: 'michael.b@example.com', phone: '+1 (555) 567-8901', role: 'User', status: 'Active', address: '654 Maple Drive', country: 'Germany' },
  { id: 6, name: 'Emily Davis', email: 'emily.d@example.com', phone: '+1 (555) 678-9012', role: 'User', status: 'Inactive', address: '987 Cedar Lane', country: 'France' },
  { id: 7, name: 'David Garcia', email: 'david.g@example.com', phone: '+1 (555) 789-0123', role: 'Manager', status: 'Active', address: '147 Birch Way', country: 'Spain' },
  { id: 8, name: 'Sarah Miller', email: 'sarah.m@example.com', phone: '+1 (555) 890-1234', role: 'Admin', status: 'Active', address: '258 Willow Court', country: 'Italy' },
  { id: 9, name: 'James Rodriguez', email: 'james.r@example.com', phone: '+1 (555) 901-2345', role: 'User', status: 'Active', address: '369 Spruce Place', country: 'Netherlands' },
  { id: 10, name: 'Jessica Martinez', email: 'jessica.m@example.com', phone: '+1 (555) 012-3456', role: 'User', status: 'Inactive', address: '741 Aspen Circle', country: 'Sweden' },
  { id: 11, name: 'Christopher Hernandez', email: 'chris.h@example.com', phone: '+1 (555) 123-4567', role: 'Manager', status: 'Active', address: '852 Poplar Square', country: 'Norway' },
  { id: 12, name: 'Ashley Lopez', email: 'ashley.l@example.com', phone: '+1 (555) 234-5678', role: 'User', status: 'Active', address: '963 Sycamore Terrace', country: 'Denmark' },
  { id: 13, name: 'Matthew Gonzalez', email: 'matt.g@example.com', phone: '+1 (555) 345-6789', role: 'User', status: 'Inactive', address: '159 Magnolia Boulevard', country: 'Finland' },
  { id: 14, name: 'Amanda Perez', email: 'amanda.p@example.com', phone: '+1 (555) 456-7890', role: 'Admin', status: 'Active', address: '357 Dogwood Parkway', country: 'Switzerland' },
  { id: 15, name: 'Joshua Sanchez', email: 'josh.s@example.com', phone: '+1 (555) 567-8901', role: 'User', status: 'Active', address: '486 Redwood Highway', country: 'Austria' },
  { id: 16, name: 'Megan Taylor', email: 'megan.t@example.com', phone: '+1 (555) 678-9012', role: 'User', status: 'Inactive', address: '792 Sequoia Expressway', country: 'Belgium' },
  { id: 17, name: 'Andrew Thomas', email: 'drew.t@example.com', phone: '+1 (555) 789-0123', role: 'Manager', status: 'Active', address: '135 Cypress Freeway', country: 'Portugal' },
  { id: 18, name: 'Olivia Moore', email: 'olivia.m@example.com', phone: '+1 (555) 890-1234', role: 'User', status: 'Active', address: '741 Maple Street', country: 'Ireland' },
  { id: 19, name: 'Brandon Jackson', email: 'brandon.j@example.com', phone: '+1 (555) 901-2345', role: 'User', status: 'Inactive', address: '852 Oak Drive', country: 'Poland' },
  { id: 20, name: 'Lauren White', email: 'lauren.w@example.com', phone: '+1 (555) 012-3456', role: 'Admin', status: 'Active', address: '963 Pine Avenue', country: 'Czech Republic' },
  { id: 21, name: 'Justin Harris', email: 'justin.h@example.com', phone: '+1 (555) 654-3210', role: 'User', status: 'Active', address: '159 Elm Road', country: 'Hungary' },
  { id: 22, name: 'Kimberly Clark', email: 'kim.c@example.com', phone: '+1 (555) 765-4321', role: 'User', status: 'Inactive', address: '357 Cedar Lane', country: 'Romania' },
  { id: 23, name: 'Ryan Lewis', email: 'ryan.l@example.com', phone: '+1 (555) 876-5432', role: 'Manager', status: 'Active', address: '486 Birch Way', country: 'Bulgaria' },
  { id: 24, name: 'Stephanie Walker', email: 'steph.w@example.com', phone: '+1 (555) 987-6543', role: 'User', status: 'Active', address: '792 Willow Court', country: 'Croatia' },
];

const TABLE_HEAD = [
    { id: 'name', label: 'Name', alignRight: false },
    { id: 'email', label: 'Email', alignRight: false },
    { id: 'phone', label: 'Phone', alignRight: false },
    { id: 'role', label: 'Role', alignRight: false },
    { id: 'status', label: 'Status', alignRight: false },
    { id: '' },
];


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof User>('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showDemoUsers, setShowDemoUsers] = useState(true);

  // Load users from backend on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const usersData = await userService.getUsers();
        setUsers(usersData);
      } catch (err) {
        setError('Failed to load users. Please try again.');
        // Fallback to initial users if backend fails
        setUsers(initialUsers);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleOpenModal = (user: User | null) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  const handleSaveUser = async (userToSave: User) => {
    try {
      if (userToSave.id) {
        // Update existing user via backend API
        const updatedUser = await userService.updateUser(userToSave.id, userToSave);
        setUsers(users.map((user) => (user.id === userToSave.id ? updatedUser : user)));
      } else {
        // Create new user via backend API
        const newUser = await userService.createUser({
          name: userToSave.name,
          email: userToSave.email,
          password: 'defaultPassword123', // Default password for new users
        });
        setUsers([...users, newUser]);
      }
      handleCloseModal();
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  };

  const handleDeleteRequest = (user: User) => {
    // Prevent deletion of demo user
    if (user.email === 'demo@demo.com') {
      return;
    }
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        // Delete user via backend API
        await userService.deleteUser(userToDelete.id!);
        setUsers(users.filter((user) => user.id !== userToDelete.id));
      } catch (error) {
        console.error('Failed to delete user:', error);
        // You might want to show an error message to the user here
      }
    }
    setConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof User) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };
  
  const handleFilterByRole = (event: SelectChangeEvent<string>) => {
    setFilterRole(event.target.value);
  };

  const dataFiltered = applySortFilter({
    array: users,
    comparator: getComparator(order, orderBy),
    filterName,
    filterRole,
    showDemoUsers,
  });

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;
  const isNotFound = !dataFiltered.length && !!filterName;
  
  const roleOptions = ['All', ...Array.from(new Set(users.map((user) => user.role)))];

  return (
    <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
            <Typography variant="h4" gutterBottom>
                Users
            </Typography>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal(null)}
                sx={{ borderRadius: '10px', textTransform: 'none' }}
            >
                Add User
            </Button>
        </Box>

        {/* Error Alert */}
        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        )}

        {/* Loading State */}
        {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        )}

        {/* Users Table */}
        {!loading && (
            <Card sx={{ borderRadius: '16px' }}>
                <Toolbar sx={{
                    height: 96,
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: (theme) => theme.spacing(0, 1, 0, 3),
                }}>
                    <FormControl sx={{ flex: '1 1 auto', minWidth: '240px', mr: 2 }}>
                        <OutlinedInput
                            value={filterName}
                            onChange={handleFilterByName}
                            placeholder="Search user..."
                            startAdornment={
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                            }
                        />
                    </FormControl>

                    <FormControl sx={{ flex: '1 1 auto', width: 'auto', minWidth: '120px' }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={filterRole}
                            onChange={handleFilterByRole}
                            input={<OutlinedInput label="Role" />}
                        >
                            <MenuItem value="All">
                                All
                            </MenuItem>
                            {roleOptions.filter(r => r !== 'All').map((role) => (
                                <MenuItem key={role} value={role}>{role}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={showDemoUsers}
                                onChange={(e) => setShowDemoUsers(e.target.checked)}
                                color="warning"
                            />
                        }
                        label="Demo Users"
                        sx={{ ml: 2 }}
                    />
                </Toolbar>
                <Divider />
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                     <TableRow>
                        {TABLE_HEAD.map((headCell, index) => (
                            <TableCell
                            key={headCell.id}
                            align={headCell.alignRight ? 'right' : 'left'}
                            sortDirection={orderBy === headCell.id ? order : false}
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                ...(index === 0 && { pl: '48px' }),
                            }}
                            >
                            {headCell.id ? (
                                <TableSortLabel
                                hideSortIcon
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={(event) => handleRequestSort(event, headCell.id as keyof User)}
                                >
                                {headCell.label}
                                </TableSortLabel>
                            ) : (
                                headCell.label
                            )}
                            </TableCell>
                        ))}
                     </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                      <TableRow hover key={user.id}>
                        <TableCell component="th" scope="row" sx={{ pl: '48px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              fontSize: '0.875rem',
                              bgcolor: user.email === 'demo@demo.com' ? 'warning.main' : 'primary.main' 
                            }}>
                              {user.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" noWrap>
                                {user.name}
                              </Typography>
                              {user.email === 'demo@demo.com' && (
                                <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                                  Demo User
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.status}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpenModal(user)} color="primary">
                            <EditIcon />
                          </IconButton>
                          {/* Hide delete button for demo user */}
                          {user.email !== 'demo@demo.com' && (
                            <IconButton onClick={() => handleDeleteRequest(user)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                  {isNotFound && (
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                          <Paper sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" paragraph>
                              Not found
                            </Typography>
                            <Typography variant="body2">
                              No results found for &nbsp;
                              <strong>&quot;{filterName}&quot;</strong>.
                              <br /> Try checking for typos or using complete words.
                            </Typography>
                          </Paper>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
              <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={dataFiltered.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>
        )}
            <UserModal
              open={modalOpen}
              onClose={handleCloseModal}
              user={selectedUser}
              onSave={handleSaveUser}
            />
            <ConfirmationDialog
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={handleConfirmDelete}
              title="Confirm Deletion"
              message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
            />
        </Container>
  );
} 