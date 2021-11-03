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
import withContext from "../withContext";
import SplitPane from "react-split-pane"; // https://github.com/tomkp/react-split-pane
import _ from "lodash";
import './explore.css';

//let catCol = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928', '#000080', ];
let catCol = ['#FF6633', '#FF33FF', '#FFFF99', '#00B3E6',
  '#E6B333', '#3366E6', '#FFB399', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

let colorPool = catCol;

function getColor() {
  if (colorPool.length === 0) return;
  let c = colorPool.pop();
  return c;
}

function dropColor(c) {
  colorPool.push(c);
}

class Explore extends React.Component {
  constructor(props) {
    super(props);
    const { tree, nodeIdMap, nameMap, node2LeafTaxonKeys } = this.getEnrichedTree();
    this.state = { taxa: [], selected: {}, tree, nodeIdMap, nameMap, node2LeafTaxonKeys };
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
    const nameMap = _.keyBy(this.props.matchedNames, "name");
    let nodeIdMap = {};
    let {tree, node2LeafTaxonKeys} = buildTree(nameMap, this.props.rawTree, 0, 0, nodeIdMap);
    return {
      tree,
      nameMap,
      nodeIdMap,
      node2LeafTaxonKeys
    }
  }

  refreshSizes = e => {
    this.setState({ shouldRefresh: true })
  }

  onToggle = ({ selected }) => {
    const node = this.state.nodeIdMap[selected];
    if (this.state.selected[node.key]) {
      let n = { ...this.state.selected };
      delete n[node.key];
      dropColor(this.state.selected[node.key].color);
      this.setState({ selected: n })
    } else {
      if (!this.state.node2LeafTaxonKeys[node.key]) return;
      this.setState({
        selected: {
          ...this.state.selected, [node.key]: {
            color: getColor(),
            taxonKeys: this.state.node2LeafTaxonKeys[node.key],
            visibleTaxonKeys: this.state.node2LeafTaxonKeys[node.key].slice(0,200),
            layerName: node.key
          }
        }
      });
    }
  }

  render() {
    let shouldRefresh = false;
    if (this.state.shouldRefresh) {
      this.setState({ shouldRefresh: false });
      shouldRefresh = true;
    }
    return (
      <SplitPane split="vertical" minSize={300} defaultSize={700} style={{ overflow: 'hidden', height: 'calc(100vh - 68px)' }} onDragFinished={this.refreshSizes}>
        <div className="treeCard">
          <PhylogenyTree nodeIdMap={this.state.nodeIdMap} tree={this.state.tree} onToggle={this.onToggle} onSelect={this.onSelect} highlighted={this.state.selected}></PhylogenyTree>
        </div>
        {this.state.showMap ? <Map shouldRefresh={shouldRefresh} selected={this.state.selected} max={catCol.length} totalSelected={this.state.totalSelected}></Map> : <div>Loading</div>}
      </SplitPane>
    );
  }
}

const mapContextToProps = ({
  setNewick,
  setRawTree,
  setNames,
  setMatchedNames,
  rawTree,
  matchedNames,
}) => ({
  setNewick,
  setRawTree,
  setNames,
  setMatchedNames,
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
      leafIndex: leafIndex,
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
      leafIndex++;
      node2LeafTaxonKeys[n.key] = n.taxonKey ? [n.taxonKey] : [];
      n.firstLeaf = n.title;
      n.lastLeaf = n.title;
    }
    if (node.children) {
      n.children = node.children.map((child, i) => {
        return recursive(nameMap, child, n.key, i, nodeIdMap);
      });
      const childTaxa = _.union(...(n.children.map(x => node2LeafTaxonKeys[x.key])));
      const firstLeaf = n.children[0].firstLeaf;
      const lastLeaf = n.children[n.children.length - 1].lastLeaf;
      n.firstLeaf = firstLeaf;
      n.lastLeaf = lastLeaf;
      node2LeafTaxonKeys[n.key] = childTaxa;
    }
    return n;
  }

  let tree = recursive(nameMap, node, parentKey, index, nodeIdMap);
  return { tree, node2LeafTaxonKeys };
}