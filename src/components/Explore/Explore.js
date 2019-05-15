import React from 'react';
import { Button, Typography, Card, Input } from 'antd';
import { withRouter } from 'react-router-dom';

const { Paragraph } = Typography;

// bedste bud er nok. Og vist det der bruges på phylolink
// http://phylotree.hyphy.org/documentation/examples.html

class Upload extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Card title="Start exploring" style={{ margin: '20px auto', width: 500 }}>
        <Typography>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.
          </Paragraph>
          <Button type="primary" onClick={this.startParsing}>Next</Button>
        </Typography>
      </Card>
    )
  }
}

export default withRouter(Upload);