import React from 'react';
import { Steps, Button } from 'antd';
import { withRouter, Route, Switch, Link } from 'react-router-dom';

import About from './components/About';
import Upload from './components/Upload';
import Match from './components/Match';
import Traits from './components/Traits';
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

  setStep = step => {
    this.props.history.push(step)
  }

  getCurrentStep = () => {
    switch(this.props.location.pathname) {
      case '/phylogeny': 
        return 0;
      case '/match': 
        return 1;
      case '/traits': 
        return 2;
      case '/explore': 
        return 3;
      default:
        return -1;
    }
  }

  render() {
    let step = this.getCurrentStep();
    return (
      <React.Fragment>
        <div style={{ display: 'flex', background: 'white', padding: 20, borderBottom: '1px solid #eee' }}>
          <Button type={step === -1 ? 'primary' : ''} style={{ flex: '0 0 auto', margin: '-5px 20px 0 0' }}>
            <Link to="/">
              About
            </Link>
          </Button>
          <Steps style={{ flex: '1 1 auto' }} size="small" current={step}>
            <Step title="Upload phylogeny" onClick={e => this.setStep('/phylogeny')} />
            <Step title="Match names"/>
            <Step title="Traits" />
            <Step title="Explore"/>
          </Steps>
        </div>
        <div>
          <Switch>
            <Route path="/" exact component={About}/>
            <Route path="/phylogeny" exact component={Upload}/>
            <Route path="/match" exact component={Match}/>
            <Route path="/traits" exact component={Traits}/>
            <Route path="/explore" exact component={Explore}/>
          </Switch>
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(Root);