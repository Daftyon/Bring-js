/**
 * Bring Parser for JavaScript/TypeScript - Final Type Fix
 */
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
export declare function isBringValue(value: any): value is BringValue;
export declare function isBringSchema(value: any): value is BringSchema;
export declare function isParseResult(value: any): value is ParseResult;
export declare function isPrimitive(value: BringValue): value is BringPrimitive;
export declare function isObject(value: BringValue): value is BringObject;
export declare function isArray(value: BringValue): value is BringArray;
export declare class BringParseError extends Error {
    line: number;
    column: number;
    position: number;
    constructor(message: string, line?: number, column?: number, position?: number);
}
export declare class BringParser {
    private text;
    private pos;
    private line;
    private col;
    constructor(text: string);
    parse(): ParseResult;
    private parseKeyValuePair;
    private parseValue;
    private parseObject;
    private parseArray;
    private parseSchema;
    private parseKey;
    private parsePrimitiveValue;
    private parseString;
    private parseNumber;
    private parseIdentifier;
    private skipWhitespace;
    private skipComment;
    private match;
    private expect;
    private peek;
    private advance;
    private isEof;
    private error;
}
/**
 * Parse a Bring format string
 */
export declare function parse(content: string): ParseResult;
export declare function toObject(value: BringValue): any;
export declare function toObject(value: ParseResult): any;
export declare function toObject(value: BringValue | ParseResult): any;
/**
 * Convert Bring data to JSON string
 */
export declare function toJSON(bringValue: BringValue | ParseResult, indent?: number): string;
/**
 * Extract all attributes from a Bring value recursively
 */
export declare function extractAttributes(bringValue: BringValue): Record<string, any>;
declare const _default: {
    parse: typeof parse;
    toObject: typeof toObject;
    toJSON: typeof toJSON;
    extractAttributes: typeof extractAttributes;
    BringParser: typeof BringParser;
    BringParseError: typeof BringParseError;
    isBringValue: typeof isBringValue;
    isBringSchema: typeof isBringSchema;
    isParseResult: typeof isParseResult;
    isPrimitive: typeof isPrimitive;
    isObject: typeof isObject;
    isArray: typeof isArray;
};
export default _default;
//# sourceMappingURL=index.d.ts.map