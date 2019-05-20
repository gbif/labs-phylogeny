import React from "react";
import { Button, Menu, Select, Icon, message } from "antd";
const Option = Select.Option;
let catCol = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];

class ColorBy extends React.Component {
  constructor(props) {
    super(props);
    let traitsString = localStorage.getItem('traitsData');
    let traits = {};
    try {
      traits = JSON.parse(traitsString);
    } catch (err) {
      console.error('invalid traits loaded from storage');
    }
    this.state = { traits };
  }

  componentDidMount = () => {
    setTimeout(() => this.setState({ showMap: true }), 400);
  }

  handleChange = col => {
    let colStats = this.traits.stats[col];
    return;
    // let filtered = data.filter(x => typeof x.taxonKey !== 'undefined');
    // let taxaKeys = filtered.slice(0, catCol.length).map((x, i) => ({
    //   taxonKey: x.taxonKey,
    //   color: catCol[i % catCol.length],
    //   key: x.key
    // }));
    // this.setState({ selected: taxaKeys, totalSelected: filtered.length })
  }

  render() {
    return (
      <React.Fragment>
        <Select defaultValue="Name" onChange={this.handleChange}>
          {Object.keys(this.state.traits.stats).map(col => <Option key={col} value={col}>Color by "{ col.replace(/_/g, ' ') }"</Option>)}
        </Select>
      </React.Fragment>
    );
  }
}

export default ColorBy;
