import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyledTree } from './styles2';
import acacia from './simple2.json';
import './tree.css';
import { Radio, AutoComplete } from 'antd';
import useDraggableScroll from 'use-draggable-scroll';
const Option = AutoComplete.Option;

const defaultFontSize = 12;
const defaultMultiplier = 1000;
const visibleNamesThreshold = 10;

// Generic hook for detecting scroll:
const useScrollAware = (ref) => {
  const [scrollTop, setScrollTop] = useState(0);
  let throttleTimeout = null;
  const onScroll = (e) => {
    if (throttleTimeout === null) {
      throttleTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          setScrollTop(e.target.scrollTop);
          throttleTimeout = null;
        });
      }, 100)
    }
  };

  useEffect(() => {
    const scrollContainer = ref.current;

    setScrollTop(scrollContainer.scrollTop);
    scrollContainer.addEventListener("scroll", onScroll);
    return () => scrollContainer.removeEventListener("scroll", onScroll);
  }, []);

  return [scrollTop];
};


function decorateTree(node, parent) {
  let position = 0;
  let index = 0;

  function recursive(node, parent) {
    const children = node.children || [];
    node.position = position;
    node.parent = parent;
    node.id = index;
    index++;
    if (children.length === 0) {
      position++;
      node.size = 1;
      node.childrenLength = 0;
      return { size: node.size, childrenLength: node.branch_length };
    }
    const sizes = children.map(x => recursive(x, node))
    const sum = sizes.reduce((partial_sum, a) => partial_sum + a.size, 0);
    const childrenLength = sizes.reduce((maxLength, a) => Math.max(maxLength, a.childrenLength), 0);

    node.size = sum;
    node.childrenLength = childrenLength;
    return { size: node.size, childrenLength: node.childrenLength + node.branch_length };
  }
  return recursive(node, parent);
}

function getVisibleNodes(node, scrollTop, elementHeight, hasVisibleParent) {
  const offsetY = node.position * elementHeight;
  //do not show anything below this threshold
  // let showNode = offsetY < scrollTop + 600; // test
  let showNode = offsetY < scrollTop + 1300;//should use container height
  //remove any node above
  // showNode = showNode && (offsetY + node.size * elementHeight > scrollTop + 200); //test
  showNode = showNode && (offsetY + node.size * elementHeight > scrollTop - 50);

  if (!hasVisibleParent && !showNode) return;

  node.children = node.children || [];
  const childrenLength = node.children.length;

  let visibleNode = { ...node }
  if (childrenLength > 0) {
    visibleNode.children = node.children
      .map(x => getVisibleNodes(x, scrollTop, elementHeight, showNode))
      .filter(x => x);
  }
  return visibleNode;
}

const Tree = React.memo((props) => {
  return <SampleTree {...props} />
});

