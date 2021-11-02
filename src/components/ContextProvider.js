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
        localStorage.setItem('newick', newick);
      },
      setRawTree: (rawTree) => {
        this.setState({ rawTree });
        localStorage.setItem('rawTree', JSON.stringify(rawTree));
      },
      setNames: (names) => {
        this.setState({ names });
        localStorage.setItem('names', JSON.stringify(names));
      },
      setMatchedNames: (matchedNames) => {
        this.setState({ matchedNames });
        localStorage.setItem('matchedNames', JSON.stringify(matchedNames));
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
