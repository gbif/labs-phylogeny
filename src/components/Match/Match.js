import React from 'react';
import { Button, Typography, Card, Alert, Table } from 'antd';
import { withRouter } from 'react-router-dom';
import async from 'async';
import axios from 'axios';
import withContext from "../withContext"
import _ from "lodash"
// import qs from 'qs';

const NAME_LIST_LIMIT = 4000;
class Match extends React.Component {


  render() {
    return (
      <Card title="Match names to GBIF taxonomy" style={{ margin: '20px auto', maxWidth: 1000 }}>
        <Typography>
          <MatchNames names={this.props.names || []} setMatchedNames={this.props.setMatchedNames} history={this.props.history}></MatchNames>
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
    sorter: (a, b) => a.name && b.name ? a.name.localeCompare(b.name) : 1,
  },
  {
    title: 'Matched to',
    dataIndex: 'matchedName',
    key: 'matchedName',
    defaultSortOrder: 'descend',
    render: (text, record) => <a href={`https://www.gbif.org/species/${record.usageKey}`} dangerouslySetInnerHTML={{ __html: text }}></a>,
    sorter: (a, b) => a.matchedName && b.matchedName ? a.matchedName.localeCompare(b.matchedName) : 1,
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
    this.lookupNames(this.props.names);
  }

 

  lookupName = async (name, callback) => {
    let response = await axios.get(`//api.gbif.org/v1/species/match?verbose=true&name=${name.name.replace(/_/g, ' ')}`);
    name.match = response.data;
    if(name.match.rank === "UNRANKED"){
      let formattedResponse = await axios.get(`//www.gbif.org/api/species/${name.match.usageKey}/name`);
      name.match.formattedName = _.get(formattedResponse, "data.n");
    }
    callback();
  }

  lookupNames = nameList => {
    if(nameList.length > NAME_LIST_LIMIT){
      alert(`There is more than ${NAME_LIST_LIMIT} terminal nodes in the tree. Please use a smaller tree. `)
    } else {
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
            name.matchedName = name.match.formattedName || name.match.scientificName;
            name.usageKey = name.match.usageKey;
            name.key = name.name;
            name.confidence = name.match.confidence;
            if (!name.matchedName) noMatches.push(name);
          });
          that.setState({ matches: names, noMatches: noMatches, loading: false });
        }
      }
    });
    }
    
  }

  render() {
    const {setMatchedNames} = this.props;
    return (
      <div>
        <Table columns={columns} dataSource={this.state.matches} loading={this.state.loading}/>
        {this.state.noMatches && this.state.noMatches.length > 0 ? <Alert message={`${this.state.noMatches.length} results without a match - no data will be shown for this name`} type="error" /> : undefined}
        <Button type="primary" disabled={this.state.loading} loading={this.state.loading} onClick={() => {
          setMatchedNames(this.state.matches);
          this.props.history.push('/explore')
        }} style={{marginTop: 20}}>Next</Button>
      </div>
       
    )
  }
}

const mapContextToProps = ({ setNewick, setRawTree, setNames, setMatchedNames, rawTree, matchedNames, names }) => ({ setNewick , setRawTree, setNames, setMatchedNames, rawTree, matchedNames, names});
export default withRouter(withContext(mapContextToProps)(Match));
