import React from "react";
import styled from "styled-components";
import { withRouter } from 'react-router-dom';
import _ from "lodash";
import { Tree } from "antd";
import withContext from "../withContext";
// Create a Wrapper component that'll render a <section> tag with some styles

const Box = styled.span`
  width: 1em;
  height: 1em;
  vertical-align: top;
  margin-top: 5px;
`;

const getOtlId = (originalName) => {
  if (!originalName) {
    return null;
  }
  const splitted = originalName.split("_");
  const mayBeAnOttId = splitted[splitted.length - 1];
  return mayBeAnOttId.match(/ott\d{3,}/) || null;
};

function getTree(matchedNames, rawTree) {
  const nameMap = _.keyBy(matchedNames, "name");
  let nodeIdMap = {};
  let tree = buildTree(nameMap, rawTree, 0, 0, nodeIdMap);
  return {
    tree: tree,
    nodeIdMap,
    nameMap,
  };
}

function buildTree(nameMap, node, parentKey, index, nodeIdMap) {
  let n = {
    title: node.name ? nameMap[node.name].matchedName : node.name,
    key: `${parentKey}-${index}`,
    other: {
      originalNodeName: node.name,
      branch_length: node.branch_length,
      ...nameMap[node.name],
    },
  };
  nodeIdMap[n.key] = n;
  if (node.name) n.taxonKey = nameMap[node.name].match.usageKey;
  if (node.children)
    n.children = node.children.map((child, i) => {
      return buildTree(nameMap, child, n.key, i, nodeIdMap);
    });
  return n;
}

function ColorBox({ node, highlighted }) {
  if (highlighted && highlighted[node.key]) {
    let color = highlighted[node.key].color;
    return (
      <Box
        style={{
          background: color,
          marginRight: "6px",
          display: "inline-block",
        }}
      ></Box>
    );
  }
  return null;
}

class PhylogenyTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedKeys: [],
      nodeIdMap: {},
      checkedKeys: [],
      autoExpandParent: false,
      highlighted: {},
      treeData: [],
    };
  }

  onExpand = (expandedKeys) => {
    this.setState({ expandedKeys });
  };

  onCheck = (checkedKeys) => {
    this.setState({ checkedKeys });
    const { nodeIdMap } = this.state;
    if (this.props.onSelect) {
      this.props.onSelect(checkedKeys.map((key) => nodeIdMap[key]));
    }
  };
  componentDidMount = () => {
    const { rawTree, matchedNames } = this.props;
    if(!rawTree || !matchedNames){
        this.props.history.push('/phylogeny')
    } else {
        const processedTree = getTree(matchedNames, rawTree);
    this.setState({
      nodeIdMap: processedTree.nodeIdMap,
      treeData: [processedTree.tree],
      expandedKeys: Object.keys(processedTree.nodeIdMap),
    });
    }

  };
  componentDidUpdate(prevProps) {
    if (prevProps.highlighted !== this.props.highlighted) {
      this.setState({
        highlighted: _.keyBy(this.props.highlighted, "key"),
        treeData: [...this.state.treeData],
      });
    }
  }

  titleRender = (node) => {
    const ottid = getOtlId(node.other.originalNodeName);
    return (
      <div>
        {node.other.branch_length && <div style={{fontSize: "8px", position: "absolute", bottom: "-12px", left: "-30px"}}>{Math.round( node.other.branch_length * 10000 + Number.EPSILON ) / 10000}</div>}
        <ColorBox node={node} highlighted={this.state.highlighted}></ColorBox>
        <span style={{ display: "inline-block" }}>
          {node.title}
          <br />
          {ottid && (
            <a
              style={{ fontSize: "11px" }}
              href={`https://tree.opentreeoflife.org/opentree/argus/opentree12.3@${ottid}`}
              onClick={(e) => {
                e.preventDefault();
                window.open(
                  `https://tree.opentreeoflife.org/opentree/argus/opentree12.3@${ottid}`
                );
              }}
            >
              {node.other.originalNodeName}
            </a>
          )}
        </span>
      </div>
    );
  };
  render() {
    const {
      expandedKeys,
      autoExpandParent,
      checkedKeys,
      treeData,
    } = this.state;
    const vh = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );

    return (
      <Tree
        showLine={{ showLeafIcon: false }}
        checkable
        selectable={false}
        defaultExpandAll
        onExpand={this.onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onCheck={this.onCheck}
        checkedKeys={checkedKeys}
        treeData={treeData}
        titleRender={this.titleRender}
        height={vh - 108}
      />
      /*  <Children>{this.renderNode(getTree(matchedNames, rawTree).tree)}</Children> */
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
export default withRouter(withContext(mapContextToProps)(PhylogenyTree));
