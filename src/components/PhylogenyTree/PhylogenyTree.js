import React from "react";
import styled from "styled-components";
import example from "./example";
import _ from 'lodash';

// Create a Wrapper component that'll render a <section> tag with some styles
const Wrapper = styled.section`
  /* padding: 4em; */
  /* background: papayawhip; */
`;

const Children = styled.ul`
  margin: 0;
  padding-left: 20px;
  position: relative;
`;

const Li = styled.li`
  &:hover {
    background-color: rgba(0, 0, 0, 0.01);
  }
`;

const Box = styled.span`
  display: inline-block;
  width: 1em;
  height: 1em;
`;

function getTree(matchedNames, rawTree) {
  const nameMap = _.keyBy(matchedNames, 'name');
  let keyArray = [];
  let tree = buildTree(nameMap, rawTree, 0, 0, keyArray);
  return {
    tree: tree,
    keyArray
  };
}

function buildTree(nameMap, node, parentKey, index, keyArray) {
  let n = {
    title: node.name ? nameMap[node.name].matchedName : '',
    key: `${parentKey}-${index}`,
    other: {
      ...nameMap[node.name]
    }
  };
  keyArray.push(n.key);
  if (node.name) n.taxonKey = nameMap[node.name].match.usageKey;
  if (node.children) n.children = node.children.map((child, i) => {
    return buildTree(nameMap, child, n.key, i, keyArray);
  });
  return n;
}

function ColorBox({node, highlighted}) {
  if (highlighted && highlighted[node.key]) {
    let color = highlighted[node.key].color;
    return <Box style={{background: color}}></Box>
  }
  return null;
}

class PhylogenyTree extends React.Component {
  constructor(props) {
    super(props);

    let matchedNames = JSON.parse(localStorage.getItem("matchedNames"));
    let rawTree = JSON.parse(localStorage.getItem("rawTree"));
    let {tree, keyArray} = getTree(matchedNames, rawTree);
    this.dataTree = tree;

    this.state = {
      selected: [],
      highlighted: {}
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.highlighted !== this.props.highlighted) {
      this.setState({highlighted: _.keyBy(this.props.highlighted, 'key')})
    }
  }

  clicked = (e, node) => {
    let children = {};
    let checked = this.state.clade !== node.key ? true : e.target.checked;
    this.selectChildren(children, node, checked);
    this.setState({ selected: children, clade: node.key });
    if (this.props.onSelect) {
      this.props.onSelect(_.values(children));
    }
  };

  selectChildren = (list, node, checked) => {
    list[node.key] = node;
    if (node.children)
      node.children.forEach(child => this.selectChildren(list, child, checked));
  };

  renderNode = node => {
    if (node.children) {
      return (
        <Li
          key={node.key}
          dataRef={node}
          name={node.name}
          // style={{
          //   paddingLeft: node.length ? Math.round(node.length * 100) : 0
          // }}
        >
          <div>
            <input type="checkbox" checked={!!this.state.selected[node.key]} onChange={e => this.clicked(e, node)}/>
            {/* {node.name} */}
          </div>
          {node.children && (
            <Children>{node.children.map(this.renderNode)}</Children>
          )}
        </Li>
      );
    } else {
      return (
        <Li
          key={node.key}
          dataRef={node}
          // style={{
          //   paddingLeft: node.length ? Math.round(node.length * 100) : 0
          // }}
        >
          <div>
            <input type="checkbox" checked={!!this.state.selected[node.key]} onChange={e => this.clicked(e, node)}/>
            {node.title} <ColorBox node={node} highlighted={this.state.highlighted}></ColorBox>
          </div>
        </Li>
      );
    }
  };

  render() {
    return (
      <Wrapper>
        <Children>{this.renderNode(this.dataTree)}</Children>
      </Wrapper>
    );
  }
}

export default PhylogenyTree;
