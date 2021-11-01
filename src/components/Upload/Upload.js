import React from 'react';
import { Button, Card, Input, Row } from 'antd';
import { withRouter } from 'react-router-dom';
import parser from 'biojs-io-newick';
import examples from './examples.json';
import Otl from './OTL'
import withContext from "../withContext"
const { TextArea } = Input;

class Upload extends React.Component {
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
    const { setNewick, newick } = this.props;

    return (
      <Card title="NEWICK tree" style={{ margin: '20px auto', width: 500 }}>
        <Otl setTree={setNewick} />
        <span style={{ color: 'rgba(0, 0, 0, 0.45)', display: 'block' }}>Try one of these examples:</span>
        <Row justify="space-between" style={{ marginBottom: '8px' }}>
          <Button onClick={e => setNewick(examples.acaia)}>Acacia</Button>
          <Button onClick={e => setNewick(examples.hippocampus)}>BOLD Hippocampus</Button>
          <Button onClick={e => setNewick(examples.alucita)}>BOLD Alucita</Button>
        </Row>
        <TextArea style={{ marginBottom: '10px' }} value={newick} onChange={e => setNewick(e.target.value)} rows={10} placeholder="Enter your NEWICK string here" />
        <Button type="primary" onClick={this.startParsing} disabled={!newick}>Next</Button>
      </Card>
    )
  }
}

const mapContextToProps = ({ setNewick, setRawTree, setNames, setMatchedNames, newick }) => ({ setNewick, setRawTree, setNames, setMatchedNames, newick });

export default withRouter(withContext(mapContextToProps)(Upload));
