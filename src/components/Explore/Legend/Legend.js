import React, { useState, useCallback, useEffect } from "react";
import { SortableContainer, SortableElement, sortableHandle } from 'react-sortable-hoc';
import { arrayMoveImmutable as arrayMove } from 'array-move';
import './legend.css';
import { MenuOutlined, BranchesOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

const SortableItem = SortableElement(({ value, gotoNode, updateVisiblity }) => {
  const title = value.title ? value.title : `${value.firstLeaf} - ${value.lastLeaf}`;
  return <li className="gb-tree-legend-item">
    <DragHandle style={{ display: 'inline-block' }} />
    <div className="gb-tree-legend-item-color" style={{ backgroundColor: value.color }}></div>
    <div className="gb-tree-legend-item-action">
      <Tooltip title="Toggle visibility in map">
        {!value.visible && <EyeInvisibleOutlined onClick={e => updateVisiblity({ item: { ...value, visible: true } })} />}
        {value.visible && <EyeOutlined onClick={e => updateVisiblity({ item: { ...value, visible: false } })} />}
      </Tooltip>
    </div>
    <div className="gb-tree-legend-item-action">
      <Tooltip title="Zoom to node in tree">
        <BranchesOutlined onClick={e => gotoNode({ node: value })} />
      </Tooltip>
    </div>
    <div dangerouslySetInnerHTML={{ __html: title }} style={{ flex: '1 1 auto' }}></div>
  </li>
});

const SortableList = SortableContainer(({ items, gotoNode, updateVisiblity }) => {
  return (
    <ul>
      {items.map((value, index) => (
        <SortableItem key={`item-${value.key}`} index={index} value={value} updateVisiblity={updateVisiblity} gotoNode={gotoNode} />
      ))}
    </ul>
  );
});

const DragHandle = sortableHandle(() => <MenuOutlined style={{ color: '#aaa', marginRight: 12 }} />);

export default function Legend({ clearSelection, layers, gotoNode, updateVisiblity, updateOrdering, ...props }) {
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
      <SortableList updateVisiblity={updateVisiblity} gotoNode={gotoNode} items={items} onSortEnd={props => onSortEnd({ ...props, items })} useDragHandle />
      {items.length === 0 && <div style={{ textAlign: 'center', color: '#aaa', margin: 12 }}>
        Select a node in the tree to get started
      </div>}
    </div>
  </div>
}