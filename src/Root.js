import React from 'react';
import { Steps, Button } from 'antd';
import { withRouter, Route, Switch, Link } from 'react-router-dom';

import About from './components/About';
import Upload from './components/Upload';
import Match from './components/Match';
import Explore from './components/Explore';

const Step = Steps.Step;

class Root extends React.Component {
  // constructor(props) {
  //   super(props);
  //   // let solr = await axios.get(this.state.endpoints.SOLR + '?' + qs.stringify(test.v1));
  //   this.state = {
  //     step: 3
  //   };
  // }

  setStep = no => {
    if (no < this.state.step) this.setState({ step: no });
  }

  render() {
    const { location } = this.props;
    console.log(location.pathname);
    let step = -1;
    switch(location.pathname) {
      case '/phylogeny': 
        step = 0;
        break;
      case '/match': 
        step = 1;
        break;
      case '/explore': 
        step = 2;
        break;
      default:
        step = -1;
    }
    return (
      <React.Fragment>
        <div style={{ display: 'flex', background: 'white', padding: 20, borderBottom: '1px solid #eee' }}>
          <Button type={step === -1 ? 'primary' : ''} style={{ flex: '0 0 auto', margin: '-5px 20px 0 0' }}>
            <Link to="/">
              About
            </Link>
          </Button>
          <Steps style={{ flex: '1 1 auto' }} size="small" current={step}>
            <Step title="Upload phylogeny" onClick={e => this.setStep(0)} />
            {/* <Step title="Traits" description="Choose" onClick={e => this.setStep(1)}/> */}
            <Step title="Match names" onClick={e => this.setStep(2)} />
            <Step title="Explore" onClick={e => this.setStep(3)} />
          </Steps>
        </div>
        <div>
          <Switch>
            <Route path="/" exact component={About}/>
            <Route path="/phylogeny" exact component={Upload}/>
            <Route path="/match" exact component={Match}/>
            <Route path="/explore" exact component={Explore}/>
          </Switch>
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(Root);