function SampleTree({ onNodeEnter, onNodeLeave, highlighted, highlightedLeaf, onToggle, hasVisibleParent, node, parentPosition = 0, first = true, scrollTop, multiplier, elementHeight = 20, ...props }) {
  if (!node) return null;
  if (!node.size) return null;
  const isHighlighted = highlighted[node.key];
  const isHighlightedLeaf = typeof highlightedLeaf !== 'undefined' && highlightedLeaf === node.leafIndex;
  const visibleNames = elementHeight >= visibleNamesThreshold;
  node.children = node.children || [];
  const childrenLength = node.children.length;
  const depth = node.branch_length * multiplier || 0;
  // const titleProp = !visibleNames ? { gbtitle: nodeTitle } : {};
  const treeProps = {
    onNodeEnter, onNodeLeave, highlighted, highlightedLeaf, onToggle, elementHeight, multiplier
  };

  if (node.size * elementHeight < 10 && childrenLength > 0) {
    const totalDepth = node.childrenLength * multiplier;
    return <li
      style={{
        height: node.size * elementHeight,
        paddingLeft: depth,
        background: !visibleNames && isHighlighted ? isHighlighted.color + 'cc' : null
      }}
      className="gb-tree-node">
      <span className="gb-tree-pipe" style={{ width: depth }}></span>
      <span onClick={e => onToggle({ selected: node.key })}
        className={`gb-tree-hover-title gb-tree-color ${childrenLength === 0 ? 'gb-tree-leaf-color' : ''}`}
        style={{
          backgroundColor: isHighlighted ? isHighlighted.color : null,
          boxShadow: isHighlightedLeaf ? '0 0 0 2px #ff6868' : null
        }}
        onMouseEnter={e => onNodeEnter({ e, node: node })}
        onMouseLeave={e => onNodeLeave({ e, node: node })}
        // gbtitle={nodeTitle}
        id={`${childrenLength === 0 ? `gb-tree-node-${node.leafIndex}` : null}`}
      >
        {!visibleNames && <span className="gb-tree-color-click-area"></span>}
      </span>
      <div className="gb-tree-content-node" >
        {node.name && <span
          className="gb-tree-hover-title"
        >
        </span>}
      </div>
      <div className="gb-tree-subtree-placeholder" style={{ width: totalDepth }}></div>
    </li>
  }

  return <li
    style={{
      height: node.size * elementHeight,
      paddingLeft: depth,
      borderRight: visibleNames && isHighlighted ? `8px solid ${isHighlighted.color}` : null,
      background: !visibleNames && isHighlighted ? isHighlighted.color + 'cc' : null
    }}
    className={`gb-tree-node ${isHighlighted ? 'gb-tree-highlighted' : ''}`}
  >
    <span className="gb-tree-pipe" style={{ width: depth }}></span>
    <span onClick={e => onToggle({ selected: node.key })}
      className={`gb-tree-hover-title gb-tree-color ${childrenLength === 0 ? 'gb-tree-leaf-color' : ''}`}
      style={{
        backgroundColor: isHighlighted ? isHighlighted.color : null,
        boxShadow: isHighlightedLeaf ? '0 0 0 2px #ff6868' : null
      }}
      onMouseEnter={e => onNodeEnter({ e, node })}
      onMouseLeave={e => onNodeLeave({ e, node })}
      // {...titleProp}
      id={`${childrenLength === 0 ? `gb-tree-node-${node.leafIndex}` : null}`}
    >
      {!visibleNames && <span className="gb-tree-color-click-area"></span>}
    </span>
    {visibleNames && childrenLength === 0 && <div className={`gb-tree-content-node ${childrenLength === 0 ? 'gb-tree-leaf' : 'gb-tree-branch'}`}
      onClick={e => onToggle({ selected: node.key })}
      style={{ boxShadow: isHighlightedLeaf ? '0 0 0 2px #ff6868' : null }}
    >
      {node.name && childrenLength === 0 && <span>
        <span>
          <span className="gb-tree-node-name" dangerouslySetInnerHTML={{ __html: node.title }}></span>
        </span>
      </span>}
    </div>}
    {childrenLength > 0 && <ol className="gb-tree-list" style={{ color: isHighlighted ? isHighlighted.color : null }}>
      {node.children.map((x, i) => <SampleTree {...treeProps} parentPosition={node.position} key={x.nodeIndex} node={x} first={i === 0} />)}
    </ol>}
  </li>
}

