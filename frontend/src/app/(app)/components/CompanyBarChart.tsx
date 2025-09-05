'use client'

import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Button,
  Chip,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ExpandMore,
  FilterList,
  BarChart,
  Close,
  BubbleChart,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { apiService, CompanyHierarchyNode } from '../../services/api';

// ----------------------------------------------------------------------

/**
 * Data interfaces and type definitions
 * Defines the structure for company data, chart data, and component props
 */

// company data structure
interface Company {
  id: string;           // unique identifier
  name: string;         // company name
  level: number;        // company hierarchy level (1-4)
  country: string;      // country where company is located
  city: string;         // city where company is located
  foundedYear: number;  // year the company was founded
  annualRevenue: number; // annual revenue in currency units
  employees: number;    // number of employees
}

// bar chart data structure for revenue analysis
interface BarChartData {
  dimension: string;    // category name (e.g., "Level 1", "USA", "New York")
  value: number;        // total revenue for this category
  count: number;        // number of companies in this category
}

// bubble chart data structure for hierarchy visualization
interface BubbleData {
  name: string;                    // display name
  children?: BubbleData[];         // child nodes for hierarchy
  company?: Company;               // company data if this is a leaf node
}

// filter state for data filtering
interface FilterState {
  level: number[];                 // selected company levels
  country: string[];               // selected countries
  city: string[];                  // selected cities
  foundedYear: {                   // founded year range
    start: number;
    end: number;
  };
  annualRevenue: {                 // revenue range
    min: number;
    max: number;
  };
  employees: {                     // employee count range
    min: number;
    max: number;
  };
}

// props for the main component
interface CompanyBarChartProps {
  data: Company[];                 // company data to display
  width?: number | string;         // chart width
  height?: number;                 // chart height
}

// props for tab panel component
interface TabPanelProps {
  children?: React.ReactNode;      // tab content
  index: number;                   // tab index
  value: number;                   // current active tab
}

// tab panel component for switching between bar chart and bubble chart
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Company Bar Chart Component
 * 
 * Dual-purpose component with two tabs:
 * 1. Bar Chart Tab - Revenue analysis by level, country, or city
 * 2. Bubble Chart Tab - Company hierarchy visualization
 * 
 * Features:
 * - Interactive filtering and sorting
 * - Responsive design with dynamic sizing
 * - Real-time data updates
 * - Pagination for large datasets
 */
