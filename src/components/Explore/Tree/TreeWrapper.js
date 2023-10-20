import React from "react";
import { withRouter } from 'react-router-dom';
import withContext from "../../withContext";
// import Tree from './trees/antTree';
import Tree from './trees/Phylotree';

class TreeWrapper extends React.Component {
  render() {
    return <Tree {...this.props} />
  }
}

const mapContextToProps = ({
  setNewick,
  setRawTree,
  setNames,
  setMatchedNames,
  rawTree,
  newick,
  matchedNames,
  defaultMultiplier,
}) => ({
  setNewick,
  setRawTree,
  setNames,
  setMatchedNames,
  rawTree,
  newick,
  matchedNames,
  defaultMultiplier,
});

export default withRouter(withContext(mapContextToProps)(TreeWrapper));
