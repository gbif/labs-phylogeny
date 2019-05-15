import React from 'react';
import { Button, Typography, Card } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

class Root extends React.Component {
  render() {
    return (
      <Card style={{ margin: '20px auto', width: 500 }}>
        <Typography>
          <Title>About phylogeny and this tool</Title>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </Paragraph>
          <Button type="primary">
            <Link to="/phylogeny">
              Get started
            </Link>
          </Button>
        </Typography>
      </Card>
    )
  }
}

export default Root;