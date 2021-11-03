import styled from "styled-components";

export const StyledTree = styled.div`
  overflow: auto;
  
  .gb-tree-list {
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
    line-height: 1.15;
    /* padding-left: .2vw; */
    padding-left: .5em;

    // [connector] parent-to-children
    &::before {
      /* width: .2vw; */
      width: .5em;
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      border-top: 1px solid #333; // perhaps dotted as this isn't a branch length // remove color to use current
    }
  }

  .gb-tree-node {
    display: flex;
    flex-direction: row;
    align-items: center;
    white-space: nowrap;
    position: relative;
    
    // [connector] child-to-parent
    .gb-tree-pipe {
      position: absolute;
      left: 0;
      border-top: 1px solid #333; // remove color to use current
    }

    // [connector] children-group
    &::after {
      content: '';
      position: absolute;
      left: 0;
      border-left: 1px solid #333; // remove color to use current
    }
    // [connector] children-group:last-child
    &:last-of-type::after {
      height: 50%;
      top: 0;
    }
    // [connector] children-group:first-child
    &:first-of-type::after {
      height: 50%;
      bottom: 0;
    }
    &:only-of-type::after {
      display: none;
    }
    // [connector] children-group:middle-child(ren)
    &:not(:first-of-type):not(:last-of-type)::after {
      height: 100%;
    }
  }

  .gb-tree-color {
    width: .8em;
    height: .8em;
    padding: 0;
    border: 1px solid #333;
    border-radius: 50%;
    display: inline-block;
    background: white;
    cursor: pointer;
    z-index: 10;
  }

  .gb-tree-color-click-area {
    width: 10px;
    height: 10px;
    display: block;
    left: -5px;
    top: -5px;
    position: relative;
    /* background: tomato; */
  }

  .gb-tree-leaf-color {
    margin-right: -4px;
    background: white;
  }

  .gb-tree-content-node {
    margin: .25em 0;
    position: relative;
    cursor: pointer;
    &.gb-tree-leaf {
      background: #fafafa;
      border: 1px solid #333; // remove color to use current
      padding: 0 .25em 0 .5em;
      .gb-tree-color {
        margin-left: .5em;
      }
    }
    .gb-tree-node-name {
      color: #333;
    }
  }

  .gb-tree-color:hover + ol .gb-tree-leaf, .gb-tree-color:hover + .gb-tree-leaf {
    background: #cad2d3!important;
    color: white;
    /* .gb-tree-node-name {
      color: white;
    } */
  }

  /* .gb-tree-color:hover + ol {
    color: pink;
    /* span, div {
      background: currentColor;
    } */
  } */

  .gb-tree-hover-title:hover {
    box-shadow: 0 0 2px 2px #0089ffab;
    z-index: 1000;
  }

  /* .gb-tree-node:hover > .gb-tree-hover-title[title]:before {
    content: '';
    display: block;
    border-radius: 50%;
    border: 2px solid #0089ff;
    width: 10px;
    height: 10px;
    pointer-events: none;
    position: absolute;
    top: -5px;
    right: -5px;
    box-shadow: 0 0 1px 1px #0089ffab;
  } */
  .gb-tree-hover-title[gbtitle]:hover:after {
    font-size: 15px;
    pointer-events: none;
    content: attr(gbtitle);
    position: relative;
    top: -30px;
    background: #333;
    color: white;
    border-radius: 4px;
    padding: 3px 5px;
    z-index: 1000;
  }

  .gb-tree-subtree-placeholder {
    border-top: 2px solid;
  }

  .gb-tree-highlighted {
    .gb-tree-color {
      background-color: currentColor;
    }
  }
`;