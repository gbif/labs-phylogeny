import React from "react";
import { withRouter } from 'react-router-dom';
import withContext from "../../withContext";
// import Tree from './trees/antTree';
import Tree from './trees/BalancedTree';

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
  matchedNames,
}) => ({
  setNewick,
  setRawTree,
  setNames,
  setMatchedNames,
  rawTree,
  matchedNames,
});

export default withRouter(withContext(mapContextToProps)(TreeWrapper));
