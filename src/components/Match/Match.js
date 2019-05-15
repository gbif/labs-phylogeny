import React from 'react';
import { Button, Typography, Card, Alert, Table } from 'antd';
import { withRouter } from 'react-router-dom';
import async from 'async';
import axios from 'axios';
// import qs from 'qs';

const { Paragraph } = Typography;

class Match extends React.Component {
  constructor(props) {
    super(props);
    let namesString = localStorage.getItem('names');
    let names = [];
    try {
      names = namesString ? JSON.parse(namesString) : []
    } catch (err) {
      console.error('invalid names array loaded from storage');
    }
    this.state = { names: names };
  }

  render() {
    return (
      <Card title="Match names to GBIF taxonomy" style={{ margin: '20px auto', maxWidth: 1000 }}>
        <Typography>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.
          </Paragraph>
          <MatchNames names={this.state.names} history={this.props.history}></MatchNames>
        </Typography>
      </Card>
    )
  }
}

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    // render: text => <a href="javascript:;">{text}</a>,
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Matched to',
    dataIndex: 'matchedName',
    key: 'matchedName',
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.matchedName.localeCompare(b.matchedName),
  },
  {
    title: 'Confidence',
    dataIndex: 'confidence',
    key: 'confidence',
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.confidence - b.confidence,
  }
];

class MatchNames extends React.Component {
  constructor(props) {
    super(props);
    this.state = { names: props.names, loading: true };
  }

  async componentDidMount() {
    this._isMount = true;
    this.lookupNames(this.state.names);
  }

  next = () => {
    localStorage.setItem('matchedNames', JSON.stringify(this.state.matches));
    this.props.history.push('/explore')
  }

  lookupName = async (name, callback) => {
    let response = await axios.get(`//api.gbif.org/v1/species/match?verbose=true&name=${name.name.replace(/_/g, ' ')}`);
    name.match = response.data;
    callback();
  }

  lookupNames = nameList => {
    let names = nameList.map(n => ({ name: n }));
    let that = this;
    async.eachLimit(names, 10, this.lookupName, function (err) {
      if (err) {
        // TODO inform the user that not everything could be matched
        console.log(err);
      } else {
        if (that._isMount) {
          let noMatches = [];
          names.forEach(name => {
            name.matchedName = name.match.scientificName;
            name.key = name.match.usageKey;
            name.confidence = name.match.confidence;
            if (!name.matchedName) noMatches.push(name);
          });
          that.setState({ matches: names, noMatches: noMatches, loading: false });
        }
      }
    });
  }

  render() {
    return (
      <div>
        <Table columns={columns} dataSource={this.state.matches} />
        {this.state.noMatches && this.state.noMatches.length > 0 ? <Alert message={`${this.state.noMatches.length} results without a match - no data will be shown for this name`} type="error" /> : undefined}
        <Button type="primary" disabled={this.state.loading} onClick={this.next} style={{marginTop: 20}}>Next</Button>
      </div>
    )
  }
}

export default withRouter(Match);