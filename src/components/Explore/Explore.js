/*
Wrapper responsibilities

JOB
Communicate between map and tree.

STATE
manage list of selected taxa and maps them to a color.
Allows the user to change their prefered tree viewer.
possibly a way to change color swatch

And it will manage the ordering of the layers so that parent levels are in the back

It process selected taxa into groups with their children.

It would probably make sense to decorate a shared tree first.
Which ought to be considered immutable.
{branch_length, name, formattedName, children, depth, totalLength, maxChildLength, type[OTL, BOLD, GBIF], url?}

MAP JOB
show layers and decides wether to split a group into multiple calls or concatenate them.
consider a server side component for this to handle large amounts of concurrently selected layers
https://github.com/mapbox/tile-decorator

*/


import React from "react";
import { withRouter } from "react-router-dom";
import PhylogenyTree from "./Tree";
import Map from './Map';
import Legend from './Legend';
import { notification } from 'antd';

import withContext from "../withContext";
import SplitPane from "react-split-pane"; // https://github.com/tomkp/react-split-pane
import _ from "lodash";
import './explore.css';

let colorPool = [
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6',
  '#6a3d9a',
  '#ffff99',
  '#b15928',
];
const preferedColors = JSON.parse(JSON.stringify(colorPool));

const randomColor = () => `#${Math.floor(Math.random()*16777215).toString(16)}`.padEnd(7, 8);

function getColor() {
  const optionsLeft = colorPool.length;
  if (optionsLeft === 0) return randomColor();
  const randomIndex = Math.floor(Math.random() * optionsLeft);
  const c = colorPool.splice(randomIndex, 1)[0];
  return c;
}

function dropColor(c) {
  if (preferedColors.indexOf(c) > -1) {
    colorPool.push(c);
  }
}

const openNotificationWithIcon = ({ type, total, limit }) => {
  notification[type]({
    duration: 10,
    message: 'Sub tree too large to display',
    description:
      `The selected sub tree has ${total} leaf nodes. Only the first ${limit} will be shown on the map. Consider splitting the selection into smaller sub trees.`
  });
};

class Explore extends React.Component {
  constructor(props) {
    super(props);
    const { tree, nodeIdMap, nameMap, node2LeafTaxonKeys } = this.getEnrichedTree();
    this.state = { taxa: [], selected: {}, tree, nodeIdMap, nameMap, node2LeafTaxonKeys, error: !tree };
  }

