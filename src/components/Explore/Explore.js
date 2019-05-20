import React from "react";
import { Button, Typography, Card, Input } from "antd";
import { withRouter } from "react-router-dom";
import Phylogeny from "./Phylogeny";
import PhylogenyTree from "../PhylogenyTree";
import Map from './Map';
// https://github.com/tomkp/react-split-pane
import SplitPane from "react-split-pane";

let catCol = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { taxa: [] };
  }

  componentDidMount = () => {
    setTimeout(() => this.setState({showMap: true}), 400);
  }

  setTaxonKeys = taxa => {
    this.setState({ taxa: taxa });
  };

  refreshSizes = e => {
    this.setState({shouldRefresh: true})
  }

  onSelect = data => {
    //just list of keys
    let filtered = data.filter(x => typeof x.taxonKey !== 'undefined');
    let taxaKeys = filtered.slice(0,catCol.length).map((x, i) => ({
      taxonKey: x.taxonKey,
      color: catCol[i%catCol.length],
      key: x.key
    }));
    this.setState({selected: taxaKeys, totalSelected: filtered.length})
  }

  render() {
    let shouldRefresh = false;
    if (this.state.shouldRefresh) {
      this.setState({shouldRefresh: false});
      shouldRefresh = true;
    }
    return (
      <SplitPane split="vertical" minSize={300} defaultSize={700} style={{overflow: 'hidden', height: 'calc(100vh - 68px)'}} onDragFinished={this.refreshSizes}>
        {/* <Phylogeny setTaxonKeys={this.setTaxonKeys} /> */}
        <Card style={{ margin: 20, overflow: 'auto', height: 'calc(100vh - 108px)'}}>
          <PhylogenyTree onSelect={this.onSelect} highlighted={this.state.selected}></PhylogenyTree>
        </Card>
        {this.state.showMap ? <Map shouldRefresh={shouldRefresh} selected={this.state.selected} max={catCol.length} totalSelected={this.state.totalSelected}></Map> : <div>Loading</div>}
      </SplitPane>
    );
  }
}

export default withRouter(Upload);
