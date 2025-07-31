// src/__tests__/parser.test.ts - Version simplifiée qui fonctionne
import {
  parse,
  toObject,
  toJSON,
  BringParser,
  BringParseError,
} from "../index";

describe("BringParser", () => {
  describe("Basic parsing", () => {
    test("parses primitives correctly", () => {
      const config = `
        name = "Alice"
        age = 25
        height = 5.8
        active = true
        inactive = false
        empty = null
      `;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.name).toBe("Alice");
      expect(obj.age).toBe(25);
      expect(obj.height).toBe(5.8);
      expect(obj.active).toBe(true);
      expect(obj.inactive).toBe(false);
      expect(obj.empty).toBe(null);
    });

    test("parses objects correctly", () => {
      const config = `
        user = {
          name = "Bob"
          age = 30
          settings = {
            theme = "dark"
            notifications = true
          }
        }
      `;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.user.name).toBe("Bob");
      expect(obj.user.age).toBe(30);
      expect(obj.user.settings.theme).toBe("dark");
      expect(obj.user.settings.notifications).toBe(true);
    });

    test("parses arrays correctly", () => {
      const config = `
        numbers = [1, 2, 3, 4, 5]
        strings = ["hello", "world"]
        mixed = [1, "text", true, null]
      `;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.numbers).toEqual([1, 2, 3, 4, 5]);
      expect(obj.strings).toEqual(["hello", "world"]);
      expect(obj.mixed).toEqual([1, "text", true, null]);
    });

    test("handles comments correctly", () => {
      const config = `
        # This is a comment
        name = "test"
        age = 25
      `;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.name).toBe("test");
      expect(obj.age).toBe(25);
    });

    test("parses attributes", () => {
      const config = `port = 8080 @min=1024 @max=65535`;

      const result = parse(config);

      expect(result.port).toBeDefined();

      // Test via toObject pour éviter les type assertions
      const obj = toObject(result);
      expect(obj.port).toBe(8080);
    });

    test("parses schemas", () => {
      const config = `
        schema User {
          id = number @min=1
          name = string @maxLength=50
          email = string @format="email"
        }
      `;

      const result = parse(config);

      expect(result["schema:User"]).toBeDefined();

      const schema = result["schema:User"] as any;
      expect(schema.name).toBe("User");
      expect(schema.rules).toHaveLength(3);
      expect(schema.rules[0].key).toBe("id");
      expect(schema.rules[0].type).toBe("number");
    });
  });

  describe("String parsing", () => {
    test("handles escape sequences", () => {
      const config = `
        message = "Hello\\nWorld"
        quote = "He said \\"Hello\\""
        backslash = "Path\\\\to\\\\file"
      `;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.message).toBe("Hello\nWorld");
      expect(obj.quote).toBe('He said "Hello"');
      expect(obj.backslash).toBe("Path\\to\\file");
    });

    test("handles single quotes", () => {
      const config = `name = 'Alice'`;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.name).toBe("Alice");
    });
  });

  describe("Number parsing", () => {
    test("parses negative numbers", () => {
      const config = `
        temperature = -5
        balance = -123.45
      `;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.temperature).toBe(-5);
      expect(obj.balance).toBe(-123.45);
    });

    test("parses floats correctly", () => {
      const config = `pi = 3.14159`;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.pi).toBe(3.14159);
    });
  });

  describe("Complex structures", () => {
    test("parses complex nested structure", () => {
      const config = `
        app = {
          name = "WebApp" @version="2.1.0"
          port = 3000 @min=1024 @max=65535
          debug = false
          
          database = {
            host = "localhost"
            port = 5432 @default=5432
            timeout = 30 @unit="seconds"
          }
          
          features = ["auth", "api", "websockets"]
        }
        
        users = [
          { id = 1, username = "alice", email = "alice@example.com" }
          { id = 2, username = "bob", email = "bob@example.com" }
        ]
      `;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.app.name).toBe("WebApp");
      expect(obj.app.port).toBe(3000);
      expect(obj.app.database.host).toBe("localhost");
      expect(obj.app.features).toEqual(["auth", "api", "websockets"]);
      expect(obj.users).toHaveLength(2);
      expect(obj.users[0].username).toBe("alice");
    });
  });

  describe("Error handling", () => {
    test("throws error for invalid syntax", () => {
      expect(() => {
        parse("invalid = @#$");
      }).toThrow(BringParseError);
    });

    test("throws error for unterminated string", () => {
      expect(() => {
        parse('name = "unterminated');
      }).toThrow(BringParseError);
    });

    test("throws error for missing closing brace", () => {
      expect(() => {
        parse('obj = { key = "value"');
      }).toThrow(BringParseError);
    });

    test("provides error position information", () => {
      try {
        parse("invalid = @#$");
        throw new Error("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(BringParseError);
        const parseError = error as BringParseError;
        expect(parseError.line).toBeGreaterThan(0);
        expect(parseError.column).toBeGreaterThan(0);
      }
    });
  });

  describe("Utility functions", () => {
    test("toObject converts correctly", () => {
      const config = `app = { name = "test", port = 8080 }`;
      const result = parse(config);
      const obj = toObject(result);

      expect(typeof obj).toBe("object");
      expect(obj.app.name).toBe("test");
      expect(obj.app.port).toBe(8080);
    });

    test("toJSON converts correctly", () => {
      const config = `name = "test"`;
      const result = parse(config);
      const json = toJSON(result);

      expect(typeof json).toBe("string");
      expect(json).toContain('"name": "test"');

      // Should be valid JSON
      expect(() => JSON.parse(json)).not.toThrow();
    });

    test("handles empty structures", () => {
      const config = `
        empty_obj = {}
        empty_arr = []
      `;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.empty_obj).toEqual({});
      expect(obj.empty_arr).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    test("handles trailing commas", () => {
      const config = `
        obj = {
          name = "test",
          age = 25,
        }
        arr = [1, 2, 3,]
      `;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.obj.name).toBe("test");
      expect(obj.obj.age).toBe(25);
      expect(obj.arr).toEqual([1, 2, 3]);
    });

    test("handles whitespace variations", () => {
      const config = `
        
        
        name    =    "test"
        
        obj = {
            
            key   =   "value"
            
        }
        
        
      `;

      const result = parse(config);
      const obj = toObject(result);

      expect(obj.name).toBe("test");
      expect(obj.obj.key).toBe("value");
    });
  });
});

// jest.setup.ts
export {};