  componentDidMount = () => {
    setTimeout(() => this.setState({ showMap: true }), 400);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.rawTree !== this.props.rawTree || prevProps.matchedNames !== this.props.matchedNames) {
      const { tree, nodeIdMap, nameMap, node2LeafTaxonKeys } = this.getEnrichedTree();
      this.setState({ tree: tree, nodeIdMap, nameMap, node2LeafTaxonKeys });
    }
  }

  getEnrichedTree = () => {
    // Create a decorated tree with extra properties that are useful when visualizing
    const matchedNames = this.props.matchedNames; // injected via from context
    const rawTree = this.props.rawTree; // injected via from context
          
    if (matchedNames && rawTree) {
      const nameMap = _.keyBy(this.props.matchedNames, "name");
      let nodeIdMap = {};
      let { tree, node2LeafTaxonKeys } = buildTree(nameMap, this.props.rawTree, 0, 0, nodeIdMap);
      return {
        tree,
        nameMap,
        nodeIdMap,
        node2LeafTaxonKeys
      }
    } else {
      return {};
    }
  }

  refreshSizes = e => {
    this.setState({ shouldRefresh: true })
  }

  updateOrdering = ({ orderedItems }) => {
    let s = {};
    orderedItems.forEach(x => {
      s[x.key] = x;
    });
    this.setState({selected: s});
  };

  clearSelection = () => {
    this.setState({selected: {}})
  };

  removeNode = ({ node }) => {
    let n = { ...this.state.selected };
    delete n[node.key];
    dropColor(this.state.selected[node.key].color);
    this.setState({ selected: n })
  }

  updateColor = ({ color, node }) => {
    this.setState({selected: {...this.state.selected, [node.key]: {...node, color}}});
  }

  gotoNode = ({ node }) => {
    this.setState({focusedNode: {node, leafIndex: node.firstLeafIndex}});
  };

  updateVisiblity = ({ item }) => {
    this.setState({selected: {...this.state.selected, [item.key]: item}});
  };

  onToggle = ({ selected }) => {
    const node = this.state.nodeIdMap[selected];
    if (this.state.selected[node.key]) {
      this.removeNode({node: node})
    } else {
      if (!this.state.node2LeafTaxonKeys[node.key]) return;
      this.setState({
        selected: {
          ...this.state.selected, [node.key]: {
            color: getColor(),
            taxonKeys: this.state.node2LeafTaxonKeys[node.key],
            visibleTaxonKeys: this.state.node2LeafTaxonKeys[node.key].slice(0, 200),
            layerName: node.key,
            title: node.title,
            firstLeaf: node.firstLeaf,
            firstLeafIndex: node.firstLeafIndex,
            lastLeaf: node.lastLeaf,
            leafIndex: node.leafIndex,
            visible: true
          }
        }
      });
      if (this.state.node2LeafTaxonKeys[node.key].length > 200) {
        openNotificationWithIcon({ type: 'warning', total: this.state.node2LeafTaxonKeys[node.key].length, limit: 200 })
      }
    }
  }

  render() {
    let shouldRefresh = false;
    if (this.state.shouldRefresh) {
      this.setState({ shouldRefresh: false });
      shouldRefresh = true;
    }
    if (this.state.error) {
      return <div>No tree loaded, please upload your phylogeny first</div>
    }
    return (
      <SplitPane split="vertical" minSize={200} defaultSize="50%" primary="second" style={{ overflow: 'hidden', height: this.props.hideNavigation ? '100vh' : 'calc(100vh - 68px)' }} onDragFinished={this.refreshSizes}>
        <div className="treeCard">
          <PhylogenyTree focusedNode={this.state.focusedNode} nodeIdMap={this.state.nodeIdMap} tree={this.state.tree} onToggle={this.onToggle} onSelect={this.onSelect} highlighted={this.state.selected}></PhylogenyTree>
        </div>
        <SplitPane split="horizontal" defaultSize={200} primary="second" style={{ overflow: 'hidden', height: 'calc(100vh - 68px)' }} onDragFinished={this.refreshSizes}>
          {this.state.showMap ? <Map shouldRefresh={shouldRefresh} selected={this.state.selected} totalSelected={this.state.totalSelected}></Map> : <div>Loading</div>}
          <Legend removeNode={this.removeNode} updateColor={this.updateColor} gotoNode={this.gotoNode} clearSelection={this.clearSelection} updateVisiblity={this.updateVisiblity} updateOrdering={this.updateOrdering} layers={this.state.selected} />
        </SplitPane>
      </SplitPane>
    );
  }
}

const mapContextToProps = ({
  rawTree,
  matchedNames,
}) => ({
  rawTree,
  matchedNames,
});

export default withRouter(withContext(mapContextToProps)(Explore));





function buildTree(nameMap, node, parentKey, index, nodeIdMap) {
  let nodeIndex = 0;
  let leafIndex = 0;
  let node2LeafTaxonKeys = {};

  function recursive(nameMap, node, parentKey, index, nodeIdMap) {
    const children = node.children || [];
    let n = {
      title: node.name ? nameMap[node.name].matchedName : node.name,
      key: `${parentKey}-${index}`,
      branch_length: node.branch_length,
      name: node.name,
      nodeIndex: nodeIndex,
      other: {
        originalNodeName: node.name,
        branch_length: node.branch_length,
        ...nameMap[node.name],
      },
    };
    nodeIndex++;
    nodeIdMap[n.key] = n;
    if (node.name) n.taxonKey = nameMap[node.name].match.usageKey;
    if (children.length === 0) {
      n.leafIndex = leafIndex;
      leafIndex++;
      node2LeafTaxonKeys[n.key] = n.taxonKey ? [n.taxonKey] : [];
      n.firstLeaf = n.title;
      n.firstLeafIndex = n.leafIndex;
      n.lastLeaf = n.title;
      n.childrenLength = 0;
    }
    if (node.children) {
      n.children = node.children.map((child, i) => {
        return recursive(nameMap, child, n.key, i, nodeIdMap);
      });
      const childrenLength = n.children.reduce((maxLength, a) => Math.max(maxLength, a.childrenLength + a.branch_length), 0);
      n.childrenLength = childrenLength;
      const childTaxa = _.union(...(n.children.map(x => node2LeafTaxonKeys[x.key])));
      const firstLeaf = n.children[0].firstLeaf;
      const firstLeafIndex = n.children[0].firstLeafIndex;
      const lastLeaf = n.children[n.children.length - 1].lastLeaf;
      n.firstLeaf = firstLeaf;
      n.firstLeafIndex = firstLeafIndex;
      n.lastLeaf = lastLeaf;
      node2LeafTaxonKeys[n.key] = childTaxa;
    }
    return n;
  }

  try {
    let tree = recursive(nameMap, node, parentKey, index, nodeIdMap);

    return { tree, node2LeafTaxonKeys };
  } catch(err) {
    return {};
  };
}