'use client';

import * as React from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Collapse,
  IconButton,
  Chip,
  OutlinedInput,
  InputAdornment,
  Paper,
  Divider,
  Grid,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';
import { useTheme } from '@mui/material/styles';
import { green, yellow, red } from '@mui/material/colors';
import CompanyModal, { Company } from './CompanyModal';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ConfirmationDialog from './ConfirmationDialog';
import { apiService, Company as ApiCompany } from '../../services/api';

// ----------------------------------------------------------------------

// Transform API company data to frontend format
function transformApiCompany(apiCompany: ApiCompany): Company {
  return {
    id: apiCompany.company_code ?? '',
    name: apiCompany.company_name ?? '',
    level: apiCompany.level ?? 0,
    country: apiCompany.country ?? '',
    city: apiCompany.city ?? '',
    foundedYear: apiCompany.year_founded ?? 0,
    annualRevenue: apiCompany.annual_revenue ?? 0,
    employees: apiCompany.employees ?? 0,
  };
}

// Transform frontend company data to API format
function transformToApiCompany(company: Company): Omit<ApiCompany, 'id'> {
  return {
    company_code: company.id,
    company_name: company.name,
    level: company.level,
    country: company.country,
    city: company.city,
    year_founded: company.foundedYear,
    annual_revenue: company.annualRevenue,
    employees: company.employees,
  };
}

// table sorting utilities for descending order
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// order type for sorting
type Order = 'asc' | 'desc';

// comparator function for sorting the table 
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  // return descending comparator if order is desc, otherwise return ascending comparator
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// stable sort function for sorting the table
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    // if order is not 0, return order
    if (order !== 0) {
      return order;
    }
    // if order is 0, return the difference between the indices
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// sortable company keys
type SortableCompanyKey = 'name' | 'level' | 'country';

// interface for table header cell configuration
interface HeadCell {
  id: SortableCompanyKey | 'profitability' | null;  // Column identifier
  label: string;                                     // Display text for column header
  numeric: boolean;                                  // Whether column contains numeric data
  align?: 'left' | 'right' | 'center';              // Text alignment
  alignRight?: boolean;                              // Legacy alignment property
  disablePadding?: boolean;                          // Whether to disable cell padding
}

// table header configuration 
const headCells: readonly HeadCell[] = [
  { id: 'name', numeric: false, label: 'Company Name' },
  { id: 'level', numeric: true, label: 'Level' },
  { id: 'country', numeric: false, label: 'Country' },
  { id: 'profitability', numeric: true, label: 'Profitability' },
  { id: null, numeric: false, label: 'Actions', align: 'center' },
  { id: null, numeric: false, label: '', disablePadding: true },
];

// props interface for the enhanced table head component
interface EnhancedTableProps {
  // sort handler for a specific column
  onRequestSort: (event: React.MouseEvent<unknown>, property: SortableCompanyKey | 'profitability') => void;
  // order of the table
  order: Order;
  // property to sort by
  orderBy: string;
}

