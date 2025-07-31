"use strict";
// src/index.ts - Correction finale des types
Object.defineProperty(exports, "__esModule", { value: true });
exports.BringParser = exports.BringParseError = void 0;
exports.isBringValue = isBringValue;
exports.isBringSchema = isBringSchema;
exports.isParseResult = isParseResult;
exports.isPrimitive = isPrimitive;
exports.isObject = isObject;
exports.isArray = isArray;
exports.parse = parse;
exports.toObject = toObject;
exports.toJSON = toJSON;
exports.extractAttributes = extractAttributes;
// Type guards
function isBringValue(value) {
    return (value &&
        typeof value === "object" &&
        "type" in value &&
        ["primitive", "object", "array"].includes(value.type));
}
function isBringSchema(value) {
    return (value && typeof value === "object" && "name" in value && "rules" in value);
}
function isParseResult(value) {
    return (value &&
        typeof value === "object" &&
        !("type" in value) &&
        !("name" in value));
}
function isPrimitive(value) {
    return value.type === "primitive";
}
function isObject(value) {
    return value.type === "object";
}
function isArray(value) {
    return value.type === "array";
}
class BringParseError extends Error {
    constructor(message, line = 0, column = 0, position = 0) {
        super(`${message} at line ${line}, column ${column}`);
        this.name = "BringParseError";
        this.line = line;
        this.column = column;
        this.position = position;
    }
}
exports.BringParseError = BringParseError;
class BringParser {
    constructor(text) {
        this.pos = 0;
        this.line = 1;
        this.col = 1;
        this.text = text;
    }
    parse() {
        const result = {};
        while (!this.isEof()) {
            this.skipWhitespace();
            if (this.isEof())
                break;
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
    parseKeyValuePair() {
        const key = this.parseKey();
        this.skipWhitespace();
        const attributes = [];
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
    parseValue() {
        const char = this.peek();
        if (char === "{") {
            return this.parseObject();
        }
        else if (char === "[") {
            return this.parseArray();
        }
        else if (char === '"' || char === "'") {
            return { type: "primitive", value: this.parseString() };
        }
        else if (char.match(/\d/) || char === "-") {
            return { type: "primitive", value: this.parseNumber() };
        }
        else if (this.match("true")) {
            return { type: "primitive", value: true };
        }
        else if (this.match("false")) {
            return { type: "primitive", value: false };
        }
        else if (this.match("null")) {
            return { type: "primitive", value: null };
        }
        else {
            throw this.error(`Unexpected character: ${char}`);
        }
    }
    parseObject() {
        this.expect("{");
        this.skipWhitespace();
        const items = {};
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
    parseArray() {
        this.expect("[");
        this.skipWhitespace();
        const items = [];
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
    parseSchema() {
        const name = this.parseIdentifier();
        this.skipWhitespace();
        this.expect("{");
        this.skipWhitespace();
        const rules = [];
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
            const attrs = [];
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
    parseKey() {
        if (this.peek() === '"' || this.peek() === "'") {
            return this.parseString();
        }
        return this.parseIdentifier();
    }
    parsePrimitiveValue() {
        const char = this.peek();
        if (char === '"' || char === "'") {
            return this.parseString();
        }
        else if (char.match(/\d/) || char === "-") {
            return this.parseNumber();
        }
        else if (this.match("true")) {
            return true;
        }
        else if (this.match("false")) {
            return false;
        }
        else {
            throw this.error("Expected primitive value");
        }
    }
    parseString() {
        const quoteChar = this.peek();
        this.advance();
        const result = [];
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
            }
            else {
                result.push(this.advance());
            }
        }
        if (this.isEof()) {
            throw this.error("Unterminated string");
        }
        this.advance();
        return result.join("");
    }
    parseNumber() {
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
    parseIdentifier() {
        if (!this.peek().match(/[a-zA-Z_]/)) {
            throw this.error(`Expected identifier, got '${this.peek()}'`);
        }
        const result = [this.advance()];
        while (!this.isEof() && this.peek().match(/[a-zA-Z0-9_]/)) {
            result.push(this.advance());
        }
        return result.join("");
    }
    skipWhitespace() {
        while (!this.isEof() && this.peek().match(/\s/)) {
            if (this.peek() === "\n") {
                this.line += 1;
                this.col = 1;
            }
            else {
                this.col += 1;
            }
            this.advance();
        }
    }
    skipComment() {
        this.expect("#");
        while (!this.isEof() && this.peek() !== "\n") {
            this.advance();
        }
    }
    match(s) {
        if (this.text.startsWith(s, this.pos)) {
            for (let i = 0; i < s.length; i++) {
                this.advance();
            }
            return true;
        }
        return false;
    }
    expect(s) {
        if (!this.match(s)) {
            throw this.error(`Expected '${s}'`);
        }
    }
    peek() {
        return this.pos < this.text.length ? this.text[this.pos] : "";
    }
    advance() {
        if (this.isEof()) {
            return "";
        }
        const char = this.text[this.pos];
        this.pos += 1;
        if (char === "\n") {
            this.line += 1;
            this.col = 1;
        }
        else {
            this.col += 1;
        }
        return char;
    }
    isEof() {
        return this.pos >= this.text.length;
    }
    error(message) {
        return new BringParseError(message, this.line, this.col, this.pos);
    }
}
exports.BringParser = BringParser;
/**
 * Parse a Bring format string
 */
function parse(content) {
    const parser = new BringParser(content);
    return parser.parse();
}
/**
 * Convert Bring data structures to plain JavaScript objects
 */
function toObject(value) {
    // Check if it's a ParseResult (top-level parsed object)
    if (isParseResult(value)) {
        const result = {};
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
                const obj = {};
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
function toJSON(bringValue, indent = 2) {
    return JSON.stringify(toObject(bringValue), null, indent);
}
/**
 * Extract all attributes from a Bring value recursively
 */
function extractAttributes(bringValue) {
    const attributes = {};
    function extract(value, path = "") {
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
        }
        else if (value.type === "array") {
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
exports.default = {
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
//# sourceMappingURL=index.js.map