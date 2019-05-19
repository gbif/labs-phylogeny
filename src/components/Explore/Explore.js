import React from "react";
import { Button, Typography, Card, Input } from "antd";
import { withRouter } from "react-router-dom";
import Phylogeny from "./Phylogeny";
import Map from './Map';
// https://github.com/tomkp/react-split-pane
import SplitPane from "react-split-pane";

const { Paragraph } = Typography;

class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { taxa: [] };
  }

  setTaxonKeys = taxa => {
    this.setState({ taxa: taxa });
  };

  refreshSizes = e => {
    this.setState({shouldRefresh: true})
  }

  render() {
    let shouldRefresh = false;
    if (this.state.shouldRefresh) {
      this.setState({shouldRefresh: false});
      shouldRefresh = true;
    }
    return (
      <SplitPane split="vertical" minSize={300} defaultSize={300} style={{overflow: 'auto', height: 'calc(100vh - 68px)'}} onDragFinished={this.refreshSizes}>
        <Phylogeny setTaxonKeys={this.setTaxonKeys} />
        <Map shouldRefresh={shouldRefresh}></Map>
      </SplitPane>
    );
  }
}

export default withRouter(Upload);
