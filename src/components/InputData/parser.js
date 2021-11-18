function getTokens(s) {
  let tokens = [];
  let chars = s.split('');
  for (let i = 0; i < chars.length; i++) {
    let x = chars[i];
    if (x === ' ') continue;
    if (['(', ')', ',', ';', ':'].indexOf(x) > -1) {
      tokens.push(x);
      continue;
    }
    // this should be a string name, perhaps quoted
    if (x === '"') {
      let term = '';
      i++;
      do {
        x = chars[i];
        term += x;
        i++;
      } while (i < chars.length && chars[i] !== '"');
      tokens.push(term);
    } else if (x === "'") {
      let term = '';
      i++;
      do {
        x = chars[i];
        term += x;
        i++;
      } while (i < chars.length && chars[i] !== "'");
      tokens.push(term);
    } else {
      let term = '';
      while (i < chars.length && ['(', ')', ',', ';', ':'].indexOf(chars[i]) === -1) {
        x = chars[i];
        term += x;
        i++;
      };
      i--;
      tokens.push(term);
    }
  };
  return tokens;
}

function parser(s) {
  var ancestors = [];
  var tree = {};
  // var tokens = s.split(/\s*(;|\(|\)|,|:)\s*/);
  var tokens = getTokens(s);
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    var subtree = {};
    switch (token) {
      case '(': // new children
        tree.children = [subtree];
        ancestors.push(tree);
        tree = subtree;
        break;
      case ',': // another branch
        ancestors[ancestors.length - 1].children.push(subtree);
        tree = subtree;
        break;
      case ')': // optional name next
        tree = ancestors.pop();
        break;
      case ':': // optional length next
        break;
      default:
        var x = tokens[i - 1];
        if (x === ')' || x === '(' || x === ',') {
          tree.name = token;
        } else if (x === ':') {
          tree.branch_length = parseFloat(token);
        }
    }
  }
  return tree;
};

// const str = '(\'Bryophyta:123\':1, Chlorophyta something:2, "name two (author) 1970:63")Plantae;';
// const test = parse(str);
// console.log(JSON.stringify(test, null, 2))
module.exports = parser;