import styled from "styled-components";

export const StyledTree = styled.div`
overflow: auto;
  overscroll-behavior-x: none;
.tree-selection-brush .extent {
    fill-opacity: .05;
    stroke: #fff;
    shape-rendering: crispEdges;
  }
  
  .tree-scale-bar text {
  font: sans-serif;
  }
  
  .tree-scale-bar line,
  .tree-scale-bar path {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
  }
  
  .node circle, .node ellipse, .node rect {
  fill: steelblue;
  stroke: black;
  stroke-width: 0.5px;
  }
  
  .internal-node circle, .internal-node ellipse, .internal-node rect{
  fill: #CCC;
  stroke: black;
  stroke-width: 0.5px;
  }
  
  .node {
  font: 10px sans-serif;
  }
  
  .node-selected {
  fill: #f00 !important;     
  }
  
  .node-collapsed circle, .node-collapsed ellipse, .node-collapsed rect{
  fill: black !important;     
  }
  
  .node-tagged {
  fill: #00f; 
  }
  
  .branch {
  fill: none;
  stroke: #999;
  stroke-width: 2px;
  }
  
  .clade {
  fill: lightgrey;
  stroke: #222;
  stroke-width: 2px;
  opacity: 0.5;
  }
  
  .branch-selected {
  stroke: #f00 !important; 
  stroke-width: 3px;
  }
  
  .branch-tagged {
  stroke: #00f;
  stroke-dasharray: 10,5;
  stroke-width: 2px;
  }
  
  .branch-tracer {
  stroke: #bbb;
  stroke-dasharray: 3,4;
  stroke-width: 1px;
  }
  
  
  .branch-multiple {
  stroke-dasharray: 5, 5, 1, 5;
  stroke-width: 3px;
  }
  
  .branch:hover {
  stroke-width: 10px;
  }
  
  .internal-node circle:hover, .internal-node ellipse:hover, .internal-node rect:hover {
  fill: black;
  stroke: #CCC;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    display: none;
    float: left;
    min-width: 10rem;
    padding: 0.5rem 0;
    margin: 0.125rem 0 0;
    font-size: 1rem;
    color: #777;
    text-align: left;
    list-style: none;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0,0,0,0.15);
    border-radius: 0.25rem;
  }
  
  .dropdown-divider {
    height: 0;
    margin: 0.5rem 0;
    overflow: hidden;
    border-top: 1px solid #eee;
  }
  
  .dropdown-header {
    display: block;
    padding: 0.5rem 1.5rem;
    margin-bottom: 0;
    font-size: 0.875rem;
    color: #777;
    white-space: nowrap;
  }
  .dropdown-item {
    display: block;
    width: 100%;
    padding: 0.25rem 1.5rem;
    clear: both;
    font-weight: 400;
    color: #2d2d2d;
    text-align: inherit;
    white-space: nowrap;
    background-color: transparent;
    border: 0;
  }
`;