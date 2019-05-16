import React from "react";
import { Button, Typography, Card, Input } from "antd";
import { withRouter } from "react-router-dom";
import Phylogeny from "./Phylogeny";
import SplitPane from "react-split-pane";

const { Paragraph } = Typography;

// bedste bud er nok. Og vist det der bruges på phylolink
// http://phylotree.hyphy.org/documentation/examples.html

class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { taxa: [] };
  }

  setTaxonKeys = taxa => {
    this.setState({ taxa: taxa });
  };

  render() {
    return (
      <SplitPane split="vertical" minSize={300} defaultSize={300}>
        <Card >
          <Phylogeny setTaxonKeys={this.setTaxonKeys} />
        </Card>
        <Card >
          Map
        </Card>
      </SplitPane>
    );
  }
}

export default withRouter(Upload);
