'use client'

import * as React from 'react';
import {
  Box,
  Typography,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Business,
  AttachMoney,
  Public,
  People,
} from '@mui/icons-material';
import CompanyBarChart from './components/CompanyBarChart';
import DataCard from './components/DataCard';
import DonutChart from './components/DonutChart';
import LineChart from './components/LineChart';
import { apiService } from '../services/api';
import { Company, ApiCompany, ChartDataPoint, LineChartDataPoint } from '../../types';

/**
 * Dashboard page component
 * 
 * Displays overview statistics and charts for companies and users
 * Fetches data from the API and presents it in various visualizations
 */

export default function DashboardPage() {
  // Get Material-UI theme for consistent styling
  const theme = useTheme();
  
  // State management for component data
  const [apiData, setApiData] = React.useState<ApiCompany[]>([]); // Raw API data
  const [loading, setLoading] = React.useState(true); // Loading state for UI feedback
  const [error, setError] = React.useState<string | null>(null); // Error state for error handling

  // Fetch data from API
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const companies = await apiService.getCompanies();
        setApiData(companies as any);
        setError(null);
      } catch (err) {
        setError('Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert API data to standardized frontend format
  // Transform backend snake_case to frontend camelCase and handle null values
  const convertedCompanies: Company[] = apiData.map(company => ({
    id: company.company_code, // Use company_code as unique identifier
    name: company.company_name, // Company display name
    level: company.level || 1, // Default to level 1 if not specified
    country: company.country || 'Unknown', // Handle missing country data
    city: company.city || 'Unknown', // Handle missing city data
    foundedYear: company.year_founded ? parseInt(company.year_founded) : 2020, // Parse year string to number
    annualRevenue: company.annual_revenue ? parseInt(String(company.annual_revenue)) : 0, // Ensure revenue is a number
    employees: company.employees || 0, // Default to 0 employees if not specified
  }));

  // Calculate key business metrics for dashboard cards
  const companyCount = convertedCompanies.length; // Total number of companies
  
  // Sum all company revenues for total revenue metric
  const totalRevenue = convertedCompanies.reduce((sum, company) => {
    const revenue = company.annualRevenue || 0;
    return sum + revenue;
  }, 0);
  
  // Count unique countries for global presence metric
  const uniqueCountries = new Set(convertedCompanies.map(company => company.country)).size;
  
  // Sum all employees across all companies
  const totalEmployees = convertedCompanies.reduce((sum, company) => sum + (company.employees || 0), 0);
  
  // Prepare chart data

  // Prepare donut chart data with logarithmic scaling for better visualization
  // Count companies by hierarchy level
  const levelCounts = {
    'Level 1': convertedCompanies.filter(c => c.level === 1).length, // Top-level companies
    'Level 2': convertedCompanies.filter(c => c.level === 2).length, // Mid-level companies
    'Level 3': convertedCompanies.filter(c => c.level === 3).length, // Lower-level companies
    'Level 4': convertedCompanies.filter(c => c.level === 4).length, // Subsidiary companies
  };
  
  // Transform level counts into chart-ready data with logarithmic scaling
  // Logarithmic scaling helps visualize data with large differences in values
  const levelData = [
    { 
      label: 'Level 1', 
      value: Math.log(levelCounts['Level 1'] + 1), // +1 to avoid log(0)
      originalValue: levelCounts['Level 1'], // Keep original for tooltips
      color: theme.palette.primary.main // Use theme colors for consistency
    },
    { 
      label: 'Level 2', 
      value: Math.log(levelCounts['Level 2'] + 1), 
      originalValue: levelCounts['Level 2'], 
      color: theme.palette.secondary.main 
    },
    { 
      label: 'Level 3', 
      value: Math.log(levelCounts['Level 3'] + 1), 
      originalValue: levelCounts['Level 3'], 
      color: theme.palette.success.main 
    },
    { 
      label: 'Level 4', 
      value: Math.log(levelCounts['Level 4'] + 1), 
      originalValue: levelCounts['Level 4'], 
      color: theme.palette.warning.main 
    },
  ];

  // Prepare line chart data showing cumulative company growth over time
  // First, count companies founded in each year
  const yearData = convertedCompanies.reduce((acc, company) => {
    const year = company.foundedYear;
    acc[year] = (acc[year] || 0) + 1; // Increment count for this year
    return acc;
  }, {} as Record<number, number>); // Object mapping year -> count

  // Sort years chronologically and calculate cumulative totals
  const sortedYears = Object.keys(yearData).map(Number).sort((a, b) => a - b);
  
  // Transform into cumulative data points for line chart
  // Each point shows total companies founded up to that year
  const cumulativeData: LineChartDataPoint[] = sortedYears.map((year, index) => ({
    year, // X-axis: founding year
    count: sortedYears.slice(0, index + 1).reduce((sum, y) => sum + yearData[y], 0) // Y-axis: cumulative count
  }));

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error message if data fetching failed
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: '600px' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Main dashboard render - centered layout with responsive width
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', p: 3 }}>
      <Box sx={{ width: '60%', maxWidth: '1200px' }}>
        {/* Page title */}
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
          Dashboard Overview
        </Typography>

        {/* Key Performance Indicator Cards */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2, md: 3 }, // Responsive spacing
          mb: 4, 
          flexWrap: 'wrap', // Allow cards to wrap on smaller screens
          justifyContent: 'space-between'
        }}>
          {/* Company Count Card */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 18px)' }, // Responsive flex sizing
            minWidth: { xs: '100%', sm: '200px', md: '250px' } // Minimum widths for readability
          }}>
            <DataCard
              title="Total Companies"
              value={companyCount}
              icon={<Business sx={{ fontSize: 28 }} />}
              color={theme.palette.primary.main}
              subtitle="Active"
            />
          </Box>
          {/* Revenue Card */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 18px)' },
            minWidth: { xs: '100%', sm: '200px', md: '250px' }
          }}>
            <DataCard
              title="Total Revenue"
              value={(() => {
                // Convert to millions and format with safety check
                const revenueInMillions = totalRevenue / 1000000;
                return isFinite(revenueInMillions) ? `$${revenueInMillions.toFixed(1)}M` : '$0M';
              })()}
              icon={<AttachMoney sx={{ fontSize: 28 }} />}
              color={theme.palette.success.main}
              subtitle="Annual"
            />
          </Box>
          {/* Global Presence Card */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 18px)' },
            minWidth: { xs: '100%', sm: '200px', md: '250px' }
          }}>
            <DataCard
              title="Countries Covered"
              value={uniqueCountries}
              icon={<Public sx={{ fontSize: 28 }} />}
              color={theme.palette.info.main}
              subtitle="Global"
            />
          </Box>
          {/* Employee Count Card */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 18px)' },
            minWidth: { xs: '100%', sm: '200px', md: '250px' }
          }}>
            <DataCard
              title="Total Employees"
              value={totalEmployees.toLocaleString()} // Format number with commas
              icon={<People sx={{ fontSize: 28 }} />}
              color={theme.palette.warning.main}
              subtitle="Worldwide"
            />
          </Box>
        </Box>

        {/* Data Visualization Charts Section */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 3, md: 4 }, // Responsive gaps between charts
          mb: 4, 
          flexWrap: 'wrap', // Allow charts to wrap on smaller screens
          justifyContent: 'space-between',
          minHeight: '450px' // Ensure consistent height for chart container
        }}>
          {/* Line Chart - Company Growth Over Time */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 calc(60% - 16px)' }, // Take 60% width on desktop
            minWidth: { xs: '100%', md: '500px' }, // Minimum width for readability
          }}>
            <LineChart 
              data={cumulativeData} 
              width="100%" 
              height={400} 
            />
          </Box>
          {/* Donut Chart - Company Level Distribution */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 calc(40% - 16px)' }, // Take 40% width on desktop
            minWidth: { xs: '100%', md: '300px' }, // Minimum width for readability
          }}>
            <DonutChart 
              data={levelData} 
              width="100%" 
              height={400} 
            />
          </Box>
        </Box>

        {/* Interactive Company Analysis Chart */}
        <Box sx={{ mb: 4 }}>
          <CompanyBarChart 
            data={convertedCompanies} 
            width="100%" 
            height={800} 
          />
        </Box>
      </Box>
    </Box>
  );
} 