// enhanced table head component
function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  
  // create sort handler for a specific column
  const createSortHandler =
    (property: SortableCompanyKey | 'profitability') => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell, index) => (
          // table cell for the header
          <TableCell
            key={headCell.id || `header-cell-${index}`}
            align={headCell.align ? headCell.align : headCell.alignRight ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              fontWeight: 'bold',
              fontSize: '1.2rem',
              ...(index === 0 && { pl: '48px' }), // Add padding for first column
            }}
          >
            {headCell.id ? (
              // table sort label for the header
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {/* screen reader text for sort direction */}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={{
                    border: 0,
                    clip: 'rect(0 0 0 0)',
                    height: 1,
                    m: -1,
                    overflow: 'hidden',
                    padding: 0,
                    position: 'absolute',
                    top: 20,
                    width: 1,
                  }}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// table row component (company data with expandable row of company details and action buttons)
function Row(props: { row: Company; onEdit: (company: Company) => void; onDelete: (company: Company) => void; companies: Company[]; }) {
    // props for the table row component
    const { row, onEdit, onDelete, companies } = props;
    // state for the expandable row
    const [open, setOpen] = React.useState(false);
    // theme for the profitability chip
    const theme = useTheme();
    const profitability = getProfitability(row);

    return (
        <React.Fragment>
            {/* Main table row with company data */}
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                {/* name */}
                <TableCell component="th" scope="row" sx={{ pl: '48px' }}>
                    {row.name}
                </TableCell>
                {/* level */}
                <TableCell align="left">{row.level}</TableCell>
                {/* country */}
                <TableCell align="left">{row.country}</TableCell>
                {/* profitability chip with color based on profitability */}
                <TableCell align="left">
                    <Chip 
                        label={`$${profitability.toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`}
                        sx={{
                            bgcolor: getProfitabilityColor(profitability, theme.palette.mode, companies),
                            color: theme.palette.getContrastText(getProfitabilityColor(profitability, theme.palette.mode, companies)),
                            fontWeight: 'bold',
                        }}
                    />
                </TableCell>

                {/* action buttons - edit and delete */}
                <TableCell align="center">
                    <IconButton onClick={() => onEdit(row)} color="primary">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(row)} color="error">
                        <DeleteIcon />
                    </IconButton>
                </TableCell>
                {/* Expand/collapse toggle button */}
                <TableCell align="right">
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
            </TableRow>

            {/* the expandable row with additional company details */}
            <TableRow>
                <TableCell sx={{ p: 0, borderTop: 'none' }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2 }}>
                            <Stack spacing={2}>
                                {/* Detail headers */}
                                <Stack direction="row" spacing={2} justifyContent="center">
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flexBasis: '25%', textAlign: 'center' }}>City:</Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flexBasis: '25%', textAlign: 'center' }}>Founded Year:</Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flexBasis: '25%', textAlign: 'center' }}>Annual Revenue:</Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flexBasis: '25%', textAlign: 'center' }}>Employees:</Typography>
                                </Stack>
                                {/* Detail values */}
                                <Stack direction="row" spacing={2} justifyContent="center">
                                    <Typography variant="body2" sx={{ flexBasis: '25%', textAlign: 'center' }}>{row.city}</Typography>
                                    <Typography variant="body2" sx={{ flexBasis: '25%', textAlign: 'center' }}>{row.foundedYear}</Typography>
                                    <Typography variant="body2" sx={{ flexBasis: '25%', textAlign: 'center' }}>${row.annualRevenue.toLocaleString()}</Typography>
                                    <Typography variant="body2" sx={{ flexBasis: '25%', textAlign: 'center' }}>{row.employees.toLocaleString()}</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

// profitability calculation function for a company 总收入/员工数
const getProfitability = (company: Company) => {
    if (!company || company.employees === 0) return 0;
    return company.annualRevenue / company.employees;
};

// color for profitability chip based on relative performance
const getProfitabilityColor = (profitability: number, themeMode: 'light' | 'dark', companies: Company[]) => {
    const isLight = themeMode === 'light';
    
    // get percentiles from actual data to determine relative performance
    const profitabilities = companies
        .filter(c => c.employees > 0)
        .map(c => c.annualRevenue / c.employees)
        .sort((a, b) => a - b);
    
    // if no companies, return red
    if (profitabilities.length === 0) {
        return isLight ? red[200] : red[800];
    }
    
    // get 33rd and 67th percentiles for color thresholds
    const top33Index = Math.floor(profitabilities.length * 0.67);
    const bottom33Index = Math.floor(profitabilities.length * 0.33);
    
    // get thresholds
    const top33Threshold = profitabilities[top33Index];
    const bottom33Threshold = profitabilities[bottom33Index];
    
    // return color based on percentile performance
    if (profitability >= top33Threshold) {
        return isLight ? green[200] : green[900]; // Top 33% - Green
    }
    if (profitability >= bottom33Threshold) {
        return isLight ? yellow[200] : yellow[900]; // Middle 33% - Yellow
    }
    return isLight ? red[200] : red[800]; // Bottom 33% - Red
}


