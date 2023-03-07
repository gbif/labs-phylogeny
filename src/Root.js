import React from 'react';
import { Steps, Button, Spin } from 'antd';
import { withRouter, Route, Switch, Link } from 'react-router-dom';

import About from './components/About';
import InputData from './components/InputData';
import Match from './components/Match';
import Explore from './components/Explore';

import withContext from "./components/withContext";

const Step = Steps.Step;

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, explorerOnly: false };
  }

  componentDidMount = () => {
    const { setRawTree, setMapKey, setMatchedNames, setSearchTemplate } = this.props;
    // get the url pointing to the state (if existing)
    const stateUrl = new URLSearchParams(window.location.search).get('explore');
    // if state exists then load from url
    if (stateUrl) {
      fetch(stateUrl)
        .then(response => response.json())
        .then(initialState => {
          // setNewick(initialState.newick);
          setRawTree(initialState.rawTree);
          // setNames(initialState.names);
          setMatchedNames(initialState.matchedNames);
          if (initialState.mapKey) {
            setMapKey(initialState.mapKey);
          }
          if (initialState.searchTemplate) {
            setSearchTemplate(initialState.searchTemplate);
          }

          this.setState({ loading: false, hideNavigation: initialState.hideNavigation });
        })
    } else {
      this.setState({ loading: false });
    }
  }

  setStep = step => {
    this.props.history.push(step)
  }

  getCurrentStep = () => {
    switch (this.props.location.pathname) {
      case '/phylogeny':
        return 0;
      case '/match':
        return 1;
      case '/explore':
        return 2;
      default:
        return -1;
    }
  }

  render() {
    let step = this.getCurrentStep();
    const { loading, hideNavigation } = this.state;
    return (
      <React.Fragment>
        {loading && <Spin size="large" spinning={loading}></Spin>}
        {!loading && <>
          {!hideNavigation && <div style={{ display: 'flex', background: 'white', padding: 20, borderBottom: '1px solid #eee' }}>
            <Button type={step === -1 ? 'primary' : ''} style={{ flex: '0 0 auto', margin: '-5px 20px 0 0' }}>
              <Link to="/">
                About
              </Link>
            </Button>
            <Steps style={{ flex: '1 1 auto' }} size="small" current={step}>
              <Step title="Upload phylogeny" onClick={e => this.setStep('/phylogeny')} />
              {/* <Step title="Traits" description="Choose" onClick={e => this.setStep(1)}/> */}
              <Step title="Match names" />
              <Step title="Explore" />
            </Steps>
          </div>}
          <div>
            <Switch>
              <Route path="/" exact component={About} />
              <Route path="/phylogeny" exact component={InputData} />
              <Route path="/match" exact component={Match} />
              <Route path="/explore" exact>
                <Explore hideNavigation={hideNavigation} />
              </Route>
            </Switch>
          </div>
        </>}
      </React.Fragment>
    )
  }
}

const mapContextToProps = ({
  setNewick,
  setRawTree,
  setNames,
  setMatchedNames,
  setMapKey,
  setSearchTemplate
}) => ({
  setNewick,
  setRawTree,
  setNames,
  setMatchedNames,
  setMapKey,
  setSearchTemplate
});

export default withRouter(withContext(mapContextToProps)(Root));