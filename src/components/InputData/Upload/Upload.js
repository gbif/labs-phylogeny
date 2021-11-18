import React from 'react';
import { Button, Input, Row } from 'antd';
import { withRouter } from 'react-router-dom';
import examples from './examples.json';
import withContext from "../../withContext"
import { NAME_LIST_LIMIT } from '../../Match/Match';

const { TextArea } = Input;

class Upload extends React.Component {


  render() {
    const { setNewick, newick, startParsing } = this.props;

    return (
      <>
        <p>Past or enter yout newick string. Be aware that we do not accept trees with more than {NAME_LIST_LIMIT} terminal nodes. And that the browser is the limiting factor. If you are on a slower machine you might find that the limit ought to be lower.</p>
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
