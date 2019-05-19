import React from "react";
import { Tree } from "antd";
import _ from 'lodash';
const { TreeNode } = Tree;

const treeData = [
  {
    title: "",
    key: "0-0",
    children: [
      {
        title: "",
        key: "0-0-0",
        children: [
          { title: "0-0-0-0", key: "0-0-0-0" },
          { title: "0-0-0-1", key: "0-0-0-1" },
          { title: "0-0-0-2", key: "0-0-0-2" }
        ]
      },
      {
        title: "0-0-1",
        key: "0-0-1",
        children: [
          { title: "0-0-1-0", key: "0-0-1-0" },
          { title: "0-0-1-1", key: "0-0-1-1" },
          {
            title: "0-0-0-0-1",
            key: "0-0-0-0-1",
            children: [
              { title: "0-0-0-1-0", key: "0-0-0-1-0" },
              { title: "0-0-0-1-1", key: "0-0-0-1-1" },
              { title: "0-0-0-1-2", key: "0-0-0-1-2" }
            ]
          }
        ]
      },
      {
        title: "0-0-2",
        key: "0-0-2"
      }
    ]
  },
  {
    title: "0-1",
    otherProd: 3,
    key: "0-1",
    children: [
      { title: "0-1-0-0", key: "0-1-0-0" },
      { title: "0-1-0-1", key: "0-1-0-1" },
      { title: "0-1-0-2", key: "0-1-0-2" }
    ]
  },
  {
    title: "0-2",
    key: "0-2"
  }
];

function getTree(matchedNames, rawTree) {
  const nameMap = _.keyBy(matchedNames, 'name');
  let keyArray = [];
  let tree = buildTree(nameMap, rawTree, 0, 0, keyArray);
  return {
    tree: [tree],
    keyArray
  };
}

function buildTree(nameMap, node, parentKey, index, keyArray) {
  let n = {
    title: node.name ? nameMap[node.name].matchedName : '',
    key: `${parentKey}-${index}`
  };
  keyArray.push(n.key);
  if (node.name) n.taxonKey = nameMap[node.name].key;
  if (node.children) n.children = node.children.map((child, i) => {
    return buildTree(nameMap, child, n.key, i, keyArray);
  });
  return n;
}

class PhyloTree extends React.Component {
  constructor(props) {
    super(props);
    let matchedNames = JSON.parse(localStorage.getItem("matchedNames"));
    let rawTree = JSON.parse(localStorage.getItem("rawTree"));
    let {tree, keyArray} = getTree(matchedNames, rawTree);
    this.dataTree = tree;
    // let names = [];
    // try {
    //   names = namesString ? JSON.parse(namesString) : [];
    // } catch (err) {
    //   console.error("invalid names array loaded from storage");
    // }

    this.state = {
      expandedKeys: keyArray,
      autoExpandParent: true,
      checkedKeys: ["0-0-0"],
      selectedKeys: []
    };
  }

  onExpand = expandedKeys => {
    console.log("onExpand", expandedKeys);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false
    });
  };

  onCheck = (checkedKeys, e) => {
    console.log("onCheck", checkedKeys);
    console.log("onCheck", e);
    console.log("onCheck", e.node);
    let keys = [];
    // this.checkNode(e.node.props.dataRef, keys);
    console.log(keys);
    this.setState({ checkedKeys });
  };

  checkNode = (node, keys) => {
    const c = this.checkNode;
    if (node.key) keys.push(node.key);
    if (node.children) node.children.forEach(n => c(n, keys));
  };

  onSelect = (selectedKeys, info) => {
    console.log("onSelect", info);
    this.setState({ selectedKeys });
  };

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });

  render() {
    return (
      <Tree
        checkable
        blockNode
        onExpand={this.onExpand}
        expandedKeys={this.state.expandedKeys}
        autoExpandParent={this.state.autoExpandParent}
        onCheck={this.onCheck}
        checkedKeys={this.state.checkedKeys}
        onSelect={this.onSelect}
        selectedKeys={this.state.selectedKeys}
      >
        {this.renderTreeNodes(this.dataTree)}
      </Tree>
    );
  }
}

export default PhyloTree;
