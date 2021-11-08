import React from 'react';
import { Button, Card, Input, Row } from 'antd';
import { withRouter } from 'react-router-dom';
import examples from './examples.json';
import withContext from "../../withContext"
const { TextArea } = Input;

class Upload extends React.Component {


  render() {
    const { setNewick, newick, startParsing } = this.props;

    return (
      <>
        <TextArea style={{ marginBottom: '10px' }} value={newick} onChange={e => setNewick(e.target.value)} rows={10} placeholder="Enter your NEWICK string here" />
        <Row justify="space-between" style={{ marginBottom: '8px' }}>
        <span style={{ color: 'rgba(0, 0, 0, 0.45)', display: 'block' }}>Examples:</span>

          <Button onClick={e => setNewick(examples.acaia)}>Acacia</Button>
          <Button onClick={e => setNewick(examples.hippocampus)}>BOLD Hippocampus</Button>
          <Button onClick={e => setNewick(examples.alucita)}>BOLD Alucita</Button>
        </Row>
        <Button type="primary" onClick={startParsing} disabled={!newick}>Next</Button>
      </>
    )
  }
}

const mapContextToProps = ({ setNewick, setRawTree, setNames, setMatchedNames, newick }) => ({ setNewick, setRawTree, setNames, setMatchedNames, newick });

export default withRouter(withContext(mapContextToProps)(Upload));