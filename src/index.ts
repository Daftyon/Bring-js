// src/index.ts - Correction finale des types

/**
 * Bring Parser for JavaScript/TypeScript - Final Type Fix
 */

// Base interfaces
export interface BringAttribute {
  name: string;
  value: string | number | boolean;
}

export interface BringSchema {
  name: string;
  rules: BringSchemaRule[];
}

export interface BringSchemaRule {
  key: string;
  type: string;
  attributes: BringAttribute[];
}

// Value types with discriminated union
export type BringValue = BringPrimitive | BringObject | BringArray;

export interface BringPrimitive {
  type: "primitive";
  value: string | number | boolean | null;
  attributes?: BringAttribute[];
}

export interface BringObject {
  type: "object";
  items: Record<string, BringValue>;
  attributes?: BringAttribute[];
}

export interface BringArray {
  type: "array";
  items: BringValue[];
  attributes?: BringAttribute[];
}

export interface ParseResult {
  [key: string]: BringValue | BringSchema;
}

// Type guards
export function isBringValue(value: any): value is BringValue {
  return (
    value &&
    typeof value === "object" &&
    "type" in value &&
    ["primitive", "object", "array"].includes(value.type)
  );
}

export function isBringSchema(value: any): value is BringSchema {
  return (
    value && typeof value === "object" && "name" in value && "rules" in value
  );
}

export function isParseResult(value: any): value is ParseResult {
  return (
    value &&
    typeof value === "object" &&
    !("type" in value) &&
    !("name" in value)
  );
}

export function isPrimitive(value: BringValue): value is BringPrimitive {
  return value.type === "primitive";
}

export function isObject(value: BringValue): value is BringObject {
  return value.type === "object";
}

export function isArray(value: BringValue): value is BringArray {
  return value.type === "array";
}

export class BringParseError extends Error {
  public line: number;
  public column: number;
  public position: number;

  constructor(
    message: string,
    line: number = 0,
    column: number = 0,
    position: number = 0
  ) {
    super(`${message} at line ${line}, column ${column}`);
    this.name = "BringParseError";
    this.line = line;
    this.column = column;
    this.position = position;
  }
}

export class BringParser {
  private text: string;
  private pos: number = 0;
  private line: number = 1;
  private col: number = 1;

  constructor(text: string) {
    this.text = text;
  }

  public parse(): ParseResult {
    const result: ParseResult = {};

    while (!this.isEof()) {
      this.skipWhitespace();
      if (this.isEof()) break;

      if (this.peek() === "#") {
        this.skipComment();
        continue;
      }

      if (this.match("schema")) {
        this.skipWhitespace();
        const schema = this.parseSchema();
        result[`schema:${schema.name}`] = schema;
        continue;
      }

      const kvPair = this.parseKeyValuePair();
      result[kvPair.key] = kvPair.value;
    }

    return result;
  }

  private parseKeyValuePair(): { key: string; value: BringValue } {
    const key = this.parseKey();
    this.skipWhitespace();

    const attributes: BringAttribute[] = [];
    while (this.peek() === "@") {
      this.advance();
      const attrName = this.parseIdentifier();
      this.skipWhitespace();
      this.expect("=");
      this.skipWhitespace();
      const attrValue = this.parsePrimitiveValue();
      attributes.push({ name: attrName, value: attrValue });
      this.skipWhitespace();
    }

    this.expect("=");
    this.skipWhitespace();
    const value = this.parseValue();

    if (attributes.length > 0) {
      value.attributes = attributes;
    }

    return { key, value };
  }

  private parseValue(): BringValue {
    const char = this.peek();

    if (char === "{") {
      return this.parseObject();
    } else if (char === "[") {
      return this.parseArray();
    } else if (char === '"' || char === "'") {
      return { type: "primitive", value: this.parseString() };
    } else if (char.match(/\d/) || char === "-") {
      return { type: "primitive", value: this.parseNumber() };
    } else if (this.match("true")) {
      return { type: "primitive", value: true };
    } else if (this.match("false")) {
      return { type: "primitive", value: false };
    } else if (this.match("null")) {
      return { type: "primitive", value: null };
    } else {
      throw this.error(`Unexpected character: ${char}`);
    }
  }