export default function CompanyBarChart({ data, width = "100%", height = 500 }: CompanyBarChartProps) {
  // refs and theme
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();
  
  // tab state - 0 = bar chart, 1 = bubble chart
  const [tabValue, setTabValue] = useState(0);
  
  // chart configuration
  const [dimension, setDimension] = useState<string>('level'); // 'level', 'country', or 'city'
  
  // filter state for data filtering
  const [filters, setFilters] = useState<FilterState>({
    level: [],                    // selected company levels
    country: [],                  // selected countries
    city: [],                     // selected cities
    foundedYear: { start: 1990, end: 2024 },  // founded year range
    annualRevenue: { min: 0, max: 1000000000 }, // revenue range
    employees: { min: 0, max: 10000 },          // employee count range
  });
  
  // available filter options
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // pagination for city filter (when many cities)
  const [cityPage, setCityPage] = useState<number>(0);
  const citiesPerPage = 20;
  
  // chart data and configuration
  const [chartData, setChartData] = useState<BarChartData[]>([]);
  const [maxRevenue, setMaxRevenue] = useState<number>(2000000000);
  const [dynamicHeight, setDynamicHeight] = useState<number>(height);
  const [chartWidth, setChartWidth] = useState<number>(0);
  
  // bubble chart hierarchy data
  const [hierarchyData, setHierarchyData] = useState<CompanyHierarchyNode | null>(null);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);

  // ------------------------------------------------------------------------------------------------
  // effect hooks for chart responsiveness and data processing

  // update chart width on resize/zoom for responsive design
  useEffect(() => {
    const updateChartWidth = () => {
      if (svgRef.current) {
        const containerWidth = svgRef.current.clientWidth;
        setChartWidth(containerWidth);
      }
    };

    // set initial width
    updateChartWidth();

    // add resize observer for container size changes
    const resizeObserver = new ResizeObserver(updateChartWidth);
    if (svgRef.current) {
      resizeObserver.observe(svgRef.current);
    }

    // also listen for window resize (for browser zoom)
    window.addEventListener('resize', updateChartWidth);

    // cleanup listeners
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateChartWidth);
    };
  }, []);

  // extract unique values for filters and update ranges based on actual data
  useEffect(() => {
    // only update if data changes (avoid infinite loop)
    setAvailableCountries(prev => {
      const countries = [...new Set(data.map(c => c.country))].sort();
      return JSON.stringify(prev) !== JSON.stringify(countries) ? countries : prev;
    });
    setAvailableCities(prev => {
      const cities = [...new Set(data.map(c => c.city))].sort();
      return JSON.stringify(prev) !== JSON.stringify(cities) ? cities : prev;
    });

    // update filter ranges based on actual data
    if (data.length > 0) {
      const foundedYears = data.map(c => c.foundedYear).filter(y => y > 0);
      const revenues = data.map(c => c.annualRevenue).filter(r => r > 0);
      const employees = data.map(c => c.employees).filter(e => e > 0);
      
      // calculate min/max values from actual data
      const minFoundedYear = Math.min(...foundedYears);
      const maxFoundedYear = Math.max(...foundedYears);
      const minRevenue = Math.min(...revenues);
      const maxRevenue = Math.max(...revenues);
      const minEmployees = Math.min(...employees);
      const maxEmployees = Math.max(...employees);
      
      // update filter ranges to match actual data
      setFilters(prev => ({
        ...prev,
        foundedYear: {
          start: minFoundedYear,
          end: maxFoundedYear
        },
        annualRevenue: {
          min: 0,
          max: Math.ceil(maxRevenue / 100000) * 100000 // round up to nearest 100k
        },
        employees: {
          min: 0,
          max: Math.ceil(maxEmployees / 10) * 10 // round up to nearest 10
        }
      }));
    }
  }, [data]);

  // calculate max revenue per dimension for proper chart scaling
  useEffect(() => {
    if (data.length > 0) {
      let maxRev = 100000000;
      
      if (dimension === 'level') {
        // group by level and calculate total revenue per level
        const levelGroups = d3.group(data, d => d.level);
        const levelData = Array.from(levelGroups, ([level, companies]) => ({
          dimension: `Level ${level}`,
          value: companies.reduce((sum, c) => sum + c.annualRevenue, 0)
        }));
        maxRev = Math.max(...levelData.map(d => d.value), 100000000);
      } else if (dimension === 'country') {
        // group by country and calculate total revenue per country
        const countryGroups = d3.group(data, d => d.country);
        const countryData = Array.from(countryGroups, ([country, companies]) => ({
          dimension: country,
          value: companies.reduce((sum, c) => sum + c.annualRevenue, 0)
        }));
        maxRev = Math.max(...countryData.map(d => d.value), 50000000); // 50M max
      } else if (dimension === 'city') {
        // group by city and calculate total revenue per city
        const cityGroups = d3.group(data, d => d.city);
        const cityData = Array.from(cityGroups, ([city, companies]) => ({
          dimension: city,
          value: companies.reduce((sum, c) => sum + c.annualRevenue, 0)
        }));
        maxRev = Math.max(...cityData.map(d => d.value), 10000000); // 10M max
      }
      
      setMaxRevenue(maxRev);
    }
  }, [data, dimension]);

  // fetch hierarchy data for bubble chart from API
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setHierarchyLoading(true);
        // fetch company hierarchy starting from root company 'C0' with max depth 4
        const hierarchy = await apiService.getCompanyHierarchy({ company_code: 'C0', max_depth: 4 });
        setHierarchyData(hierarchy);
      } catch (error) {
        // handle error silently - bubble chart will show error state
      } finally {
        setHierarchyLoading(false);
      }
    };
    
    // load hierarchy data immediately when component mounts
    if (!hierarchyData && !hierarchyLoading) {
      fetchHierarchy();
    }
  }, [hierarchyData, hierarchyLoading]);

  // apply filters and generate chart data based on current filter criteria
  useEffect(() => {
    // filter companies based on all active filters
    let filteredData = data.filter(company => {
      // level filter - check if company level is in selected levels
      if (filters.level.length > 0 && !filters.level.includes(company.level)) {
        return false;
      }
      
      // country filter - check if company country is in selected countries
      if (filters.country.length > 0 && !filters.country.includes(company.country)) {
        return false;
      }
      
      // city filter - check if company city is in selected cities
      if (filters.city.length > 0 && !filters.city.includes(company.city)) {
        return false;
      }
      
      // founded year filter - check if company founded year is in range
      if (company.foundedYear < filters.foundedYear.start || company.foundedYear > filters.foundedYear.end) {
        return false;
      }
      
      // annual revenue filter - check if company revenue is in range
      if (company.annualRevenue < filters.annualRevenue.min || company.annualRevenue > filters.annualRevenue.max) {
        return false;
      }
      
      // employees filter - check if company employee count is in range
      if (company.employees < filters.employees.min || company.employees > filters.employees.max) {
        return false;
      }
      
      return true;
    });

    // generate chart data based on selected dimension (level, country, or city)
    let newChartData: BarChartData[] = [];
    
    if (dimension === 'level') {
      // group by company level and calculate total revenue per level
      const levelGroups = d3.group(filteredData, d => d.level);
      newChartData = Array.from(levelGroups, ([level, companies]) => ({
        dimension: `Level ${level}`,
        value: companies.reduce((sum, c) => sum + c.annualRevenue, 0),
        count: companies.length
      }));
    } else if (dimension === 'country') {
      // group by country and calculate total revenue per country
      const countryGroups = d3.group(filteredData, d => d.country);
      newChartData = Array.from(countryGroups, ([country, companies]) => ({
        dimension: country,
        value: companies.reduce((sum, c) => sum + c.annualRevenue, 0),
        count: companies.length
      }));
    } else if (dimension === 'city') {
      // group by city and calculate total revenue per city
      const cityGroups = d3.group(filteredData, d => d.city);
      newChartData = Array.from(cityGroups, ([city, companies]) => ({
        dimension: city,
        value: companies.reduce((sum, c) => sum + c.annualRevenue, 0),
        count: companies.length
      }));
    }

    // sort by revenue value descending (highest first)
    newChartData.sort((a, b) => b.value - a.value);
    
    // store total data length for pagination
    const totalDataLength = newChartData.length;
    
    // apply pagination for all dimensions when categories > 20
    if (totalDataLength > citiesPerPage) {
      const startIndex = cityPage * citiesPerPage;
      const endIndex = startIndex + citiesPerPage;
      newChartData = newChartData.slice(startIndex, endIndex);
    } else {
      // reset to page 0 if no pagination needed
      setCityPage(0);
    }
    
    setChartData(newChartData);
  }, [data, dimension, filters, cityPage]);

  // render horizontal bar chart using D3.js
  useEffect(() => {
    if (!svgRef.current || tabValue !== 0) return;

    // clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const containerWidth = chartWidth || svgRef.current.clientWidth;
    const containerHeight = height;
    const margin = { top: 20, right: 30, bottom: 60, left: 120 };
    const availableWidth = containerWidth - margin.left - margin.right;
    const chartHeight = containerHeight - margin.top - margin.bottom;

    // always render axes even if no data
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // calculate dynamic tick count based on available width for better readability
    const calculateTickCount = (width: number) => {
      if (width < 300) return 3; // very narrow - show 3 ticks
      if (width < 500) return 5; // narrow - show 5 ticks
      if (width < 800) return 8; // medium - show 8 ticks
      return 10; // wide - show 10 ticks
    };

    const tickCount = calculateTickCount(availableWidth);

    // create D3 scales for horizontal bars
    const x = d3.scaleLinear()
      .domain([0, maxRevenue])
      .range([0, availableWidth]);
    
    const y = d3.scaleBand()
      .domain(chartData.length ? chartData.map(d => d.dimension) : [])
      .range([0, chartHeight])
      .padding(0.1);

    // if no data, just render empty axes with labels
    if (!chartData.length) {
      // add axes for empty state
      const xAxis = d3.axisBottom(x)
        .ticks(tickCount)
        .tickFormat((d: any) => `$${(d / 1000000).toFixed(0)}M`);
      const yAxis = d3.axisLeft(y);

      g.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(xAxis)
        .style("color", theme.palette.text.secondary)
        .selectAll("text")
        .style("font-size", "14px");

      g.append("g")
        .call(yAxis)
        .style("color", theme.palette.text.secondary)
        .selectAll("text")
        .style("font-size", "14px");

      // add axis labels for empty state
      g.append("text")
        .attr("x", availableWidth / 2)
        .attr("y", chartHeight + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", theme.palette.text.primary)
        .text("Total Annual Revenue");

      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", theme.palette.text.primary)
        .text(dimension === 'level' ? 'Level' : dimension === 'country' ? 'Country' : 'City');

      return;
    }

    // render horizontal bars for better readability with long category names
    // keep full y-axis range but limit bar height to 50px max

    // add horizontal bars with hover effects and tooltips
    g.selectAll(".bar")
      .data(chartData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => y(d.dimension)! + (y.bandwidth() - Math.min(y.bandwidth(), 50)) / 2) // center bars with labels
      .attr("width", d => x(d.value))
      .attr("height", Math.min(y.bandwidth(), 50)) // limit bar height to 50px
      .attr("fill", theme.palette.primary.main)
      .attr("opacity", 0.8)
      .on("mouseover", function(event, d) {
        // highlight bar on hover
        d3.select(this)
          .attr("opacity", 1)
          .attr("fill", theme.palette.secondary.main);
        
        // add tooltip with detailed information
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", theme.palette.background.paper)
          .style("border", `1px solid ${theme.palette.divider}`)
          .style("border-radius", "4px")
          .style("padding", "8px 12px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
          .style("z-index", "1000")
          .style("color", theme.palette.text.primary);
        
        tooltip.html(`
          <strong style="font-size: 14px;">${d.dimension}</strong><br/>
          <span style="font-size: 13px;">Revenue: $${(d.value / 1000000).toFixed(1)}M</span><br/>
          <span style="font-size: 13px;">Companies: ${d.count}</span>
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function(event, d) {
        // restore bar appearance on mouse out
        d3.select(this)
          .attr("opacity", 0.8)
          .attr("fill", theme.palette.primary.main);
        d3.selectAll(".tooltip").remove();
      });

    // add axes for horizontal bars
    const xAxis = d3.axisBottom(x)
      .ticks(tickCount)
      .tickFormat((d: any) => `$${(d / 1000000).toFixed(0)}M`);
    const yAxis = d3.axisLeft(y);

    // render X axis (revenue scale)
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis)
      .style("color", theme.palette.text.secondary)
      .selectAll("text")
      .style("font-size", "14px");

    // render Y axis (category labels)
    g.append("g")
      .call(yAxis)
      .style("color", theme.palette.text.secondary)
      .selectAll("text")
      .style("font-size", "14px");

    // add axis labels for horizontal bars
    g.append("text")
      .attr("x", availableWidth / 2)
      .attr("y", chartHeight + 50)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", theme.palette.text.primary)
      .text("Total Annual Revenue");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -margin.left + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", theme.palette.text.primary)
      .text(dimension === 'level' ? 'Level' : dimension === 'country' ? 'Country' : 'City');

  }, [chartData, height, theme, tabValue, chartWidth]);

  // render interactive bubble chart for company hierarchy visualization
  useEffect(() => {
    if (!svgRef.current || tabValue !== 1) return;

    // clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // show loading state while fetching hierarchy data
    if (hierarchyLoading) {
      const svg = d3.select(svgRef.current);
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "16px")
        .style("fill", theme.palette.text.secondary)
        .text("Loading hierarchy data...");
      return;
    }

    // show error state if no hierarchy data available
    if (!hierarchyData) {
      const svg = d3.select(svgRef.current);
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "16px")
        .style("fill", theme.palette.error.main)
        .text("Failed to load hierarchy data");
      return;
    }

    // convert API hierarchy data to D3 format for bubble chart
    const convertHierarchyToD3 = (node: CompanyHierarchyNode): BubbleData => {
      const bubbleData: BubbleData = {
        name: node.company_name,
        company: {
          id: node.company_code,
          name: node.company_name,
          level: node.level || 1,
          country: node.country || 'Unknown',
          city: node.city || 'Unknown',
          foundedYear: node.year_founded ? node.year_founded : 2020,
          annualRevenue: node.annual_revenue || 0,
          employees: node.employees || 0,
        }
      };

      // recursively convert children nodes
      if (node.children && node.children.length > 0) {
        bubbleData.children = node.children.map(convertHierarchyToD3);
      }

      return bubbleData;
    };

    const hierarchicalData = convertHierarchyToD3(hierarchyData);
    const actualWidth = chartWidth || (typeof width === 'string' ? svgRef.current.clientWidth : width);
    
    // create the pack layout for circular bubble arrangement
    const pack = d3.pack()
      .size([actualWidth, height])
      .padding(3);

    // create the hierarchy and calculate bubble sizes based on revenue
    const root = d3.hierarchy(hierarchicalData as any)
      .sum(d => (d as any).company ? (d as any).company.annualRevenue / 1000000 : 1) // use revenue for sizing
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // apply the pack layout to position bubbles
    pack(root);

    const svg = d3.select(svgRef.current);
    const g = svg.append("g");

    // center the chart in the container
    const centerX = actualWidth / 2;
    const centerY = height / 2;

    // add zoom behavior for interactive navigation
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 30])
      .on("zoom", (event) => {
        // zoom relative to mouse position
        const transform = event.transform;
        g.attr("transform", `translate(${transform.x},${transform.y}) scale(${transform.k})`);
      })

    // apply initial transform to center the chart
    const initialTransform = d3.zoomIdentity;
    svg.call(zoom.transform as any, initialTransform);
    
    // enable mouse wheel zoom
    svg.call(zoom);

    // add reset zoom button for easy navigation back to overview
    svg.append("g")
      .attr("class", "reset-zoom")
      .append("circle")
      .attr("cx", 50)
      .attr("cy", 50)
      .attr("r", 20)
      .attr("fill", theme.palette.background.paper)
      .attr("stroke", theme.palette.primary.main)
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition()
          .duration(750)
          .call(zoom.transform as any, initialTransform);
      });

    svg.select(".reset-zoom")
      .append("text")
      .attr("x", 50)
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("fill", theme.palette.primary.main)
      .style("pointer-events", "none")
      .text("×");

    // create darker color scale for better visibility on different backgrounds
    const darkerColors = [
      '#bbdefb', // darker blue
      '#e1bee7', // darker purple
      '#c8e6c9', // darker green
      '#ffe0b2', // darker orange
      '#f8bbd9', // darker pink
      '#dcedc8', // darker lime
      '#b2dfdb', // darker teal
      '#eeeeee', // darker grey
    ];
    const color = d3.scaleOrdinal(darkerColors);

    // create the bubbles using pack layout
    const node = g.selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);

    // add circles with interactive features
    node.append("circle")
      .attr("r", d => String((d as any).r || 0))
      .attr("fill", d => color(String(d.depth)))
      .attr("stroke", theme.palette.background.paper)
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        // zoom to this bubble based on hierarchy level
        const scale = d.depth === 4 ? 20 : d.depth === 3 ? 12 : 8; // level 4 gets most zoom, level 3 gets medium
        const transform = d3.zoomIdentity
          .translate(centerX - (d.x || 0), centerY - (d.y || 0))
          .scale(scale);
        svg.transition()
          .duration(750)
          .call(zoom.transform as any, transform);
      })
      .on("mouseover", function(event, d) {
        // remove existing tooltips to prevent duplicates
        d3.selectAll(".bubble-tooltip").remove();
        
        // create detailed tooltip with company information
        const tooltip = d3.select("body").append("div")
          .attr("class", "bubble-tooltip")
          .style("position", "absolute")
          .style("background", theme.palette.background.paper)
          .style("border", `1px solid ${theme.palette.divider}`)
          .style("border-radius", "8px")
          .style("padding", "12px")
          .style("font-size", "14px")
          .style("pointer-events", "none")
          .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)")
          .style("z-index", "1000")
          .style("color", theme.palette.text.primary)
          .style("max-width", "300px");

        let tooltipContent = `<strong>${d.data.name}</strong><br/>`;
        
        // add company details if available
        if (d.data.company) {
          const company = d.data.company;
          tooltipContent += `
            <br/>Level: ${company.level}
            <br/>Country: ${company.country}
            <br/>City: ${company.city}
            <br/>Founded: ${company.foundedYear}
            <br/>Revenue: $${company.annualRevenue.toLocaleString()}
            <br/>Employees: ${company.employees.toLocaleString()}
          `;
        }

        tooltip.html(tooltipContent)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
          .style("color", theme.palette.mode === 'dark' ? "#ffffff" : "#000000");

        // highlight the bubble on hover
        d3.select(this)
          .attr("stroke-width", 4)
          .attr("stroke", theme.palette.primary.main);
      })
      .on("mouseout", function(event, d) {
        // remove tooltip on mouse out
        d3.selectAll(".bubble-tooltip").remove();
        
        // remove highlight on mouse out
        d3.select(this)
          .attr("stroke-width", 2)
          .attr("stroke", theme.palette.background.paper);
      })
      .on("click", function(event, d) {
        // prevent event bubbling to avoid conflicts
        event.stopPropagation();
        
        // get current zoom state
        const currentTransform = d3.zoomTransform(svg.node() as any);
        
        // zoom to the clicked node - make it take over majority of space
        const clickedX = (d.x || 0);
        const clickedY = (d.y || 0);
        const clickedRadius = ((d as any).r || 0);
        
        // calculate zoom level to make the bubble take up most of the view
        const zoomLevel = Math.min(actualWidth / (clickedRadius * 4), height / (clickedRadius * 4), 8);
        
        // calculate the target position in the current zoom space
        const targetX = centerX - (clickedX * zoomLevel);
        const targetY = centerY - (clickedY * zoomLevel);
        
        const transform = d3.zoomIdentity
          .translate(targetX, targetY)
          .scale(zoomLevel);
        
        svg.transition()
          .duration(750)
          .call(zoom.transform as any, transform);
      });

    // add labels for larger bubbles (currently disabled for cleaner look)
    node.filter(d => (d as any).r > 20)
      .append("text")
      .attr("dy", "0.3em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", theme.palette.background.paper)
      .style("pointer-events", "none")
      .text(''); // remove company names from bubbles - show only bubbles

  }, [data, width, height, theme, tabValue, chartWidth]);

  // note: removed resize listener to prevent infinite loops
  // charts will re-render when tabValue or data changes

  // ------------------------------------------------------------------------------------------------
  // event handlers for user interactions

  // handle filter changes for all filter types with optimization to prevent unnecessary re-renders
  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters(prev => {
      // only update if the value actually changed
      if (JSON.stringify(prev[filterType]) === JSON.stringify(value)) {
        return prev;
      }
      return {
      ...prev,
      [filterType]: value
      };
    });
  };

  // clear all filters and reset to default values
  const clearFilters = () => {
    setFilters({
      level: [],
      country: [],
      city: [],
      foundedYear: { start: 1990, end: 2024 },
      annualRevenue: { min: 0, max: 1000000000 },
      employees: { min: 0, max: 10000 },
    });
  };

  // handle tab switching between bar chart and bubble chart
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Card sx={{ borderRadius: '16px', p: 3, height: '100%' }}>
      {/* tab navigation for switching between bar chart and bubble chart */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="chart type tabs">
          <Tab 
            icon={<BarChart />} 
            label="Company Revenue Analysis" 
            iconPosition="start"
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            icon={<BubbleChart />} 
            label="Company Hierarchy" 
            iconPosition="start"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Box>

      {/* tab panels for different chart types */}
      <TabPanel value={tabValue} index={0}>
        {/* bar chart tab - revenue analysis by dimension */}
        <Box>

      {/* dimension selector - choose between level, country, or city */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Dimension</InputLabel>
          <Select
            value={dimension}
            label="Dimension"
            onChange={(e) => setDimension(e.target.value)}
          >
            <MenuItem value="level">Company Level</MenuItem>
            <MenuItem value="country">Country</MenuItem>
            <MenuItem value="city">City</MenuItem>
          </Select>
        </FormControl>
      </Box>

          {/* filters dropdown bar - collapsible filter controls with active filter count */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary 
          expandIcon={<ExpandMore />}
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pr: 1,
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <Typography>Filters</Typography>
            <Chip 
              label="Active" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }}>
                {/* X Categories */}
                <Chip 
                  label={`${(() => {
                    const filteredData = data.filter(company => {
                      const levelMatch = filters.level.length === 0 || filters.level.includes(company.level);
                      const countryMatch = filters.country.length === 0 || filters.country.includes(company.country);
                      const cityMatch = filters.city.length === 0 || filters.city.includes(company.city);
                      const yearMatch = company.foundedYear >= filters.foundedYear.start && company.foundedYear <= filters.foundedYear.end;
                      const revenueMatch = company.annualRevenue >= filters.annualRevenue.min && company.annualRevenue <= filters.annualRevenue.max;
                      const employeesMatch = company.employees >= filters.employees.min && company.employees <= filters.employees.max;
                      
                      return levelMatch && countryMatch && cityMatch && yearMatch && revenueMatch && employeesMatch;
                    });

                    const groupedData = d3.group(filteredData, d => {
                      if (dimension === 'level') return `Level ${d.level}`;
                      if (dimension === 'country') return d.country;
                      if (dimension === 'city') return d.city;
                      return 'Unknown';
                    });

                    return Array.from(groupedData.entries()).length;
                  })()} categories`} 
                  color={chartData.length > 0 ? "primary" : "default"} 
                  variant="outlined"
                  size="medium"
                />
                {/* Clear Filters button */}
          <Box
            component="span"
            onClick={(e) => {
              e.stopPropagation();
              clearFilters();
            }}
            sx={{
              color: 'error.main',
              border: '1px solid',
              borderColor: 'error.light',
              borderRadius: 1,
              fontSize: '0.8rem',
              py: 0.75,
              px: 2,
              cursor: 'pointer',
              textTransform: 'none',
                    
              '&:hover': {
                borderColor: 'error.main',
                backgroundColor: 'error.light',
                color: 'error.main'
              }
            }}
          >
            Clear all filters
          </Box>
              </Box>

              
            {/* Filters Dropdown Content */}
        </AccordionSummary>
                 <AccordionDetails sx={{ pt: 2 }}>
           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
             {/* Level Filter */}
             <Box>
               <FormControl fullWidth>
                 <InputLabel>Company Level</InputLabel>
                 <Select
                   multiple
                   value={filters.level}
                   label="Company Level"
                   onChange={(e) => handleFilterChange('level', e.target.value)}
                   renderValue={(selected) => (
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                       {selected.map((value) => (
                         <Chip 
                           key={value} 
                           label={`Level ${value}`} 
                           size="small"
                                                   // THIS - Delete icon code for Level filter
                        onDelete={() => {
                          const newLevels = filters.level.filter(level => level !== value);
                          handleFilterChange('level', newLevels);
                        }}
                              onMouseDown={(e) => e.stopPropagation()}
                         />
                       ))}
                     </Box>
                   )}
                 >
                   {[1, 2, 3, 4].map((level) => (
                     <MenuItem key={level} value={level}>
                       Level {level}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
             </Box>

             {/* Country Filter */}
             <Box>
               <FormControl fullWidth>
                 <InputLabel>Country</InputLabel>
                 <Select
                   multiple
                   value={filters.country}
                   label="Country"
                   onChange={(e) => handleFilterChange('country', e.target.value)}
                   renderValue={(selected) => (
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                       {selected.map((value) => (
                         <Chip 
                           key={value} 
                           label={value} 
                           size="small"
                                                   // THIS - Delete icon code for Country filter
                        onDelete={() => {
                          const newCountries = filters.country.filter(country => country !== value);
                          handleFilterChange('country', newCountries);
                        }}
                              onMouseDown={(e) => e.stopPropagation()}
                         />
                       ))}
                     </Box>
                   )}
                 >
                   {availableCountries.map((country) => (
                     <MenuItem key={country} value={country}>
                       {country}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
             </Box>

             {/* City Filter */}
             <Box>
               <FormControl fullWidth>
                 <InputLabel>City</InputLabel>
                 <Select
                   multiple
                   value={filters.city}
                   label="City"
                   onChange={(e) => handleFilterChange('city', e.target.value)}
                   renderValue={(selected) => (
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                       {selected.map((value) => (
                         <Chip 
                           key={value} 
                           label={value} 
                           size="small"
                                                   // THIS - Delete icon code for City filter
                        onDelete={() => {
                          const newCities = filters.city.filter(city => city !== value);
                          handleFilterChange('city', newCities);
                        }}
                              onMouseDown={(e) => e.stopPropagation()}
                         />
                       ))}
                     </Box>
                   )}
                 >
                   {availableCities.slice(cityPage * citiesPerPage, (cityPage + 1) * citiesPerPage).map((city) => (
                     <MenuItem key={city} value={city}>
                       {city}
                     </MenuItem>
                   ))}
                   {availableCities.length > citiesPerPage && (
                     <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
                       <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                         <IconButton
                           size="small"
                           disabled={cityPage === 0}
                           onClick={() => setCityPage(prev => Math.max(0, prev - 1))}
                         >
                           <KeyboardArrowLeft />
                         </IconButton>
                         <Typography variant="caption">
                           {cityPage + 1}/{Math.ceil(availableCities.length / citiesPerPage)}
                         </Typography>
                         <IconButton
                           size="small"
                           disabled={cityPage >= Math.ceil(availableCities.length / citiesPerPage) - 1}
                           onClick={() => setCityPage(prev => prev + 1)}
                         >
                           <KeyboardArrowRight />
                         </IconButton>
                       </Stack>
                     </Box>
                   )}
                 </Select>
               </FormControl>
             </Box>

             {/* Founded Year Range */}
             <Box>
               <Typography gutterBottom>Founded Year Range</Typography>
               <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                 <TextField
                   type="number"
                   label="Start"
                   value={filters.foundedYear.start}
                   onChange={(e) => handleFilterChange('foundedYear', {
                     ...filters.foundedYear,
                     start: parseInt(e.target.value) || 1990
                   })}
                   size="small"
                 />
                 <Typography>-</Typography>
                 <TextField
                   type="number"
                   label="End"
                   value={filters.foundedYear.end}
                   onChange={(e) => handleFilterChange('foundedYear', {
                     ...filters.foundedYear,
                     end: parseInt(e.target.value) || 2024
                   })}
                   size="small"
                 />
               </Stack>
               <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                 <Box sx={{ width: '80%', maxWidth: 300 }}>
                   <Slider
                     value={[filters.foundedYear.start, filters.foundedYear.end]}
                     onChange={(event, newValue) => {
                       const [start, end] = newValue as number[];
                       handleFilterChange('foundedYear', { start, end });
                     }}
                     min={data.length > 0 ? Math.min(...data.map(c => c.foundedYear).filter(y => y > 0)) : 1900}
                     max={data.length > 0 ? Math.max(...data.map(c => c.foundedYear).filter(y => y > 0)) : 2023}
                     step={1}
                     valueLabelDisplay="auto"
                     valueLabelFormat={(value) => value.toString()}
                   />
                 </Box>
               </Box>
             </Box>

             {/* Annual Revenue Range */}
             <Box>
               <Typography gutterBottom>Annual Revenue Range ($M)</Typography>
               <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                 <TextField
                   type="number"
                   label="Min"
                   value={filters.annualRevenue.min}
                   onChange={(e) => handleFilterChange('annualRevenue', {
                     ...filters.annualRevenue,
                     min: parseInt(e.target.value || '0')
                   })}
                   size="small"
                 />
                 <Typography>-</Typography>
                 <TextField
                   type="number"
                   label="Max"
                   value={filters.annualRevenue.max}
                   onChange={(e) => handleFilterChange('annualRevenue', {
                     ...filters.annualRevenue,
                     max: parseInt(e.target.value || '1100000')
                   })}
                   size="small"
                 />
               </Stack>
               <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                 <Box sx={{ width: '80%', maxWidth: 300 }}>
                   <Slider
                     value={[filters.annualRevenue.min, filters.annualRevenue.max]}
                     onChange={(event, newValue) => {
                       const [min, max] = newValue as number[];
                       handleFilterChange('annualRevenue', {
                         min: min,
                         max: max
                       });
                     }}
                     min={0}
                     max={1100000}
                     step={10000}
                     valueLabelDisplay="auto"
                     valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                   />
                 </Box>
               </Box>
             </Box>

             {/* Employees Range */}
             <Box>
               <Typography gutterBottom>Employees Range</Typography>
               <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                 <TextField
                   type="number"
                   label="Min"
                   value={filters.employees.min}
                   onChange={(e) => handleFilterChange('employees', {
                     ...filters.employees,
                     min: parseInt(e.target.value) || 0
                   })}
                   size="small"
                 />
                 <Typography>-</Typography>
                 <TextField
                   type="number"
                   label="Max"
                   value={filters.employees.max}
                   onChange={(e) => handleFilterChange('employees', {
                     ...filters.employees,
                     max: parseInt(e.target.value) || 10000
                   })}
                   size="small"
                 />
               </Stack>
               <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                 <Box sx={{ width: '80%', maxWidth: 300 }}>
                                      <Slider
                     value={[filters.employees.min, filters.employees.max]}
                     onChange={(event, newValue) => {
                       const [min, max] = newValue as number[];
                       handleFilterChange('employees', { min, max });
                     }}
                     min={0}
                     max={4880}
                     step={5}
                     valueLabelDisplay="auto"
                     valueLabelFormat={(value) => value.toLocaleString()}
                   />
                 </Box>
               </Box>
             </Box>

           </Box>
         </AccordionDetails>
      </Accordion>

            {/* Chart */}
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
        <svg ref={svgRef} width="100%" height={height} style={{ minHeight: 500, width: '100%' }} />
        
        {/* Pagination Controls - Bottom Right */}
        {(() => {
          // Calculate total data length before slicing
          const filteredData = data.filter(company => {
            const levelMatch = filters.level.length === 0 || filters.level.includes(company.level);
            const countryMatch = filters.country.length === 0 || filters.country.includes(company.country);
            const cityMatch = filters.city.length === 0 || filters.city.includes(company.city);
            const yearMatch = company.foundedYear >= filters.foundedYear.start && company.foundedYear <= filters.foundedYear.end;
            const revenueMatch = company.annualRevenue >= filters.annualRevenue.min && company.annualRevenue <= filters.annualRevenue.max;
            const employeesMatch = company.employees >= filters.employees.min && company.employees <= filters.employees.max;
            
            return levelMatch && countryMatch && cityMatch && yearMatch && revenueMatch && employeesMatch;
          });

          const groupedData = d3.group(filteredData, d => {
            if (dimension === 'level') return `Level ${d.level}`;
            if (dimension === 'country') return d.country;
            if (dimension === 'city') return d.city;
            return 'Unknown';
          });

          const totalDataLength = Array.from(groupedData.entries()).length;
          const shouldShow = totalDataLength > citiesPerPage;
          const totalPages = Math.ceil(totalDataLength / citiesPerPage);
          

          
          return shouldShow;
        })() && (
          <Box sx={{ 
            position: 'absolute', 
            bottom: -16, 
            right: 10, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
            padding: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}>
            <IconButton
              size="small"
              disabled={cityPage === 0}
              onClick={() => setCityPage(prev => Math.max(0, prev - 1))}
              sx={{ color: theme.palette.primary.main }}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <Typography variant="caption" sx={{ minWidth: '50px', textAlign: 'center', fontWeight: 'bold' }}>
              {cityPage + 1}/{(() => {
                const filteredData = data.filter(company => {
                  const levelMatch = filters.level.length === 0 || filters.level.includes(company.level);
                  const countryMatch = filters.country.length === 0 || filters.country.includes(company.country);
                  const cityMatch = filters.city.length === 0 || filters.city.includes(company.city);
                  const yearMatch = company.foundedYear >= filters.foundedYear.start && company.foundedYear <= filters.foundedYear.end;
                  const revenueMatch = company.annualRevenue >= filters.annualRevenue.min && company.annualRevenue <= filters.annualRevenue.max;
                  const employeesMatch = company.employees >= filters.employees.min && company.employees <= filters.employees.max;
                  
                  return levelMatch && countryMatch && cityMatch && yearMatch && revenueMatch && employeesMatch;
                });

                const groupedData = d3.group(filteredData, d => {
                  if (dimension === 'level') return `Level ${d.level}`;
                  if (dimension === 'country') return d.country;
                  if (dimension === 'city') return d.city;
                  return 'Unknown';
                });

                const totalDataLength = Array.from(groupedData.entries()).length;
                return Math.ceil(totalDataLength / citiesPerPage);
              })()}
            </Typography>
            <IconButton
              size="small"
              disabled={cityPage >= (() => {
                const filteredData = data.filter(company => {
                  const levelMatch = filters.level.length === 0 || filters.level.includes(company.level);
                  const countryMatch = filters.country.length === 0 || filters.country.includes(company.country);
                  const cityMatch = filters.city.length === 0 || filters.city.includes(company.city);
                  const yearMatch = company.foundedYear >= filters.foundedYear.start && company.foundedYear <= filters.foundedYear.end;
                  const revenueMatch = company.annualRevenue >= filters.annualRevenue.min && company.annualRevenue <= filters.annualRevenue.max;
                  const employeesMatch = company.employees >= filters.employees.min && company.employees <= filters.employees.max;
                  
                  return levelMatch && countryMatch && cityMatch && yearMatch && revenueMatch && employeesMatch;
                });

                const groupedData = d3.group(filteredData, d => {
                  if (dimension === 'level') return `Level ${d.level}`;
                  if (dimension === 'country') return d.country;
                  if (dimension === 'city') return d.city;
                  return 'Unknown';
                });

                const totalDataLength = Array.from(groupedData.entries()).length;
                return Math.ceil(totalDataLength / citiesPerPage) - 1;
              })()}
              onClick={() => setCityPage(prev => prev + 1)}
              sx={{ color: theme.palette.primary.main }}
            >
              <KeyboardArrowRight />
            </IconButton>
          </Box>
        )}
      </Box>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* bubble chart tab - interactive hierarchy visualization */}
        <Box>

          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            Interactive bubble chart showing company hierarchy relationships. Click bubbles to zoom in/out and hover for details.
          </Typography>
          {/* loading state while fetching hierarchy data */}
          {hierarchyLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          )}
          {/* SVG container for the bubble chart */}
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <svg ref={svgRef} width="100%" height={height} style={{ minHeight: 500, width: '100%' }} />
          </Box>
        </Box>
      </TabPanel>
    </Card>
  );
} 