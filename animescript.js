const unitsRegex = /(px|pt|vw|es)/;

const unitWithValueRegex = /\d+(px|pt|vw|es)/;

const isAValueWithUnit = token => {
  return token.match(unitWithValueRegex);
};

const getValueAndUnit = token => {
  const unitIndex = token.match(unitsRegex).index;

  const value = {
    type: 'valueUnit',
    value: token.substr(0, unitIndex),
    unit: token.substr(unitIndex, token.length - 1)
  };

  return value;
};

const dealWithToken = token => {
  return isAValueWithUnit(token)
    ? getValueAndUnit(token)
    : isNaN(token) ? { type: 'word', value: token } : { type: 'number', value: token };
};

function tokenizer(code) {
  return code
    .split(/\s+/)
    .filter(token => token.length > 0)
    .map(dealWithToken);
}

function parser(tokens) {
  let AST = {
    type: 'Animation Tree',
    body: []
  };

  while (tokens.length > 0) {
    let token = tokens.shift();
    if (token.type === 'word') {
      switch (token.value) {
        case 'Move':
          let expression = {
            type: 'AnimExpression',
            name: 'Move',
            arguments: []
          };
          let firstArgument = tokens.shift();
          if (firstArgument && firstArgument.type === 'word') {
            expression.arguments.push({
              type: 'Identifier',
              name: 'Classname',
              value: firstArgument.value
            });

            let secondArgument = tokens.shift();
            if (secondArgument && secondArgument.type === 'word') {
              expression.arguments.push({
                type: 'Keyword',
                name: 'Direction',
                value: secondArgument.value
              });
              let thirdArgument = tokens.shift();
              if (thirdArgument && thirdArgument.type === 'valueUnit') {
                expression.arguments.push({
                  type: 'Value',
                  name: 'ValueByUnit',
                  value: thirdArgument.value,
                  unit: thirdArgument.unit
                });
              } else {
                throw new Error('Provide a correct value with unit after Direction');
              }
            } else {
              throw new Error('Provide a correct Direction after Action');
            }
          } else {
            throw new Error('Provide a correct Classnmae after Direction');
          }
          AST.body.push(expression);
          break;
        default:
          throw new Error('Unrecognized First Reserved Identifier');
      }
    }
  }

  return AST;
}

// .class {
//     transform: translateX(-100%);
//  }

function transformer(ast) {
  let animNode = {
    className: '',
    transform: '',
    value: '',
    direction: '',
    unit: ''
  };

  while (ast.body[0].arguments.length > 0) {
    let token = ast.body[0].arguments.shift();

    switch (token.name) {
      case 'Classname':
        animNode.className = token.value;
        break;
      case 'Direction':
        switch (token.value) {
          case 'right':
            animNode.transform = 'translateX';
            animNode.direction = '+';
            break;
          case 'left':
            animNode.transform = 'translateX';
            animNode.direction = '-';
            break;
          case 'down':
            animNode.transform = 'translateY';
            animNode.direction = '-';
            break;
          case 'up':
            animNode.transform = 'translateY';
            animNode.direction = '+';
            break;
          default:
            throw new Error('UNknown Direction');
        }
        break;
      case 'ValueByUnit':
        if (token.value && token.unit) {
          animNode.value = token.value;
          animNode.unit = token.unit;
        }
        break;
      default:
        throw new Error('Unknown Token');
    }
  }
  return animNode;
}

function generator(animNode) {
  return `.${animNode.className} {\n transform: ${animNode.transform}(${
    animNode.direction === '-' ? animNode.direction : ''
  }${animNode.value}${animNode.unit});\n} `;
}

// Stages of a Compiler

console.log(generator(transformer(parser(tokenizer('Move classname up 27px')))));

// Feed the source and get the output

// Move bbb left 57px
// Then Move bbb up 45px
// Make background red
// reduce Size 5 times