  private parseObject(): BringObject {
    this.expect("{");
    this.skipWhitespace();

    const items: Record<string, BringValue> = {};

    while (!this.isEof() && this.peek() !== "}") {
      if (this.peek() === "#") {
        this.skipComment();
        this.skipWhitespace();
        continue;
      }

      const kvPair = this.parseKeyValuePair();
      items[kvPair.key] = kvPair.value;

      this.skipWhitespace();
      if (this.peek() === ",") {
        this.advance();
        this.skipWhitespace();
      }
    }

    this.expect("}");
    return { type: "object", items };
  }

  private parseArray(): BringArray {
    this.expect("[");
    this.skipWhitespace();

    const items: BringValue[] = [];

    while (!this.isEof() && this.peek() !== "]") {
      if (this.peek() === "#") {
        this.skipComment();
        this.skipWhitespace();
        continue;
      }

      items.push(this.parseValue());
      this.skipWhitespace();

      if (this.peek() === ",") {
        this.advance();
        this.skipWhitespace();
      }
    }

    this.expect("]");
    return { type: "array", items };
  }

  private parseSchema(): BringSchema {
    const name = this.parseIdentifier();
    this.skipWhitespace();
    this.expect("{");
    this.skipWhitespace();

    const rules: BringSchemaRule[] = [];

    while (!this.isEof() && this.peek() !== "}") {
      if (this.peek() === "#") {
        this.skipComment();
        this.skipWhitespace();
        continue;
      }

      const key = this.parseKey();
      this.skipWhitespace();
      this.expect("=");
      this.skipWhitespace();
      const typeName = this.parseIdentifier();
      this.skipWhitespace();

      const attrs: BringAttribute[] = [];
      while (this.peek() === "@") {
        this.advance();
        const attrName = this.parseIdentifier();
        this.skipWhitespace();
        this.expect("=");
        this.skipWhitespace();
        const attrValue = this.parsePrimitiveValue();
        attrs.push({ name: attrName, value: attrValue });
        this.skipWhitespace();
      }

      rules.push({ key, type: typeName, attributes: attrs });
      this.skipWhitespace();
    }

    this.expect("}");
    return { name, rules };
  }

  private parseKey(): string {
    if (this.peek() === '"' || this.peek() === "'") {
      return this.parseString();
    }
    return this.parseIdentifier();
  }

  private parsePrimitiveValue(): string | number | boolean {
    const char = this.peek();

    if (char === '"' || char === "'") {
      return this.parseString();
    } else if (char.match(/\d/) || char === "-") {
      return this.parseNumber();
    } else if (this.match("true")) {
      return true;
    } else if (this.match("false")) {
      return false;
    } else {
      throw this.error("Expected primitive value");
    }
  }

  private parseString(): string {
    const quoteChar = this.peek();
    this.advance();
    const result: string[] = [];

    while (!this.isEof() && this.peek() !== quoteChar) {
      if (this.peek() === "\\") {
        this.advance();
        if (this.isEof()) {
          throw this.error("Unterminated string");
        }
        const escapeChar = this.advance();
        switch (escapeChar) {
          case "n":
            result.push("\n");
            break;
          case "t":
            result.push("\t");
            break;
          case "r":
            result.push("\r");
            break;
          case "\\":
            result.push("\\");
            break;
          case '"':
            result.push('"');
            break;
          case "'":
            result.push("'");
            break;
          default:
            result.push(escapeChar);
        }
      } else {
        result.push(this.advance());
      }
    }

    if (this.isEof()) {
      throw this.error("Unterminated string");
    }

    this.advance();
    return result.join("");
  }

  private parseNumber(): number {
    const startPos = this.pos;
    let isFloat = false;

    if (this.peek() === "-") {
      this.advance();
    }

    if (!this.peek().match(/\d/)) {
      throw this.error("Expected digit after minus sign");
    }

    while (!this.isEof() && this.peek().match(/\d/)) {
      this.advance();
    }

    if (!this.isEof() && this.peek() === ".") {
      isFloat = true;
      this.advance();
      if (!this.peek().match(/\d/)) {
        throw this.error("Expected digit after decimal point");
      }
      while (!this.isEof() && this.peek().match(/\d/)) {
        this.advance();
      }
    }

    const numStr = this.text.substring(startPos, this.pos);
    const result = isFloat ? parseFloat(numStr) : parseInt(numStr, 10);

    if (isNaN(result)) {
      throw this.error(`Invalid number format: ${numStr}`);
    }

    return result;
  }

