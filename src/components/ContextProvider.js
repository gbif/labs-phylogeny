import React from "react";
export const AppContext = React.createContext({});

class ContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newick: localStorage.getItem('newick') || null,
      rawTree: this.getJSONFromStorage('rawTree'),
      names: this.getJSONFromStorage('names'),
      matchedNames: this.getJSONFromStorage('matchedNames'),
      setNewick: (newick) => {
        this.setState({ newick });
        try {
          localStorage.setItem('newick', newick);
        } catch(e) {
          //ignore errors
        }
      },
      setRawTree: (rawTree) => {
        this.setState({ rawTree });
        try {
          localStorage.setItem('rawTree', JSON.stringify(rawTree));
        } catch(e) {
          //ignore errors
        }
      },
      setNames: (names) => {
        this.setState({ names });
        try {
          localStorage.setItem('names', JSON.stringify(names));
        } catch(e) {
          //ignore errors
        }
      },
      setMatchedNames: (matchedNames) => {
        this.setState({ matchedNames });
        try {
          localStorage.setItem('matchedNames', JSON.stringify(matchedNames));
        } catch(e) {
          //ignore errors
        }
      }
    };
  }

  getJSONFromStorage = function(name) {
    const nameStr = localStorage.getItem(name);
    try {
      const parsed = nameStr ? JSON.parse(nameStr) : null
      return parsed;
    } catch (err) {
      console.error('invalid JSON loaded from storage');
      return null;
    }
  }

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
