# Bring Parser (JavaScript/TypeScript)
![alt text](image.png)

[![npm version](https://badge.fury.io/js/bring-parser.svg)](https://badge.fury.io/js/bring-parser)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/daftyon/bring-parser-js/workflows/CI/badge.svg)](https://github.com/daftyon/bring-parser-js/actions)

A modern, human-readable configuration and package management format parser for JavaScript and TypeScript. **Bring** combines the best features of JSON, YAML, and XML while solving their key limitations.

## ✨ Features

| Feature | JSON | YAML | XML | **Bring** |
|---------|------|------|-----|-----------|
| **Human-Readable** | ❌ No comments | ✅ | ❌ Too verbose | ✅ |
| **Supports Comments** | ❌ | ✅ | ✅ | ✅ |
| **Schema Validation** | ❌ External | ❌ | ✅ XSD | ✅ Built-in |
| **Attributes/Metadata** | ❌ | ❌ | ✅ | ✅ `@attr=value` |
| **No Ambiguity** | ✅ | ❌ `yes` vs `true` | ✅ | ✅ |
| **TypeScript Support** | ✅ | ✅ | ✅ | ✅ **Full** |

## 🔧 Installation

```bash
npm install bring-parser
# or
yarn add bring-parser
# or
pnpm add bring-parser
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { parse, toObject } from 'bring-parser';

// Parse Bring configuration
const config = `
# Application settings
app = {
    name = "MyApp" @version="1.0"
    port = 8080 @min=1024 @max=65535
    debug = false
    features = ["auth", "logging", "caching"]
}

# Database configuration  
database = {
    host = "localhost"
    port = 5432 @default=5432
    timeout = 30 @unit="seconds"
}
`;

// Parse and convert to JavaScript object
const result = parse(config);
const data = toObject(result);

console.log(data.app.name); // "MyApp"
console.log(data.app.port); // 8080
console.log(data.database.host); // "localhost"
```

### TypeScript Support

```typescript
import { parse, toObject, BringValue, ParseResult } from 'bring-parser';

interface AppConfig {
  app: {
    name: string;
    port: number;
    debug: boolean;
    features: string[];
  };
  database: {
    host: string;
    port: number;
    timeout: number;
  };
}

const result: ParseResult = parse(configString);
const config: AppConfig = toObject(result) as AppConfig;

// Full type safety
config.app.name; // string
config.app.port; // number
```

## 📖 Bring Syntax

### Key-Value Pairs
```bring
name = "Bring"
version = 1.0
enabled = true
```

### Objects (Nested Data)
```bring
server = {
    host = "localhost"
    port = 3000 @min=1024
    ssl = {
        enabled = true
        cert = "/path/to/cert.pem"
    }
}
```

### Arrays
```bring
features = ["auth", "logging", "caching"]
ports = [8080, 3000, 5432]
```

### Attributes (Metadata)
```bring
port = 8080 @min=1024 @max=65535
name = "Alice" @required=true @maxLength=50
email = "user@example.com" @format="email"
```

### Schema Definitions
```bring
schema User {
    id = number @min=1 @required=true
    username = string @minLength=3 @maxLength=20
    email = string @format="email" @unique=true
    active = boolean @default=true
}
```

### Comments
```bring
# This is a comment
app = {
    # Nested comments work too
    name = "MyApp"
}
```

## 🎯 API Reference

### Core Functions

#### `parse(content: string): ParseResult`
Parse a Bring format string and return structured data.

```typescript
const result = parse('name = "John"');
```

#### `toObject(bringValue: BringValue | ParseResult): any`
Convert Bring data structures to plain JavaScript objects.

```typescript
const obj = toObject(result);
console.log(obj.name); // "John"
```

#### `toJSON(bringValue: BringValue | ParseResult, indent?: number): string`
Convert Bring data to JSON string.

```typescript
const json = toJSON(result, 2);
console.log(json); // Pretty-printed JSON
```

#### `extractAttributes(bringValue: BringValue): Record<string, any>`
Extract all attributes from a Bring value recursively.

```typescript
const attrs = extractAttributes(result.app);
console.log(attrs); // { "port.min": 1024, "port.max": 65535 }
```

### Classes

#### `BringParser`
Main parser class for advanced usage.

```typescript
const parser = new BringParser(content);
const result = parser.parse();
```

#### `BringParseError`
Error class with position information.

```typescript
try {
  parse('invalid syntax');
} catch (error) {
  if (error instanceof BringParseError) {
    console.log(`Error at line ${error.line}, column ${error.column}`);
  }
}
```

### TypeScript Interfaces

```typescript
interface BringValue {
  type: 'primitive' | 'object' | 'array';
  value?: any;
  items?: Record<string, BringValue> | BringValue[];
  attributes?: BringAttribute[];
}

interface BringPrimitive extends BringValue {
  type: 'primitive';
  value: string | number | boolean | null;
}

interface BringObject extends BringValue {
  type: 'object';
  items: Record<string, BringValue>;
}

interface BringArray extends BringValue {
  type: 'array';
  items: BringValue[];
}

interface BringAttribute {
  name: string;
  value: string | number | boolean;
}
```

## 🌐 Browser Support

The parser works in all modern browsers and Node.js environments:

### Browser (ES Modules)
```html
<script type="module">
  import { parse, toObject } from 'https://unpkg.com/bring-parser/dist/index.esm.js';
  
  const result = parse('name = "Browser"');
  console.log(toObject(result));
</script>
```

### Browser (UMD)
```html
<script src="https://unpkg.com/bring-parser/dist/index.umd.js"></script>
<script>
  const { parse, toObject } = BringParser;
  const result = parse('name = "Browser"');
  console.log(toObject(result));
</script>
```

### Node.js (CommonJS)
```javascript
const { parse, toObject } = require('bring-parser');

const result = parse('name = "Node.js"');
console.log(toObject(result));
```

## 📚 Examples

### Web Application Config
```bring
# web-app.bring
app = {
    name = "WebApp" @version="2.1.0"
    host = "localhost" @env="HOST"
    port = 8080 @env="PORT" @default=8080
    
    database = {
        url = "postgresql://localhost:5432/mydb"
        pool_size = 10 @min=1 @max=50
        timeout = 30 @unit="seconds"
    }
    
    features = ["authentication", "logging", "monitoring"]
    
    security = {
        jwt_secret = "your-secret-key" @required=true
        session_timeout = 3600 @unit="seconds"
        csrf_protection = true
    }
}
```

### Package Management (EasierLang)
```bring
# package.bring
package = {
    name = "http-server" @semver=true
    version = "2.3.0"
    description = "High-performance HTTP server for EasierLang"
    author = "Daftyon Team <contact@daftyon.com>"
    license = "MIT"
    
    dependencies = [
        "json-parser@^1.2.0"
        "logger@~2.1.0"
        "crypto@>=1.0.0"
    ]
    
    dev_dependencies = [
        "test-framework@^1.0.0"
        "benchmark-tools@^0.5.0"
    ]
    
    repository = "https://github.com/daftyon/http-server" @git=true
    homepage = "https://daftyon.com/packages/http-server"
}
```

### Schema Validation
```bring
# user-schema.bring
schema User {
    id = number @min=1 @required=true
    username = string @minLength=3 @maxLength=20 @required=true
    email = string @format="email" @required=true
    role = string @enum=["admin", "user", "guest"] @default="user"
    active = boolean @default=true
    created_at = string @format="datetime"
}

# Sample user data
users = [
    {
        id = 1
        username = "alice"
        email = "alice@example.com"
        role = "admin"
        active = true
        created_at = "2023-01-15T10:30:00Z"
    }
    {
        id = 2
        username = "bob"
        email = "bob@example.com"
        role = "user"
        active = true
        created_at = "2023-01-16T14:22:00Z"
    }
]
```

## 🛠️ Advanced Usage

### Custom Error Handling
```typescript
import { parse, BringParseError } from 'bring-parser';

try {
  const result = parse(invalidBringContent);
} catch (error) {
  if (error instanceof BringParseError) {
    console.error(`Parse error at line ${error.line}, column ${error.column}: ${error.message}`);
  }
}
```

### Working with Attributes
```typescript
import { parse, extractAttributes } from 'bring-parser';

const config = `
port = 8080 @min=1024 @max=65535 @env="PORT"
timeout = 30 @unit="seconds" @default=30
`;

const result = parse(config);
const attributes = extractAttributes(result.port);

console.log(attributes);
// Output: { "min": 1024, "max": 65535, "env": "PORT" }
```

### Stream Processing (Node.js)
```typescript
import fs from 'fs';
import { parse, toObject } from 'bring-parser';

// Read large Bring files
const content = fs.readFileSync('large-config.bring', 'utf-8');
const result = parse(content);
const config = toObject(result);

// Process configuration
console.log('Loaded configuration:', config);
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## 📊 Performance

- **Parse speed**: ~1M characters/second
- **Memory usage**: ~2x input size
- **Bundle size**: 
  - Minified: ~15KB
  - Minified + Gzipped: ~5KB

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- **[bring-parser (Python)](https://pypi.org/project/bring-parser/)** - Python implementation
- **[bring-vscode-extension](https://marketplace.visualstudio.com/items?itemName=daftyon.bring)** - VS Code syntax highlighting
- **EasierLang** - Programming language using Bring for package management
- **Daftyon Hub** - Package repository for EasierLang

## 🙋‍♂️ Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/daftyon/bring-parser-js/issues)
- **Documentation**: [API Documentation](https://bring-parser-js.docs.daftyon.com/)
- **Email**: contact@daftyon.com

---

**Made with ❤️ by the Daftyon Team**
