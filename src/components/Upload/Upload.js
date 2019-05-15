import React from 'react';
import { Button, Typography, Card, Input } from 'antd';
import { withRouter } from 'react-router-dom';
import parser from 'biojs-io-newick';
import examples from './examples.json';

const { Paragraph } = Typography;
const { TextArea } = Input;

class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: localStorage.getItem('newick') };
  }

  startParsing = () => {
    if (this.state.value) {
      localStorage.setItem('newick', this.state.value);
      // delete matches and tree here if user uploads a new newick file
    }
    this.setState({parsing: true});
    this.parse(this.state.value)
      .then(result => {
        this.setState({tree: result, parsing: false});
        localStorage.setItem('rawTree', JSON.stringify(result));
        // extract names
        let names = [];
        this.extractNames(result, names);
        localStorage.setItem('names', JSON.stringify(names));
        this.props.history.push('/match')
      })
      .catch(err => this.setState({parsing: false}))
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
      <Card title="Paste a NEWICK string" style={{ margin: '20px auto', width: 500 }}>
        <Typography>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.
          </Paragraph>
          <Paragraph><Button onClick={e => this.setState({ value: examples.acaia })}>Use Acacia example</Button></Paragraph>
          <Paragraph>
            <TextArea value={this.state.value} onChange={e => this.setState({value: e.target.value})} rows={10} placeholder="Enter your NEWICK string here" />
          </Paragraph>
          <Button type="primary" onClick={this.startParsing}>Next</Button>
          {this.state.parsing ? 'parsing' : 'ready'}
          {this.state.tree ? 'tree ready' : 'no tree'}
          {this.state.tree ? JSON.stringify(this.state.tree) : ''}
        </Typography>
      </Card>
    )
  }
}

export default withRouter(Upload);