export function BalancedTree({
  className,
  onToggle,
  highlighted,
  focusedNode,
  tree: treeData = acacia,
  nodeIdMap,
  ...props
}) {
  const ref = useRef(null);
  const [scrollTop] = useScrollAware(ref);
  const [multiplier, setMultiplier] = useState(defaultMultiplier);
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [q, setQ] = useState('');
  const [highlightedLeaf, setHighlightedLeaf] = useState();
  const [elementHeight, setElementHeight] = useState(28);
  const [leafSuggestions, setLeafSuggestions] = useState([]);
  const [visibleNode, setVisibleNodes] = useState({});
  const [tree, setTree] = useState();
  const [hoveredNode, setHoveredNode] = useState();
  const { onMouseDown } = useDraggableScroll(ref);

  useEffect(() => {
    // const contentHeight = Math.floor(fontSize * 1.15 + 2 + fontSize * 2 * 0.25);
    const border = 2;
    const spacing = 2;
    const contentHeight = fontSize * 1.15;
    // const contentHeight = Math.floor(fontSize * 1.15);
    const elementHeight = Math.floor(contentHeight) + border + spacing; //add space around
    if (elementHeight < visibleNamesThreshold + border + spacing) {
      setElementHeight(contentHeight);
    } else {
      setElementHeight(elementHeight);
    }
  }, [fontSize]);

  // perhaps this should be moved to a hook. Since scrolltop updates first, then triggers the effect. This means that the component renders twice.
  useEffect(() => {
    if (!tree) return;
    const node = getVisibleNodes(tree, scrollTop, elementHeight);
    setVisibleNodes(node);
  }, [scrollTop, elementHeight, tree]);

  useEffect(() => {
    const suggestions = Object.keys(nodeIdMap).filter(key => nodeIdMap[key].title && nodeIdMap[key].leafIndex).map(key => ({ key, label: nodeIdMap[key].title.toLowerCase() }));
    setLeafSuggestions(suggestions);
  }, [treeData]);

  // on mount
  useEffect(() => {
    if (!treeData) return;
    const t = JSON.parse(JSON.stringify(treeData));
    decorateTree(t);
    setTree(t);
  }, [treeData]);

  const onNodeEnter = useCallback(({ node }) => {
    setHoveredNode(node);
  }, []);

  const onNodeLeave = useCallback(({ node }) => {
    setHoveredNode();
  }, []);

  useEffect(() => {
    if (focusedNode) {
      scrollToItem({leafIndex: focusedNode.leafIndex});
    }
  }, [focusedNode]);

  const scrollToItem = useCallback(({ leafIndex = 0 }) => {
    let attempts = 0;
    ref.current.scrollTo({ top: elementHeight * leafIndex - 300, behavior: 'smooth' });
    const scrollToElementInterval = setInterval(e => {
      let el = document.getElementById(`gb-tree-node-${leafIndex}`);
      attempts++;
      if (el) {
        setTimeout(e => {
          el.scrollIntoView({
            inline: 'center',
            behavior: 'smooth',
            block: 'center'
          });
        }, 800);
        clearInterval(scrollToElementInterval);
      }
      if (attempts > 50) {
        clearInterval(scrollToElementInterval);
      }
    }, 200);
  }, [elementHeight]);

  const containerWidth = (treeData.childrenLength * multiplier * 1.8 + 400) || 1000; // add some extra (* n + m) due to branch node size and labels
  const minMultiplier = (50 / treeData.childrenLength) || 1;
  const maxMultiplier = (3000 / treeData.childrenLength) || 10000;

  const showScale = !Number.isNaN(treeData.childrenLength);

  const treeProps = {
    onNodeEnter, onNodeLeave, highlighted, highlightedLeaf, onToggle, elementHeight, multiplier
  };

  return <div className="treeArea" style={{ display: 'flex', flexDirection: 'column' }}>
    <div className="tree-controls">
      <AutoComplete
        style={{ width: 400 }}
        value={q}
        onChange={q => {
          if (!q) {
            setQ('');
            setHighlightedLeaf();
          } else {
            setQ(q);
          }
        }}
        onSelect={leafIndex => {
          const selectedNode = nodeIdMap[leafIndex];
          const selectedLeafIndex = selectedNode.leafIndex;
          setHighlightedLeaf(selectedLeafIndex);
          scrollToItem({ leafIndex: selectedLeafIndex });
          setQ('');
        }}
        placeholder="Search tree"
        allowClear
      >
        {leafSuggestions.filter(i => i.label.indexOf(q.toLowerCase()) > -1).map(o => <Option key={o.key} value={o.key} label={o.label}><span dangerouslySetInnerHTML={{ __html: o.label }}></span> </Option>)}
      </AutoComplete>
    </div>
    {hoveredNode && <div className="gb-snack-bar" dangerouslySetInnerHTML={{ __html: hoveredNode.title || `${hoveredNode.firstLeaf} - ${hoveredNode.lastLeaf}` }}>
    </div>}
    <div className="tree-controls">
      <Radio.Group value={fontSize} onChange={e => setFontSize(e.target.value)}>
        <Radio.Button value="3">XS</Radio.Button>
        <Radio.Button value="8">S</Radio.Button>
        <Radio.Button value="12">M</Radio.Button>
        <Radio.Button value="15">L</Radio.Button>
      </Radio.Group>
      {showScale && <label style={{ marginLeft: 12 }}>Horizontal scale
        <input style={{ marginLeft: 12 }} type="range" min={minMultiplier} max={maxMultiplier} value={multiplier} onChange={e => setMultiplier(e.target.value)} />
      </label>}
    </div>
    <StyledTree
      ref={ref}
      onMouseDown={onMouseDown}
      className="tree-tree"
      {...props}>
      {tree && <ol className="gb-tree-list"
        style={{
          fontSize: `${fontSize}px`,
          willChange: "transform",
          position: "relative",
          height: tree.size * elementHeight,
          width: containerWidth
        }}>
        <Tree {...treeProps} scrollTop={scrollTop} node={visibleNode} />
      </ol>}
    </StyledTree>
  </div>
};

BalancedTree.propTypes = {

};