import React, { useState, useEffect, useRef } from 'react';
import { StyledTree } from './styles2';
import acacia from './simple2.json';
import './tree.css';
import { Radio } from 'antd';

const defaultFontSize = 12;
const defaultMultiplier = 1000;
const visibleNamesThreshold = 10;

// Generic hook for detecting scroll:
const useScrollAware = () => {
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef();

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

  return [scrollTop, ref];
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

function SampleTree({ highlighted, onToggle, hasVisibleParent, node, parentPosition = 0, first = true, scrollTop, multiplier, root, last, elementHeight = 20, ...props }) {
  if (!node) return null;
  if (!node.size) return null;
  const isHighlighted = highlighted[node.key];
  const visibleNames = elementHeight >= visibleNamesThreshold;
  node.children = node.children || [];
  const childrenLength = node.children.length;
  const depth = node.branch_length * multiplier || 0;

  if (node.size * elementHeight < 10 && childrenLength > 0) {
    const totalDepth = node.childrenLength * multiplier;
    return <li style={{ height: node.size * elementHeight, paddingLeft: depth }}
      className="gb-tree-node">
      <span className="gb-tree-pipe" style={{ width: depth }}></span>
      <div className="gb-tree-content-node" >
        {node.name && <span className="gb-tree-hover-title" gbtitle={childrenLength === 0 && elementHeight < visibleNamesThreshold ? node.name : null}>
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
      background: !visibleNames && isHighlighted ? isHighlighted.color : null
    }}
    className={`gb-tree-node ${isHighlighted ? 'gb-tree-highlighted' : ''}`}
    onClick={e => {
      onToggle({ selected: node.key });
      e.stopPropagation();
      return false;
    }}
  >
    <span className="gb-tree-pipe" style={{ width: depth }}></span>
    <span onClick={e => onToggle({ selected: node.key })}
      className={`gb-tree-hover-title gb-tree-color ${childrenLength === 0 ? 'gb-tree-leaf-color' : ''}`}
      style={{ backgroundColor: isHighlighted ? isHighlighted.color : null }}
      gbtitle={childrenLength === 0 && elementHeight < visibleNamesThreshold ? node.title : `${node.firstLeaf} - ${node.lastLeaf}`}
      id={`${childrenLength === 0 ? `gb-tree-node-${node.leafIndex}` : null}`}
    ></span>
    {visibleNames && <div className={`gb-tree-content-node ${childrenLength === 0 ? 'gb-tree-leaf' : 'gb-tree-branch'}`} onClick={e => onToggle({ selected: node.key })}>
      {/* {childrenLength === 0 && <>
        <span>{node.name}</span>
      </>} */}
      {node.name && childrenLength === 0 && <span>
        <span>
          <span className="gb-tree-node-name" dangerouslySetInnerHTML={{ __html: node.title }}></span>
        </span>
        {/* {elementHeight < visibleNamesThreshold && <span className="gb-tree-color" style={{backgroundColor: isHighlighted ? isHighlighted.color : null}}></span>} */}
      </span>}
      {/* {childrenLength > 0 && <div className="gb-tree-color" style={{backgroundColor: isHighlighted ? isHighlighted.color : null}} onClick={e => onToggle({selected: node.key})}></div>} */}
    </div>}
    {childrenLength > 0 && <ol className="gb-tree-list" style={{ color: isHighlighted ? isHighlighted.color : null }}>
      {node.children.map((x, i) => <SampleTree highlighted={highlighted} onToggle={onToggle} parentPosition={node.position} key={x.nodeIndex} node={x} multiplier={multiplier} first={i === 0} last={childrenLength - 1 === i} elementHeight={elementHeight} />)}
    </ol>}
  </li>
}

export function BalancedTree({
  className,
  onToggle,
  highlighted,
  tree: treeData = acacia,
  ...props
}) {
  const [scrollTop, ref] = useScrollAware();
  const [multiplier, setMultiplier] = useState(defaultMultiplier);
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [elementHeight, setElementHeight] = useState(28);
  const [visibleNode, setVisibleNodes] = useState({});
  const [tree, setTree] = useState();

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

  // on mount
  useEffect(() => {
    if (!treeData) return;
    const t = JSON.parse(JSON.stringify(treeData));
    decorateTree(t);
    setTree(t);
  }, [treeData]);

  return <div className="treeArea" style={{ display: 'flex', flexDirection: 'column' }}>
    <div className="tree-controls">
      <Radio.Group value={fontSize} onChange={e => setFontSize(e.target.value)}>
        <Radio.Button value="3">XS</Radio.Button>
        <Radio.Button value="8">S</Radio.Button>
        <Radio.Button value="12">M</Radio.Button>
        <Radio.Button value="15">L</Radio.Button>
      </Radio.Group>
      <label style={{marginLeft: 12}}>Branch length
        <input style={{marginLeft: 12}} type="range" min={1} max={10000} value={multiplier} onChange={e => setMultiplier(e.target.value)} />
      </label>

      {/* <button onClick={e => {
        const leafIndex = 336;
        let attempts = 0;
        ref.current.scrollTo({ top: elementHeight * leafIndex, behavior: 'smooth' });
        const scrollToElementInterval = setInterval(e => {
          let el = document.getElementById(`gb-tree-node-${leafIndex}`);
          console.log('triggered');
          console.log(el);
          attempts++;
          if (el) {
            setTimeout(e => el.scrollIntoView({
              inline: 'center',
              behavior: 'smooth',
              block: 'center'
            }), 100);
            clearInterval(scrollToElementInterval);
          }
          if (attempts > 100) {
            clearInterval(scrollToElementInterval);
          }
        }, 50);
      }}>380</button> */}
    </div>
    <StyledTree
      ref={ref}
      className="tree-tree"
      {...props}>
      {tree && <ol className="gb-tree-list"
        style={{
          fontSize: `${fontSize}px`,
          willChange: "transform",
          position: "relative",
          height: tree.size * elementHeight,
          width: 2000
        }}>
        <SampleTree highlighted={highlighted} onToggle={onToggle} scrollTop={scrollTop} node={visibleNode} root={true} multiplier={multiplier} elementHeight={elementHeight} />
      </ol>}
    </StyledTree>
  </div>
};

BalancedTree.propTypes = {

};