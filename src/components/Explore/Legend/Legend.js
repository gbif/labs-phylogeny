import React, { useState, useCallback, useEffect } from "react";
import { SortableContainer, SortableElement, sortableHandle } from 'react-sortable-hoc';
import { arrayMoveImmutable as arrayMove } from 'array-move';
import './legend.css';
import { MenuOutlined, BranchesOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeOutlined, FilterOutlined as SearchIcon } from '@ant-design/icons';
import { Tooltip } from 'antd';
import withContext from "../../withContext";

const SortableItem = SortableElement(({ value, gotoNode, removeNode, updateVisiblity, updateColor, searchTemplate }) => {
  const [color, setColor] = useState(value.color);
  
  useEffect(() => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        if (color !== value.color)
        updateColor({ node: value, color });
      }, 200);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, updateColor, color] // Only re-call effect if value or delay changes
  );

  const title = value.title ? value.title : `${value.firstLeaf} - ${value.lastLeaf}`;
  
  const query = value.taxonKeys.map(x => `taxonKey=${x}`).join('&');
  let queryUrl;
  if (searchTemplate){
    queryUrl = searchTemplate.replace().replace('{query}', query);
  }

  return <li className="gb-tree-legend-item">
    <DragHandle />
    <input className="gb-tree-legend-item-color" type="color" onChange={e => setColor(e.target.value)} value={color} />
    <div className="gb-tree-legend-item-action">
      <Tooltip title="Toggle visibility in map" mouseLeaveDelay={0}>
        {!value.visible && <EyeInvisibleOutlined onClick={e => updateVisiblity({ item: { ...value, visible: true } })} />}
        {value.visible && <EyeOutlined onClick={e => updateVisiblity({ item: { ...value, visible: false } })} />}
      </Tooltip>
    </div>
    <div className="gb-tree-legend-item-action">
      <Tooltip title="Zoom to node in tree" mouseLeaveDelay={0}>
        <BranchesOutlined onClick={e => gotoNode({ node: value })} />
      </Tooltip>
    </div>
    {queryUrl && <div className="gb-tree-legend-item-action">
      <Tooltip title="Explore occurrences" mouseLeaveDelay={0}>
        <a target="_blank" rel="noopener noreferrer" href={queryUrl} style={{color: 'inherit'}}><SearchIcon /></a>
      </Tooltip>
    </div>}
    <div dangerouslySetInnerHTML={{ __html: title }} style={{ flex: '1 1 auto', color: value.visible ? null : '#aaa' }}></div>
    <DeleteOutlined onClick={e => removeNode({ node: value })} />
  </li>
});

const SortableList = SortableContainer(({ items, removeNode, gotoNode, updateVisiblity, updateColor, searchTemplate }) => {
  return (
    <ul>
      {items.map((value, index) => (
        <SortableItem key={`item-${value.key}`} index={index} value={value} updateVisiblity={updateVisiblity} gotoNode={gotoNode} updateColor={updateColor} removeNode={removeNode} searchTemplate={searchTemplate}/>
      ))}
    </ul>
  );
});

const DragHandle = sortableHandle(() => <MenuOutlined style={{ display: 'inline-block', cursor: 'grab', color: '#aaa', marginRight: 12 }} />);

function Legend({ clearSelection, removeNode, layers, gotoNode, updateColor, updateVisiblity, updateOrdering, searchTemplate, ...props }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const isNotOrdered = Object.keys(layers).find(key => typeof layers[key].sortIndex === 'undefined');
    let semiOrderedItems = Object.keys(layers)
      .map(key => ({ ...layers[key], key }))
      .map((e, i) => ({ sortIndex: 99999, ...e }))
      .sort((firstEl, secondEl) => { return firstEl.sortIndex - secondEl.sortIndex });

    if (isNotOrdered) {
      let orderedItems = semiOrderedItems.map((e, i) => ({ ...e, sortIndex: i }));
      updateOrdering({ orderedItems });
      setItems(orderedItems);
    } else {
      setItems(semiOrderedItems);
    }
  }, [layers]);

  const onSortEnd = useCallback(({ items, oldIndex, newIndex }) => {
    const reordered = arrayMove(items, oldIndex, newIndex);
    reordered.forEach((x, i) => x.sortIndex = i);
    updateOrdering({ orderedItems: reordered });
  }, []);

  return <div className="legendCard">
    <div className="legendHeader">
      <div>
        {items.length === 0 && <div>Nothing selected</div>}
        {items.length === 1 && <div>1 taxon selected</div>}
        {items.length > 1 && <div>{items.length} taxa selected</div>}
      </div>
      <div><DeleteOutlined onClick={e => clearSelection()} /></div>
    </div>
    <div className="legendList">
      <SortableList removeNode={removeNode} updateVisiblity={updateVisiblity} updateColor={updateColor} gotoNode={gotoNode} items={items} onSortEnd={props => onSortEnd({ ...props, items })} searchTemplate={searchTemplate} useDragHandle />
      {items.length === 0 && <div style={{ textAlign: 'center', color: '#aaa', margin: 12 }}>
        Select a node in the tree to get started
      </div>}
    </div>
  </div>
}

const mapContextToProps = ({
  searchTemplate,
}) => ({
  searchTemplate,
});

export default withContext(mapContextToProps)(Legend);