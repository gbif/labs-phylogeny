import React from "react";
export const AppContext = React.createContext({});

class ContextProvider extends React.Component {
  state = {
    newick: null,
    rawTree: null,
    names: null,
    matchedNames: null,
    setNewick: (newick) => {
      this.setState({ newick });
    },
    setRawTree: (rawTree) => {
      this.setState({ rawTree });
    },
    setNames: (names) => {
      this.setState({ names });
    },
    setMatchedNames: (matchedNames) => {
      this.setState({ matchedNames });
    }
  };

  render() {
    return (
      <AppContext.Provider
        value={this.state}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}

export default ContextProvider;
