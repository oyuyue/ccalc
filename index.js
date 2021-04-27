import { chineseToArabic, arabicToChinese } from "./utils";

const TokenKind = {
  INT: 0,
  PLUS: "加",
  MINUS: "减",
  MUL: "乘",
  DIV: "除",
  LPAREN: "左括号",
  RPAREN: "右括号"
};

class Token {
  constructor(kind, data) {
    this.kind = kind;
    this.data = data || kind;
  }

  is(...kinds) {
    return kinds.includes(this.kind);
  }
}

function isDigit(ch) {
  return "壹贰叁肆伍陆柒捌玖拾佰仟万亿零".includes(ch);
}

class Tokenizer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.max = this.source.length;
    this.tokens = [];
  }

  process() {
    while (this.pos < this.max) {
      const ch = this.source[this.pos];

      if (isDigit(ch)) {
        this.processDigit(ch);
        continue;
      }

      switch (ch) {
        case "加":
          this.pushToken(TokenKind.PLUS);
          break;
        case "减":
          this.pushToken(TokenKind.MINUS);
          break;
        case "乘":
          this.pushToken(TokenKind.MUL);
          break;
        case "除":
          this.pushToken(TokenKind.DIV);
          break;
        case "左":
        case "右":
          this.processParen(ch);
          break;
        case " ":
        case "\t":
        case "\r":
        case "\n":
          this.pos++;
          break;
        default:
          throw new Error(`非法字符 ${ch}`);
      }
    }
    return this.tokens;
  }

  processDigit(ch) {
    let digit = ch;
    while (this.pos < this.max) {
      ch = this.source[++this.pos];
      if (isDigit(ch)) {
        digit += ch;
      } else {
        break;
      }
    }
    this.tokens.push(new Token(TokenKind.INT, digit));
  }

  processParen(ch) {
    if (this.pos + 2 >= this.max) throw new Error(`【${ch}括号】错误长度`);
    const ch1 = this.source[this.pos + 1];
    const ch2 = this.source[this.pos + 2];
    if (ch1 !== "括") throw new Error(`非法单词 ${ch + ch1}`);
    if (ch2 !== "号") throw new Error(`非法单词 ${ch + ch1 + ch2}`);
    this.tokens.push(
      new Token(ch === "左" ? TokenKind.LPAREN : TokenKind.RPAREN)
    );
    this.pos += 3;
  }

  pushToken(kind, data) {
    this.tokens.push(new Token(kind, data));
    this.pos++;
  }
}

const NodeType = {
  BinOp: 0,
  Unary: 1,
  Num: 2
};

class ASTNode {
  constructor(type) {
    this.type = type;
  }
}

class NumNode extends ASTNode {
  constructor(token) {
    super(NodeType.Num);
    this.token = token;
    this.value = token.data;
  }
}

class BinOp extends ASTNode {
  constructor(left, op, right) {
    super(NodeType.BinOp);
    if (!left) throw new Error(`${op.data} 左边不能为空`);
    if (!right) throw new Error(`${op.data} 右边不能为空`);
    this.left = left;
    this.op = op.kind;
    this.right = right;
  }
}

class UnaryOp extends ASTNode {
  constructor(token, node) {
    super(NodeType.Unary);
    if (!node) throw new Error(`${token.data} 后面不能为空`);
    this.op = token.kind;
    this.child = node;
  }
}

/**
 * expr : term ((PLUS | MINUS)term)*
 * term : factor ((MUL | DIV) factor)*
 * factor: INT | LPAREN expr RPAREN | (PLUS | MINUS) factor
 */
class Parser {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.pos = 0;
  }

  parse() {
    this.tokens = this.tokenizer.process();
    this.nextToken();
    const node = this.eatExpr();
    this.nextToken();
    if (this.currentToken) {
      throw new Error(`解析后还存在 ${this.currentToken.data}`);
    }
    return node;
  }

  nextToken() {
    this.currentToken = this.tokens[this.pos++];
  }

  eatExpr() {
    let node = this.eatTerm();
    while (
      this.currentToken &&
      this.currentToken.is(TokenKind.PLUS, TokenKind.MINUS)
    ) {
      const token = this.currentToken;
      this.nextToken();
      node = new BinOp(node, token, this.eatTerm());
    }
    return node;
  }

  eatTerm() {
    let node = this.eatFactor();
    while (
      this.currentToken &&
      this.currentToken.is(TokenKind.MUL, TokenKind.DIV)
    ) {
      const token = this.currentToken;
      this.nextToken();
      node = new BinOp(node, token, this.eatFactor());
    }
    return node;
  }

  eatFactor() {
    const token = this.currentToken;
    if (!token) return null;

    this.nextToken();

    if (token.is(TokenKind.INT)) {
      return new NumNode(token);
    }

    if (token.is(TokenKind.LPAREN)) {
      const node = this.eatExpr();
      if (!this.currentToken || !this.currentToken.is(TokenKind.RPAREN)) {
        throw new Error("缺少右括号");
      }
      this.nextToken();
      return node;
    }

    if (token.is(TokenKind.PLUS, TokenKind.MINUS)) {
      return new UnaryOp(token, this.eatFactor());
    }

    throw new Error(`不期望的单词 【${token.data}】`);
  }
}

class Interpreter {
  constructor(parser) {
    this.parser = parser;
  }

  interpret() {
    const ast = this.parser.parse();
    if (!ast) return "";
    return this.visit(ast);
  }

  visit(node) {
    if (!node) throw new Error("节点未空");
    switch (node.type) {
      case NodeType.BinOp:
        return this.visitBinOp(node);
      case NodeType.Unary:
        return this.visitUnaryOp(node);
      case NodeType.Num:
        return this.visitNum(node);
      default:
        throw new Error(`未知节点 ${node}`);
    }
  }

  visitNum(node) {
    return chineseToArabic(node.value);
  }

  visitBinOp(node) {
    const l = this.visit(node.left);
    const r = this.visit(node.right);
    if (node.op === TokenKind.PLUS) return l + r;
    if (node.op === TokenKind.MINUS) return l - r;
    if (node.op === TokenKind.MUL) return l * r;
    if (node.op === TokenKind.DIV) return Math.round(l / r);
  }

  visitUnaryOp(node) {
    if (node.op === TokenKind.PLUS) return this.visit(node.child);
    if (node.op === TokenKind.MINUS) return -this.visit(node.child);
  }
}

export function calc(str) {
  return arabicToChinese(
    new Interpreter(new Parser(new Tokenizer(str))).interpret()
  );
}
