'use client'

import * as React from 'react';
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  Box,
  Card,
  Typography,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  ShowChart,
  ZoomIn,
} from '@mui/icons-material';

// Line Chart Component
interface LineChartProps {
  data: { year: number; count: number }[];
  width: number | string;
  height: number;
}

export default function LineChart({ data, width, height }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const modalSvgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();
  const [containerWidth, setContainerWidth] = React.useState<number>(700);
  const [zoomOpen, setZoomOpen] = React.useState<boolean>(false);

  // Separate function to render chart
  const renderChart = (svgElement: SVGSVGElement, chartData: typeof data, chartWidth: number, chartHeight: number, theme: any, useAllData: boolean = false) => {
    // Clear previous chart
    d3.select(svgElement).selectAll("*").remove();

    // Use the actual container width for the chart
    const actualWidth = chartWidth;
    const actualHeight = chartHeight;
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const innerChartWidth = actualWidth - margin.left - margin.right;
    const innerChartHeight = actualHeight - margin.top - margin.bottom;

    // half the data points in dashboard to reduce crowding
    const allData = useAllData ? chartData : chartData.filter((_, index) => index % 2 === 0);
    
    // x axis
    const x = d3.scaleTime()
      .domain(d3.extent(allData, d => new Date(d.year, 0, 1)) as [Date, Date])
      .range([0, innerChartWidth]);

    // y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(allData, d => d.count) as number])
      .range([innerChartHeight, 0]);

    // line
    const line = d3.line<{ year: number; count: number }>()
      .x(d => x(new Date(d.year, 0, 1)))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    // group
    const g = d3.select(svgElement)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // gradient
    const gradient = g.append("defs")
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", y(0))
      .attr("x2", 0).attr("y2", y(d3.max(allData, d => d.count) as number));

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", theme.palette.primary.main)
      .attr("stop-opacity", 0.8);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", theme.palette.primary.main)
      .attr("stop-opacity", 0.1);

    // gradient area
    const area = d3.area<{ year: number; count: number }>()
      .x(d => x(new Date(d.year, 0, 1)))
      .y0(innerChartHeight)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(allData)
      .attr("fill", "url(#line-gradient)")
      .attr("d", area as any);

    // line
    g.append("path")
      .datum(allData)
      .attr("fill", "none")
      .attr("stroke", theme.palette.primary.main)
      .attr("stroke-width", 3)
      .attr("d", line as any);

    // dots
    g.selectAll(".dot")
      .data(allData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(new Date(d.year, 0, 1)))
      .attr("cy", d => y(d.count))
      .attr("r", 5)
      .attr("fill", theme.palette.primary.main)
      .attr("stroke", theme.palette.background.paper)
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("r", 8)
          .attr("fill", theme.palette.secondary.main);
        // Add tooltip
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
                 tooltip.html(`<strong>${d.year}</strong><br/>Companies: ${d.count}`)
           .style("left", (event.pageX + 10) + "px")
           .style("top", (event.pageY - 10) + "px")
           .style("z-index", "9999");
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .attr("r", 5)
          .attr("fill", theme.palette.primary.main);
        d3.selectAll(".tooltip").remove();
      });

    // axes
    const xAxis = d3.axisBottom(x)
      .tickFormat((d: any) => d3.timeFormat("%Y")(d))
      .ticks(d3.timeYear.every(useAllData ? 5 : 10));
    const yAxis = d3.axisLeft(y).ticks(5);

    // x axis
    g.append("g")
      .attr("transform", `translate(0,${innerChartHeight})`)
      .call(xAxis)
      .style("color", theme.palette.text.secondary)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // y axis
    g.append("g")
      .call(yAxis)
      .style("color", theme.palette.text.secondary);

    // x-axis label
    g.append("text")
      .attr("x", innerChartWidth / 2)
      .attr("y", innerChartHeight + 45)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", theme.palette.text.primary)
      .text("Year");

    // y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerChartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", theme.palette.text.secondary)
      .style("font-size", "12px")
      .text("Company Count");
  };

  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    // render the chart
    renderChart(svgRef.current, data, containerWidth, height, theme, false);
  }, [data, width, height, theme, containerWidth]);

  // render modal chart when opened
  useEffect(() => {
    if (zoomOpen && modalSvgRef.current && data.length) {
      // small delay to ensure modal is rendered (or else it will be blank)
      setTimeout(() => {
        // modal svg shows the full width and height 
        const modalSvg = modalSvgRef.current!;
        const modalContainer = modalSvg.parentElement;
        if (modalContainer) {
          const rect = modalContainer.getBoundingClientRect();
          const modalWidth = rect.width;
          const modalHeight = rect.height;
          renderChart(modalSvg, data, modalWidth, modalHeight, theme, true);
        }
      }, 200);
    }
  }, [zoomOpen, data, theme]);

  // additional effect to handle modal opening
  useEffect(() => {
    if (zoomOpen && data.length) {
      // wait for modal to be fully rendered
      const timer = setTimeout(() => {
        if (modalSvgRef.current) {
          const modalSvg = modalSvgRef.current;
          const modalContainer = modalSvg.parentElement;
                  if (modalContainer) {
          const rect = modalContainer.getBoundingClientRect();
          // render the chart
          renderChart(modalSvg, data, rect.width, rect.height, theme, true);
        }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [zoomOpen, data, theme]);

  // responsive: update containerWidth on resize
  useEffect(() => {
    function handleResize() {
      if (svgRef.current) {
        // set the container width
        setContainerWidth(svgRef.current.parentElement?.clientWidth || 700);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card sx={{ borderRadius: '16px', p: 3, height: '100%' }}>
      {/* title and modal button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShowChart />
          Company Growth Over Years
        </Typography>
        {/* modal button */}
        <IconButton 
          onClick={() => setZoomOpen(true)}
          sx={{ color: theme.palette.primary.main }}
        >
          <ZoomIn />
        </IconButton>
      </Box>
      {/* chart */}
      <Box sx={{ width: '100%' }}>
        <svg ref={svgRef} width={containerWidth} height={height} />
      </Box>

        {/* zoomed modal with full width and height */}
       <Dialog 
         open={zoomOpen} 
         onClose={() => setZoomOpen(false)}
         maxWidth="lg"
         fullWidth
       >
         <DialogTitle sx={{ marginTop: '12px' }}>Detailed Company Growth View</DialogTitle>
         <DialogContent>
           <Box sx={{ width: '100%', height: '600px', paddingBottom: '12px' }}>
             <svg ref={modalSvgRef} width="100%" height="600" />
           </Box>
         </DialogContent>
         <DialogActions sx={{ marginBottom: '12px' }}>
           <Button onClick={() => setZoomOpen(false)} sx={{ marginRight: '25px' }}>Close</Button>
         </DialogActions>
       </Dialog>
    </Card>
  );
} 