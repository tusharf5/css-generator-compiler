
function tokenizer(code) {
  return code
    .split(/\s+/)
    .filter(token => token.length > 0)
    .map(token => {
      return isNaN(token)
        ? token.match(/px/)
          ? {
              type: "number",
              value: token.substr(0, token.match(/px/).index),
              unit: "px"
            }
          : { type: "word", value: token }
        : { type: "number", value: token };
    });
}

// console.log(tokenizer("Move ClassName Right 20px"));

function parser(tokens) {
  let AST = {
    type: "Animation Tree",
    body: []
  };

  while (tokens.length > 0) {
    let token = tokens.shift();
    if (token.type === "word") {
      switch (token.value) {
        case "Move":
          let expression = {
            type: "AnimExpression",
            name: "Move",
            arguments: []
          };
          let firstArgument = tokens.shift();
          if (firstArgument.type === "word") {
            expression.arguments.push({
              type: "Identifier",
              name: "Classname",
              value: firstArgument.value
            });

            let secondArgument = tokens.shift();
            if (secondArgument.type === "word") {
              expression.arguments.push({
                type: "Keyword",
                name: "Direction",
                value: secondArgument.value
              });
              let thirdArgument = tokens.shift();
              if (thirdArgument.type === "number") {
                expression.arguments.push({
                  type: "Value",
                  name: "ValueByUnit",
                  value: thirdArgument.value,
                  unit: thirdArgument.unit
                });
              }
            }
            AST.body.push(expression);
          }
          break;
        default:
          throw new Error("Unrecognized First Reserved Identifier");
      }
    }
  }

  return AST;
}

// .class {
//     transform: translateX(-100%);
//  }

function transformer(ast){
    let animNode = {
        className: '',
        transform: "",
        value: "",
        direction: "",
        unit: ""
    };

    while(ast.body[0].arguments.length > 0){
        let token = ast.body[0].arguments.shift();

        switch(token.name){
            case "Classname":
                animNode.className = token.value;
                break;
            case "Direction":
                switch(token.value){
                    case 'right':
                        animNode.transform = "translateX";
                        animNode.direction = "+";
                        break;
                    case 'left':
                        animNode.transform = "translateX";
                        animNode.direction = "-";
                        break;
                    case 'down':
                        animNode.transform = "translateY";
                        animNode.direction = "-";
                        break;
                    case 'up':
                        animNode.transform = "translateY";
                        animNode.direction = "+";
                        break;
                    default:
                        throw new Error('UNknown Direction');    
                }
                break;
            case "ValueByUnit":
                if(token.value && token.unit){
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


function generator(animNode){
    return `.${animNode.className} {\n transform: ${animNode.transform}(${animNode.direction === '-' ? animNode.direction : ''}${animNode.value}${animNode.unit});\n} `
}

console.log(generator(transformer(parser(tokenizer("Move akku left 87px")))));
