import React from "react";
import styled from "styled-components";
import { withRouter } from 'react-router-dom';
import _ from "lodash";
import { Tree, AutoComplete } from "antd";
import withContext from "../withContext";
import { LinkOutlined } from "@ant-design/icons"
// Create a Wrapper component that'll render a <section> tag with some styles
const Option = AutoComplete.Option;

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

const getBoldBin = (originalName) => {
  if (!originalName) {
    return null;
  }
  return originalName.startsWith("BOLD%3A") ? originalName.replace("BOLD%3A", "BOLD:") : null;
}

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

function partition(array, isValid) {
  return array.reduce(([pass, fail], elem) => {
    return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
  }, [[], []]);
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
      colorGroups: [],
      searchList: [],
      searchValue: '',
      filterTreeNodeKey: null
    };

    this.treeRef = React.createRef();

  }
  componentDidMount = () => {
    const { rawTree, matchedNames } = this.props;
    if (!rawTree || !matchedNames) {
      this.props.history.push('/phylogeny')
    } else {
      const processedTree = getTree(matchedNames, rawTree);
      this.setState({
        nodeIdMap: processedTree.nodeIdMap,
        searchList: Object.keys(processedTree.nodeIdMap).filter(key => processedTree.nodeIdMap[key].title).map(key => ({ value: key, label: processedTree.nodeIdMap[key].title })),
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

  createGroups = (groups, checkedKeys) => {
    const grouped = [];
    const { nodeIdMap } = this.state;
    let rest = checkedKeys;
    groups.forEach(g => {
      const [pass, fail] = partition(rest, (e) => e.startsWith(g));
      rest = fail;
      grouped.push([nodeIdMap[g], ...pass.map((key) => nodeIdMap[key])])
    })
    return [grouped, rest.map((key) => nodeIdMap[key])]
  }

  onExpand = (expandedKeys) => {
    this.setState({ expandedKeys, autoExpandParent: false });
  };

  onCheck = (checkedKeys, e) => {
    this.setState({ checkedKeys });
    const { colorGroups } = this.state;
    let groups = colorGroups;
    console.log(e)
    const { node, checked } = e;
    if (checked && node.children) {
      groups.push(node.key)
    } else if ((!checked) && node.children) {
      groups = groups.filter(g => g !== node.key)
    }
    /* 
    Get the selected higher taxa where alle leaves should be same color,
    and the "loose" leaf nodes that are not in a group
    */
    const data = this.createGroups(groups, checkedKeys)
    this.setState({ checkedKeys, colorGroups: groups }, () => {
      if (this.props.onSelect) {
        this.props.onSelect(data[0], data[1]);
      }
    })

  };

  onSelect = (key, e) => {

    let tmp = document.createElement("DIV");
    tmp.innerHTML = e.label;
    const searchValue = tmp.textContent || tmp.innerText || "";

    this.setState({ searchValue, filterTreeNodeKey: key })
    this.treeRef.current.scrollTo({ key, align: 'top', offset: 24 })
  };

  titleRender = (node) => {
    const ottid = getOtlId(node.other.originalNodeName);
    const boldBin = getBoldBin(node.other.originalNodeName);
    const labelStyle = ottid ? { display: "inline-block", lineHeight: "16px" } : { display: "inline-block" };

    return (
      <div>
        {node.other.branch_length && <div style={{ fontSize: "8px", position: "absolute", bottom: "-12px", left: "-28px" }}>{Math.round(node.other.branch_length * 10000 + Number.EPSILON) / 10000}</div>}
        <ColorBox node={node} highlighted={this.state.highlighted}></ColorBox>
        <span style={labelStyle}>
          <span dangerouslySetInnerHTML={{ __html: node.title }}></span>
          {boldBin && (
            <>
              {" "}
              <a
                href={`https://www.boldsystems.org/index.php/Public_BarcodeCluster?clusteruri=${boldBin}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    `https://www.boldsystems.org/index.php/Public_BarcodeCluster?clusteruri=${boldBin}`
                  );
                }}
              >
                <LinkOutlined />

              </a>
            </>
          )}
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
      searchList,
      searchValue,
      filterTreeNodeKey
    } = this.state;
    const vh = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );

    return (
      <div className="phylo-tree">
        {/*       <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={this.onChange} allowClear/>
 */}      <AutoComplete

          style={{
            width: 400,
          }}
          value={searchValue}
          onChange={searchValue => {
            if (!searchValue) {
              this.setState({ searchValue, filterTreeNodeKey: null })

            } else {
              this.setState({ searchValue })
            }

          }}
          onSelect={this.onSelect}
          placeholder="Search tree"
          allowClear
        >
          {searchList.filter(i => i.label.indexOf(searchValue) > -1).map(o => <Option value={o.value} label={o.label}><span dangerouslySetInnerHTML={{ __html: o.label }}></span> </Option>)}
        </AutoComplete>
        <Tree
          ref={this.treeRef}
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
          filterTreeNode={(node) => {
            return node.key === filterTreeNodeKey;
          }}
          height={vh - 140}
        />
      </div>
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