// company page component
export default function CompanyPage() {
  // table state management - sorting, pagination, filters
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<SortableCompanyKey | 'profitability'>('name');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  
  // filter state management - name, level, country
  const [filterName, setFilterName] = React.useState('');
  const [filterLevel, setFilterLevel] = React.useState<string>('all');
  const [filterCountry, setFilterCountry] = React.useState<string>('all');
  
  // modal and confirmation state - create/edit company modal, delete confirmation
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);
  const [isConfirmOpen, setConfirmOpen] = React.useState(false);
  const [companyToDelete, setCompanyToDelete] = React.useState<Company | null>(null);
  
  // data state management - companies list, loading, error states
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const theme = useTheme();

  // fetch companies from API on component mount
  React.useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiCompanies = await apiService.getCompanies();
        const transformedCompanies = apiCompanies.map(transformApiCompany);
        setCompanies(transformedCompanies);
      } catch (err) {
        setError('Failed to load companies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);


  // ------------------------------------------------------------------------------------------------
  // event handlers - handle user interactions and state updates

  // table column sorting
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: SortableCompanyKey | 'profitability'
  ) => {
    // toggle sort order
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // pagination page changes
  const handleChangePage = (event: unknown, newPage: number) => {
    // change the current page
    setPage(newPage);
  };

  // rows per page changes
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    // update page size and reset to first page
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // name filter input changes
  const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };
  // level filter dropdown changes
  const handleFilterByLevel = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterLevel(event.target.value as string);
  };
  // country filter dropdown changes
  const handleFilterByCountry = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterCountry(event.target.value as string);
  };


  // open the company modal for editing or creating
  const handleOpenModal = (company: Company | null) => {
    setEditingCompany(company);
    setModalOpen(true);
  };
  // close the company modal and reset editing state
  const handleCloseModal = () => {
    setEditingCompany(null);
    setModalOpen(false);
  };

  // initiate company deletion process
  const handleDeleteRequest = (company: Company) => {
    setCompanyToDelete(company);
    setConfirmOpen(true);
  };
  // confirm and execute company deletion
  const handleConfirmDelete = async () => {
    if (companyToDelete && companyToDelete.id) {
      try {
        // delete company via API
        await apiService.deleteCompany(companyToDelete.id);
        // refresh companies list after successful deletion
        const apiCompanies = await apiService.getCompanies();
        const transformedCompanies = apiCompanies.map(transformApiCompany);
        setCompanies(transformedCompanies);
      } catch (err) {
        setError('Failed to delete company. Please try again.');
      }
    }
    // close confirmation dialog and reset company to delete
    setConfirmOpen(false);
    setCompanyToDelete(null);
  };

  // save company data (create or update)
  const handleSaveCompany = async (company: Company) => {
    try {
      if (company.id) {
        // update existing company
        await apiService.updateCompany(company.id, transformToApiCompany(company));
      } else {
        // create new company
        await apiService.createCompany(transformToApiCompany(company));
      }
      
      // refresh companies list after successful save
      const apiCompanies = await apiService.getCompanies();
      const transformedCompanies = apiCompanies.map(transformApiCompany);
      setCompanies(transformedCompanies);
      handleCloseModal();
    } catch (err) {
      setError('Failed to save company. Please try again.');
    }
  };


  // ------------------------------------------------------------------------------------------------
  // data processing and filtering

  // get country options for filter dropdown - all and unique countries
  const countryOptions = React.useMemo(() => {
    const countries = [...new Set(companies.map(c => c.country))];
    return ['all', ...countries];
  }, [companies]);

  // filter companies based on current filter criteria - name, level, country
  const filteredCompanies = companies.filter((company) => {
    const nameMatch = company.name.toLowerCase().includes(filterName.toLowerCase());
    const levelMatch = filterLevel === 'all' || company.level === Number(filterLevel);
    const countryMatch = filterCountry === 'all' || company.country === filterCountry;
    return nameMatch && levelMatch && countryMatch;
  });

  // sort filtered companies based on current sort criteria
  const sortedAndFilteredCompanies = React.useMemo(() => {
    // comparator for sorting
    const comparator = (a: Company, b: Company) => {
        if (orderBy === 'profitability') {
          // get profitability for each company
          const aProfit = getProfitability(a);
          const bProfit = getProfitability(b);
          // return the difference between the two companies' profitability
          return order === 'asc' ? aProfit - bProfit : bProfit - aProfit;
        }
        // return the difference between the two companies' other fields
        return getComparator(order, orderBy as SortableCompanyKey)(a, b);
    };
    // sort the filtered companies
    return stableSort(filteredCompanies, comparator);
  }, [order, orderBy, filteredCompanies]);

  // Calculate empty rows for pagination display
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sortedAndFilteredCompanies.length) : 0;

  // Check if no results found for current search
  const isNotFound = !sortedAndFilteredCompanies.length && !!filterName;

  return (
    <>
      <Head>
        <title>Companies | Management</title>
      </Head>
      <Container maxWidth="lg">
        {/* Page Header with Add Company Button on the right */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Companies
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal(null)}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            Add Company
          </Button>
        </Stack>

        {/* Card for the main content */}
        <Card sx={{ borderRadius: '16px', mb: 3 }}>
              {/* alerts for loading and error states */}
              {/* Loading State - show a loading spinner */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              )}
              {/* Error State - show an error message */}
              {error && (
                <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <Typography variant="body2">{error}</Typography>
                </Box>
              )}
              
              {/* Main Content - the table and the modal */}
              {!loading && !error && (
                <>
                {/* filter dropdown and search input bar */}
                <Toolbar sx={{
                    height: 96,
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: (theme) => theme.spacing(0, 1, 0, 3),
                }}>
              {/* Search Input */}
              <FormControl sx={{ flex: 1, mr: 2 }}>
                  <OutlinedInput
                      value={filterName}
                      onChange={handleFilterByName}
                      placeholder="Search company..."
                      startAdornment={
                      <InputAdornment position="start">
                          <SearchIcon />
                      </InputAdornment>
                      }
                  />
              </FormControl>

              {/* Level Filter Dropdown */}
              <FormControl sx={{ width: 160, mr: 2 }}>
                  <InputLabel id="level-filter-label">Level</InputLabel>
                  <Select
                      labelId="level-filter-label"
                      value={filterLevel}
                      onChange={handleFilterByLevel as any}
                      label="Level"
                  >
                      <MenuItem value="all">All</MenuItem>
                      
                      <MenuItem value="1">Level 1</MenuItem>
                      <MenuItem value="2">Level 2</MenuItem>
                      <MenuItem value="3">Level 3</MenuItem>
                      <MenuItem value="4">Level 4</MenuItem>
                  </Select>
              </FormControl>

              {/* Country Filter Dropdown */}
              <FormControl sx={{ width: 160 }}>
                  <InputLabel id="country-filter-label">Country</InputLabel>
                  <Select
                      labelId="country-filter-label"
                      value={filterCountry}
                      onChange={handleFilterByCountry as any}
                      label="Country"
                  >
                      <MenuItem value="all">All</MenuItem>
                      {/* all unique countries based on the companies list */}
                      {countryOptions.filter(c => c !== 'all').map(country => (
                          <MenuItem key={country} value={country}>{country}</MenuItem>
                      ))}
                  </Select>
              </FormControl>
            </Toolbar>
            <Divider />

            {/* Companies data table */}
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {/* Company Rows */}
                  {sortedAndFilteredCompanies
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <Row key={row.id} row={row} onEdit={handleOpenModal} onDelete={handleDeleteRequest} companies={companies} />
                    ))}
                  
                  {/* empty rows for pagination */}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                  
                  {/* no results found */}
                  {isNotFound && (
                      <TableRow>
                          <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                            <Paper sx={{ textAlign: 'center' }}>
                              {/* not found message */}
                              <Typography variant="h6" paragraph>Not found</Typography>
                              <Typography variant="body2">
                                  No results found for &nbsp;
                                  <strong>&quot;{filterName}&quot;</strong>.
                                  <br /> Try checking for typos or using complete words.
                              </Typography>
                            </Paper>
                          </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <TablePagination
              // 5, 10, 25 rows per page
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sortedAndFilteredCompanies.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            </>
          )}
          
          {/* Company Modal for Create/Edit */}
          <CompanyModal
            open={isModalOpen}
            // close the modal
            onClose={handleCloseModal}
            // save the company
            onSave={handleSaveCompany}
            // company data
            company={editingCompany}
          />
          
          {/* Confirmation Dialog for Delete */}
          <ConfirmationDialog
            open={isConfirmOpen}
            // close the confirmation dialog
            onClose={() => setConfirmOpen(false)}
            // confirm the deletion
            onConfirm={handleConfirmDelete}
            // title of the confirmation dialog
            title="Confirm Deletion"
            message={`Are you sure you want to delete ${companyToDelete?.name}? This action cannot be undone.`}
          />
        </Card>
      </Container>
    </>
  );
} 