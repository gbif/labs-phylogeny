import React from 'react';
import { Button, Card, Input, Row, Tabs } from 'antd';
import { withRouter } from 'react-router-dom';
import parser from 'biojs-io-newick';

import Otl from './OTL'
import Upload from './Upload'
import TreeGenerator from './TreeGenerator'

import withContext from "../withContext"
const { TabPane } = Tabs;

class InputData extends React.Component {
    startParsing = () => {
        const { setRawTree, setNames, newick } = this.props;
        this.setState({ parsing: true });
        this.parse(newick)
          .then(result => {
            setRawTree(result)
            this.setState({ parsing: false });
            // extract names
            let names = [];
            this.extractNames(result, names);
            setNames(names)
            this.setState({ names })
            this.props.history.push('/match')
          })
          .catch(err => this.setState({ parsing: false }))
      }
    
      extractNames = (o, names) => {
        if (o.name) names.push(o.name);
        if (o.children) {
          o.children.forEach(child => this.extractNames(child, names));
        }
      }
    
      parse = async value => {
        return parser.parse_newick(value);
      }

  render() {

    return (
        <Card title="NEWICK tree" style={{ margin: '20px auto', width: 800 }}>

           <Tabs defaultActiveKey="1"  size="small">
          <TabPane tab="Input Newick" key="1">
            <Upload startParsing={this.startParsing} />
            
          </TabPane>
          <TabPane tab="Fetch from OToL" key="2">

          <Otl startParsing={this.startParsing}/>

          </TabPane>
{/*           <TabPane tab="Generate tree" key="3">
            <TreeGenerator startParsing={this.startParsing} />
          </TabPane> */}
        </Tabs>
        </Card>
        
      
    )
  }
}

const mapContextToProps = ({ setNewick, setRawTree, setNames, setMatchedNames, newick }) => ({ setNewick, setRawTree, setNames, setMatchedNames, newick });
export default withRouter(withContext(mapContextToProps)(InputData));

