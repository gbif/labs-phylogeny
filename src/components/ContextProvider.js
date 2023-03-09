import React from "react";
export const AppContext = React.createContext({});

let hasLocalStorage = false;
try {
  hasLocalStorage = window.localStorage !== 'undefined';
} catch (e) {
  hasLocalStorage = false;
}

class ContextProvider extends React.Component {
  constructor(props) {
    super(props);
    let storedState = {};
    if (hasLocalStorage) {
      storedState = {
        newick: localStorage.getItem('newick') || null,
        rawTree: this.getJSONFromStorage('rawTree'),
        names: this.getJSONFromStorage('names'),
        matchedNames: this.getJSONFromStorage('matchedNames'),
      }
    }
    this.state = {
      ...storedState,
      mapKey: 'pk.eyJ1IjoiaG9mZnQiLCJhIjoiY2llaGNtaGRiMDAxeHNxbThnNDV6MG95OSJ9.p6Dj5S7iN-Mmxic6Z03BEA',
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
          if (hasLocalStorage) localStorage.setItem('rawTree', JSON.stringify(rawTree));
        } catch(e) {
          //ignore errors
        }
      },
      setNames: (names) => {
        this.setState({ names });
        try {
          if (hasLocalStorage) localStorage.setItem('names', JSON.stringify(names));
        } catch(e) {
          //ignore errors
        }
      },
      setMatchedNames: (matchedNames) => {
        this.setState({ matchedNames });
        try {
          if (hasLocalStorage) localStorage.setItem('matchedNames', JSON.stringify(matchedNames));
        } catch(e) {
          //ignore errors
        }
      },
      setMapKey: (mapKey) => {
        this.setState({ mapKey });
      },
      setDefaultMultiplier: (defaultMultiplier) => {
        this.setState({ defaultMultiplier });
      },
      setSearchTemplate: (searchTemplate) => {
        this.setState({ searchTemplate });
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

window.getJSONFromStorage = function(name) {
  const nameStr = localStorage.getItem(name);
  try {
    const parsed = nameStr ? JSON.parse(nameStr) : null
    return parsed;
  } catch (err) {
    console.error('invalid or empty JSON loaded from storage');
    return null;
  }
}

window.gbifGetExplorerState = () => {
  const state = {
    hideNavigation: true,
    // newick: localStorage.getItem('newick'),
    rawTree: window.getJSONFromStorage('rawTree'),
    // names: window.getJSONFromStorage('names'),
    matchedNames: window.getJSONFromStorage('matchedNames'),
  }
  return state;
}
console.info('To get the state of the app in the console, run window.gbifGetExplorerState()');


export default ContextProvider;
