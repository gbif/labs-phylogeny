import React from "react";
import { Card } from "antd";
import { withRouter } from "react-router-dom";
import PhylogenyTree from "../PhylogenyTree";
import Map from './Map';
// https://github.com/tomkp/react-split-pane
import SplitPane from "react-split-pane";

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
'#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF']
class Explore extends React.Component {
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

 /*  onSelect = data => {
    //just list of keys
    let filtered = data.filter(x => typeof x.taxonKey !== 'undefined');
    let taxaKeys = filtered.slice(0,catCol.length).map((x, i) => ({
      taxonKey: x.taxonKey,
      color: catCol[i%catCol.length],
      key: x.key
    }));
    this.setState({selected: taxaKeys, totalSelected: filtered.length})
  } */
 
  onSelect = (groups, rest) => {
    //just list of keys
    let taxaKeys = [];
    groups.forEach((data, i) => {
      // let filtered = data.filter(x => typeof x.taxonKey !== 'undefined');
      taxaKeys = [...taxaKeys, ...data.map((x) => ({
      taxonKey: x.taxonKey,
      color: catCol[i],
      key: x.key
    }))]
    })

    taxaKeys = [...taxaKeys, ...rest.filter(x => typeof x.taxonKey !== 'undefined').map((x, i) => ({
      taxonKey: x.taxonKey,
      color: catCol[groups.length+i],
      key: x.key
    }))]
    
    this.setState({selected: taxaKeys, totalSelected: taxaKeys.length})
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
        <Card style={{ margin: 20}} bodyStyle={{padding: 10}}>
          <PhylogenyTree onSelect={this.onSelect} highlighted={this.state.selected}></PhylogenyTree>
        </Card>
        {this.state.showMap ? <Map shouldRefresh={shouldRefresh} selected={this.state.selected} max={catCol.length} totalSelected={this.state.totalSelected}></Map> : <div>Loading</div>}
      </SplitPane>
    );
  }
}

export default withRouter(Explore);
