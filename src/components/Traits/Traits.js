import React from 'react';
import { Button, Typography, Card, Input } from 'antd';
import { withRouter } from 'react-router-dom';
import example from './example.js';
import Papa from 'papaparse';
import _ from 'lodash';

const { Paragraph } = Typography;
const { TextArea } = Input;

class Traits extends React.Component {
  constructor(props) {
    super(props);
    let names = [];
    try {
      names = JSON.parse(localStorage.getItem('matchedNames'));
    } catch (err) {
      console.error('invalid names array loaded from storage');
    }
    this.namesMap = _.keyBy(names, 'name');
    this.canonicalMap = _.keyBy(names, 'match.canonicalName');
    this.scientificMap = _.keyBy(names, 'matchedName');
    this.state = { value: localStorage.getItem('traits') };
  }

  startParsing = async e => {
    let csvString = this.state.value;

    var data = Papa.parse(csvString, { header: true, dynamicTyping: true });
    let rows = data.data;
    // analyze columns
    let cols = Object.keys(data.data[0]);
    let colTypes = {};
    cols.forEach(col => {
      let stats = {};
      for (var i = 0; i < rows.length; i++) {
        let val = rows[i][col];
        if (val !== null && val !== undefined) {
          stats.type = typeof val;
          break;
        }
      }
      if (stats.type === 'number') {
        stats.min = _.minBy(rows, col)[col];
        stats.max = _.maxBy(rows, col)[col];
      }
      if (stats.type === 'string') {
        stats.values = _.uniqBy(rows, col).map(x => x[col]);
      }
      colTypes[col] = stats;
    });
    rows.forEach(r => r.taxonKey = _.get((this.namesMap[r.Name] || this.canonicalMap[r.Name] || this.scientificMap[r.Name]), 'key'));
    rows.filter(r => typeof r.taxonKey === 'number');
    let traitsData = { stats: colTypes, traits: _.keyBy(rows, 'taxonKey') };
    
    localStorage.setItem('traits', this.state.value);
    localStorage.setItem('traitsData', JSON.stringify(traitsData));
    this.props.history.push('/explore')
  }

  render() {
    return (
      <Card title="Paste a traits csv" style={{ margin: '20px auto', width: 500 }}>
        <Typography>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.
          </Paragraph>
          <Paragraph><Button onClick={e => this.setState({ value: example })}>Use Acacia traits example</Button></Paragraph>
          <Paragraph>
            <TextArea value={this.state.value} onChange={e => this.setState({ value: e.target.value })} rows={10} placeholder="Enter your traits csv here" />
          </Paragraph>
          <Button type="primary" onClick={this.startParsing} disabled={!this.state.value}>Next</Button>
        </Typography>
      </Card>
    )
  }
}

export default withRouter(Traits);