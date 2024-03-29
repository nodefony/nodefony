const babylon = require("@babel/parser");
const defaultSettings = {
  sourceType: "module",
  // strictMode: false,
  // tokens: true,
  plugins: [
    "espree"
  ]
};
const regClass = new RegExp("^(.*)Controller$");
const regAction = new RegExp("^(.*)Action$");


class Babylon {
  constructor () {
    this.engine = babylon;
    this.settings = nodefony.extend({}, defaultSettings);
  }

  parse (file, options) {
    return new Promise((resolve, reject) => {
      try {
        if (file) {
          const opt = nodefony.extend({}, this.settings, options);
          switch (true) {
          case file instanceof nodefony.fileClass:
            opt.sourceFilename = file.path;
            file.readAsync()
              .then((str) => resolve(this.engine.parse(str, opt)))
              .catch((e) => reject(e));
            break;
          case typeof file === "string":
            try {
              const myfile = new nodefony.fileClass(file);
              opt.sourceFilename = myfile.path;
              myfile.readAsync()
                .then((str) => resolve(this.engine.parse(str, opt)))
                .catch((e) => reject(e));
            } catch (e) {
              return resolve(this.engine.parse(file, opt));
            }
            break;
          default:
            return reject(new nodefony.Error("babylon parse error bad argument type"));
          }
        } else {
          return reject(new nodefony.Error("babylon parse error no file argument"));
        }
      } catch (e) {
        return reject(e);
      }
    });
  }

  logger (res, deep) {
    if (deep) {
      console.log(util.inspect(res, {
        depth: 10
      }));
      return;
    }
    console.log(res);
  }

  parseClassNode (node, obj) {
    if (nodefony.typeOf(node) === "array") {
      for (let i = 0; i < node.length; i++) {
        this.parseClassNode(node[i], obj);
      }
    }
    switch (node.type) {
    case "File":
      return this.parseClassNode(node.program, obj);
    case "VariableDeclaration":
      if (node.leadingComments) {
        this.parseClassNode(node.leadingComments, obj);
      }
      return this.parseClassNode(node.declarations, obj);
    case "VariableDeclarator":
      return this.parseClassNode(node.init, obj);
    case "ExpressionStatement":
      if (node.leadingComments) {
        this.parseClassNode(node.leadingComments, obj);
      }
      return this.parseClassNode(node.expression, obj);
    case "AssignmentExpression":
      if (node.leadingComments) {
        this.parseClassNode(node.leadingComments, obj);
      }
      if (node.right) {
        this.parseClassNode(node.right, obj);
      }
      if (node.left) {
        this.parseClassNode(node.left, obj);
      }
      break;
    case "ClassDeclaration":
    case "ClassExpression":
      let name = this.parseClassNode(node.id);
      const res = regClass.exec(name);
      if (res) {
        name = res[1];
      }
      const superClass = this.parseClassNode(node.superClass);
      const myclass = {
        name,
        extends: superClass,
        actions: [],
        comments: node.leadingComments || []
      };
      obj.class.push(myclass);
      return this.parseClassNode(node.body, myclass);
    case "MemberExpression":
      const object = this.parseClassNode(node.object);
      const property = this.parseClassNode(node.property);
      return `${object}.${property}`;
    case "ClassBody":
      return this.parseClassNode(node.body, obj);
    case "ClassMethod":
      const methodName = this.parseClassNode(node.key);
      const ret = regAction.exec(methodName);
      if (ret) {
        const action = {
          name: ret[1],
          comments: []
        };
        if (node.leadingComments) {
          this.parseClassNode(node.leadingComments, action);
        }
        obj.actions.push(action);
        // return this.parseClassNode(node.body, action);
      }
      break;
    case "CommentBlock":
      obj.comments.push(node.value);
      return node.value;
    case "Identifier":
      return node.name;
    case "Program":
      obj.program = {
        class: [],
        comments: []
      };
      return this.parseClassNode(node.body, obj.program);
    }
    return obj;
  }

  parseController (file) {
    return this.parse(file)
      .then((ast) => {
        const obj = {
          raw: ast
        };
        this.parseClassNode(ast, obj);
        return obj;
      });
  }
}

nodefony.babylon = new Babylon();
module.exports = nodefony.babylon;
