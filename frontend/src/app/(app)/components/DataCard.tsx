'use client'

/**
 * DataCard Component - Displays key performance indicators (KPIs)
 * 
 * A reusable card component for showing important metrics on the dashboard
 * Features gradient backgrounds, hover effects, and consistent styling
 * Used for displaying statistics like company count, revenue, etc.
 */

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
} from '@mui/material';

/**
 * Props interface for DataCard component
 */
interface DataCardProps {
  title: string; // Card title (e.g., "Total Companies")
  value: string | number; // Main value to display (e.g., "150" or "$2.5M")
  icon: React.ReactNode; // Icon to display (Material-UI icon component)
  color: string; // Theme color for gradients and accents
  subtitle?: string; // Optional subtitle (e.g., "Active", "Annual")
}

/**
 * DataCard Component Implementation
 * 
 * Renders a styled card with icon, title, value, and optional subtitle
 * Includes hover animations and responsive design
 */
export default function DataCard({ title, value, icon, color, subtitle }: DataCardProps) {
  return (
    <Card sx={{ 
      borderRadius: '16px', // Rounded corners for modern look
      height: '100%', // Full height for consistent card sizing
      // Subtle gradient background using the provided color
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}20`, // Subtle border with theme color
      transition: 'all 0.3s ease', // Smooth transitions for hover effects
      '&:hover': {
        transform: 'translateY(-4px)', // Lift effect on hover
        boxShadow: `0 8px 25px ${color}20`, // Enhanced shadow on hover
      }
    }}>
      {/* Card content with padding */}
      <CardContent sx={{ p: 3 }}>
        {/* Header row with icon and status chip */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          {/* Icon container with themed background */}
          <Box sx={{ 
            p: 1.5, // Padding around icon
            borderRadius: '12px', // Rounded icon container
            bgcolor: `${color}20`, // Light background with theme color
            color: color, // Icon color matches theme
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
          {/* Status chip (subtitle or "Live") */}
          <Chip 
            label={subtitle || 'Live'} 
            size="small" 
            sx={{ 
              bgcolor: `${color}15`, // Light chip background
              color: color, // Text color matches theme
              fontWeight: 'bold'
            }} 
          />
        </Stack>
        
        {/* Main value display - large and prominent */}
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
          {value}
        </Typography>
        
        {/* Card title - smaller, secondary text */}
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
} 