  private parseIdentifier(): string {
    if (!this.peek().match(/[a-zA-Z_]/)) {
      throw this.error(`Expected identifier, got '${this.peek()}'`);
    }

    const result: string[] = [this.advance()];
    while (!this.isEof() && this.peek().match(/[a-zA-Z0-9_]/)) {
      result.push(this.advance());
    }

    return result.join("");
  }

  private skipWhitespace(): void {
    while (!this.isEof() && this.peek().match(/\s/)) {
      if (this.peek() === "\n") {
        this.line += 1;
        this.col = 1;
      } else {
        this.col += 1;
      }
      this.advance();
    }
  }

  private skipComment(): void {
    this.expect("#");
    while (!this.isEof() && this.peek() !== "\n") {
      this.advance();
    }
  }

  private match(s: string): boolean {
    if (this.text.startsWith(s, this.pos)) {
      for (let i = 0; i < s.length; i++) {
        this.advance();
      }
      return true;
    }
    return false;
  }

  private expect(s: string): void {
    if (!this.match(s)) {
      throw this.error(`Expected '${s}'`);
    }
  }

  private peek(): string {
    return this.pos < this.text.length ? this.text[this.pos] : "";
  }

  private advance(): string {
    if (this.isEof()) {
      return "";
    }

    const char = this.text[this.pos];
    this.pos += 1;

    if (char === "\n") {
      this.line += 1;
      this.col = 1;
    } else {
      this.col += 1;
    }

    return char;
  }

  private isEof(): boolean {
    return this.pos >= this.text.length;
  }

  private error(message: string): BringParseError {
    return new BringParseError(message, this.line, this.col, this.pos);
  }
}

/**
 * Parse a Bring format string
 */
export function parse(content: string): ParseResult {
  const parser = new BringParser(content);
  return parser.parse();
}

// Overloaded function signatures for toObject
export function toObject(value: BringValue): any;
export function toObject(value: ParseResult): any;
export function toObject(value: BringValue | ParseResult): any;

/**
 * Convert Bring data structures to plain JavaScript objects
 */
export function toObject(value: BringValue | ParseResult): any {
  // Check if it's a ParseResult (top-level parsed object)
  if (isParseResult(value)) {
    const result: any = {};
    for (const [key, val] of Object.entries(value)) {
      if (!key.startsWith("schema:") && isBringValue(val)) {
        result[key] = toObject(val);
      }
    }
    return result;
  }

  // Handle single BringValue
  if (isBringValue(value)) {
    switch (value.type) {
      case "primitive":
        return value.value;
      case "object":
        const obj: any = {};
        for (const [key, val] of Object.entries(value.items)) {
          obj[key] = toObject(val);
        }
        return obj;
      case "array":
        return value.items.map((item) => toObject(item));
    }
  }

  // Fallback - return as-is
  return value;
}

/**
 * Convert Bring data to JSON string
 */
export function toJSON(
  bringValue: BringValue | ParseResult,
  indent: number = 2
): string {
  return JSON.stringify(toObject(bringValue), null, indent);
}

/**
 * Extract all attributes from a Bring value recursively
 */
export function extractAttributes(bringValue: BringValue): Record<string, any> {
  const attributes: Record<string, any> = {};

  function extract(value: BringValue, path: string = ""): void {
    if (value.attributes) {
      for (const attr of value.attributes) {
        const attrPath = path ? `${path}.${attr.name}` : attr.name;
        attributes[attrPath] = attr.value;
      }
    }

    if (value.type === "object") {
      for (const [key, item] of Object.entries(value.items)) {
        const newPath = path ? `${path}.${key}` : key;
        extract(item, newPath);
      }
    } else if (value.type === "array") {
      value.items.forEach((item, index) => {
        const newPath = path ? `${path}[${index}]` : `[${index}]`;
        extract(item, newPath);
      });
    }
  }

  extract(bringValue);
  return attributes;
}

// Default export
export default {
  parse,
  toObject,
  toJSON,
  extractAttributes,
  BringParser,
  BringParseError,
  // Type guards
  isBringValue,
  isBringSchema,
  isParseResult,
  isPrimitive,
  isObject,
  isArray,
};
