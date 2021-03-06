let tokenizator = function lexicar(code) {
  return code
    .split(/\s+/)
    .filter(function(t) {
      return t.length > 0;
    })
    .map(function(t) {
      return isNaN(t)
        ? { type: "word", value: t }
        : { type: "number", value: t };
    });
};

let parser = function astBuilder(tokens) {
  let AST = {
    type: "Drawing",
    body: []
  };

  // I think this way of looping is important because we want to
  // continue parsing it unless we have extracted everyting out of it
  while (tokens.length > 0) {
    let current_token = tokens.shift();

    if (current_token.type === "word") {
      switch (current_token.value) {
        case "Line":
          let expression = {
            type: "CallExpression",
            name: "Paper",
            arguments: []
          };

          var argument = tokens.shift();
          if (argument.type === "number") {
            expression.arguments.push({
              type: "NumberLiteral",
              value: argument.value
            });
            AST.body.push(expression);
          } else {
            throw new Error("Should be followed by a number");
          }
          break;
        default:
          throw new Error("Unknown Command");
      }
    }
  }

  return AST;
};

function transformer(ast) {
  var svg_ast = {
    tag: "svg",
    attr: {
      width: 100,
      height: 100,
      viewBox: "0 0 100 100",
      xmlns: "http://www.w3.org/2000/svg",
      version: "1.1"
    },
    body: []
  };

  var pen_color = 100; // default pen color is black

  // Extract a call expression at a time as `node`. Loop until we are out of expressions in body.
  while (ast.body.length > 0) {
    var node = ast.body.shift();
    switch (node.name) {
      case "Paper":
        var paper_color = 100 - node.arguments[0].value;
        svg_ast.body.push({
          // add rect element information to svg_ast's body
          tag: "rect",
          attr: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            fill:
              "rgb(" +
              paper_color +
              "%," +
              paper_color +
              "%," +
              paper_color +
              "%)"
          }
        });
        break;
      case "Pen":
        pen_color = 100 - node.arguments[0].value; // keep current pen color in `pen_color` variable
        break;
    }
  }
  return svg_ast;
}

console.log(parser(tokenizator("Line 10")));

/**
 * Tokenizer
 * Parser
 * Transformer
 * Generator
 */
