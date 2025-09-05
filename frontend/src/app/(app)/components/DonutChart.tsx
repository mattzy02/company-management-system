'use client'

import * as React from 'react';
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  Box,
  Card,
  Typography,
  useTheme,
} from '@mui/material';
import {
  PieChart,
} from '@mui/icons-material';

// Donut Chart Component
interface DonutChartProps {
  data: { label: string; value: number; originalValue?: number; color: string }[];
  width: number | string;
  height: number;
}

export default function DonutChart({ data, width, height }: DonutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();
  const [selectedLevel, setSelectedLevel] = React.useState<string | null>(null);
  // state to force re-render on resize
  const [containerWidth, setContainerWidth] = React.useState<number>(0);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    // clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // select the svg
    const svg = d3.select(svgRef.current);
    // get the actual width and height
    const actualWidth = typeof width === 'string' ? svgRef.current.clientWidth : width;
    const actualHeight = height;
    const radius = Math.min(actualWidth, actualHeight) / 2 - 40;
    const centerX = actualWidth / 2;
    const centerY = actualHeight / 2;

    // pie function
    const pie = d3.pie<{ label: string; value: number; originalValue?: number; color: string }>()
      .value(d => d.value)
      .sort(null);

    // arc functions for different states
    const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number; originalValue?: number; color: string }>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9);

    // hover effect arc function
    const arcHover = d3.arc<d3.PieArcDatum<{ label: string; value: number; originalValue?: number; color: string }>>()
      .innerRadius(radius * 0.61)
      .outerRadius(radius * 0.89);

    // pie data
    const pieData = pie(data);

    // chart group
    const g = svg.append("g")
      .attr("transform", `translate(${centerX},${centerY})`);

    // slices based on logarithmic scale
    const path = g.selectAll("path")
      .data(pieData)
      .enter().append("path")
      .attr("d", arc as any)
      .attr("fill", d => d.data.color)
      .attr("stroke", theme.palette.background.paper)
      .style("stroke-width", "2px")
      .style("opacity", d => selectedLevel === null || selectedLevel === d.data.label ? 0.8 : 0.3)
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        setSelectedLevel(selectedLevel === d.data.label ? null : d.data.label);
      })
      .on("mouseover", function(event, d) {
        // remove any existing tooltips first
        d3.selectAll(".tooltip").remove();
        
        // apply hover effect
        d3.select(this)
          .style("opacity", 1)
          .style("stroke-width", "3px")
          .transition()
          .duration(200)
          .attr("d", arcHover as any);

        // Show details menu only when no level is selected
        if (selectedLevel === null) {
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
          const total = data.reduce((sum, item) => sum + (item.originalValue || item.value), 0);
          const actualValue = d.data.originalValue || d.data.value;
          const percentage = ((actualValue / total) * 100).toFixed(1);
          tooltip.html(`<strong>${d.data.label}</strong><br/>Count: ${actualValue}<br/>Percentage: ${percentage}%`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        }
      })
      .on("mouseout", function(event, d) {
        // Remove tooltip
        d3.selectAll(".tooltip").remove();
        
        // Return to original state
        d3.select(this)
          .style("opacity", selectedLevel === null || selectedLevel === d.data.label ? 0.8 : 0.3)
          .style("stroke-width", "2px")
          .transition()
          .duration(200)
          .attr("d", arc as any);
      });

    // center content - selected level or all levels
    const total = data.reduce((sum, item) => sum + (item.originalValue || item.value), 0);
    const selectedData = selectedLevel ? data.find(d => d.label === selectedLevel) : null;
    g.selectAll(".center-content").remove();
    const centerGroup = g.append("g").attr("class", "center-content");
    if (selectedData) {
      const actualValue = selectedData.originalValue || selectedData.value;
      const percentage = ((actualValue / total) * 100).toFixed(1);
      centerGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", theme.palette.text.primary)
        .text(selectedData.label);
      centerGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.5em")
        .style("font-size", "14px")
        .style("fill", theme.palette.text.secondary)
        .text(`${actualValue}:${percentage}%`);
    } else {
      centerGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", theme.palette.text.primary)
        .text("All Levels");
      centerGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.5em")
        .style("font-size", "14px")
        .style("fill", theme.palette.text.secondary)
        .text(`${total} Companies`);
    }
  }, [data, width, height, theme, selectedLevel, containerWidth]);

  // resize listener for responsiveness
  useEffect(() => {
    function handleResize() {
      if (svgRef.current) {
        setContainerWidth(svgRef.current.clientWidth);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // return the chart
  return (
    <Card sx={{ borderRadius: '16px', p: 3, height: '100%' }}>
      {/* title */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <PieChart />
        Company Level Distribution
      </Typography>
      {/* chart */}
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <svg ref={svgRef} width="100%" height={height} />
      </Box>
    </Card>
  );
} 