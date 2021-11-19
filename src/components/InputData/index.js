import React from 'react';
import { Card, Tabs, notification } from 'antd';
import { withRouter } from 'react-router-dom';
// import parser from 'biojs-io-newick';
import parser from './parser';
import { NAME_LIST_LIMIT } from '../Match/Match';

import Otl from './OTL'
import Upload from './Upload'
//import TreeGenerator from './TreeGenerator'
import withContext from "../withContext"
const { TabPane } = Tabs;

const openNotification = ({ title, type = 'open', message }) => {
  notification[type]({
    message: title,
    description: message,
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
};

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
        if (names.length > NAME_LIST_LIMIT) {
          openNotification({
            title: 'Too large tree',
            message: `The tool has a limit on ${NAME_LIST_LIMIT} nodes. The uploaded tree has ${names.length}.`,
            type: 'error'
          });
        } else {
          setNames(names)
          this.setState({ names })
          this.props.history.push('/match')
        }
      })
      .catch(err => {
        this.setState({ parsing: false })
        openNotification({
          title: 'Failed to parse input',
          message: 'You newick text is most likely invalid',
          type: 'error'
        });
      });
  }

  extractNames = (o, names) => {
    if (o.name) names.push(o.name);
    if (o.children) {
      o.children.forEach(child => this.extractNames(child, names));
    }
  }

  parse = async value => {
    // return parser.parse_newick(value);
    return parser(value);
  }

  render() {

    return (
      <Card title="NEWICK tree" style={{ margin: '20px auto', width: 800 }}>

        <Tabs defaultActiveKey="1" size="small">
          <TabPane tab="Input Newick" key="1">
            <Upload startParsing={this.startParsing} />
          </TabPane>
          <TabPane tab={<><img alt="OTL logo" style={{height: "16px"}} src="/mini-opentree-logo.png" /> <span>Fetch from Open Tree of Life</span></>} key="2">
            <Otl startParsing={this.startParsing} />
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

