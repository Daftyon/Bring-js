# 🎨 Bring File Format - Syntax Highlighting

> **Bring** is a modern, human-readable configuration format that combines the best features of JSON, YAML, and XML.

## 🌈 Syntax Highlighting Colors

Here's how Bring syntax appears with proper highlighting:

### **Comments** 
```diff
- # This is a comment
- # Comments are green and italic
```
<sub>🟢 **Color**: `#6A9955` (Green, Italic)</sub>

### **Keywords**
```sql
schema UserConfig {
    -- 'schema' keyword
}
```
<sub>🟣 **Color**: `#C586C0` (Purple, Bold)</sub>

### **Schema Names**
```typescript
schema UserConfig {
    // Schema name is cyan
}
```
<sub>🔵 **Color**: `#4EC9B0` (Cyan, Bold)</sub>

### **Property Names**
```javascript
app = {
    name = "MyApp"     // 'name' is the property
    port = 8080        // 'port' is the property
}
```
<sub>💙 **Color**: `#9CDCFE` (Light Blue)</sub>

### **Strings**
```json
{
    "message": "Hello World",
    "path": "/home/user/config"
}
```
<sub>🟠 **Color**: `#CE9178` (Orange)</sub>

### **Numbers**
```python
port = 8080        # Integer
timeout = 30.5     # Float
negative = -42     # Negative
```
<sub>🟢 **Color**: `#B5CEA8` (Light Green)</sub>

### **Booleans & Null**
```yaml
debug: true
enabled: false
value: null
```
<sub>🔵 **Color**: `#569CD6` (Blue, Bold)</sub>

### **Attributes (Metadata)**
```ruby
port = 8080 @min=1024 @max=65535
name = "Alice" @required=true
```
<sub>🟡 **Color**: `#DCDCAA` (Yellow, Italic)</sub>

### **Types in Schemas**
```typescript
schema User {
    id: number      // 'number' is a type
    name: string    // 'string' is a type
    active: boolean // 'boolean' is a type
}
```
<sub>🔷 **Color**: `#4EC9B0` (Turquoise)</sub>

### **Operators**
```javascript
name = "value"     // '=' operator
```
<sub>⚪ **Color**: `#D4D4D4` (White/Light Gray)</sub>

### **Braces & Brackets**
```json
{
    "array": [1, 2, 3],
    "object": { "nested": true }
}
```
<sub>🟡 **Color**: `#FFD700` (Gold, Bold)</sub>

---

## 🎯 Complete Example with Highlighting

Here's a comprehensive Bring configuration showing all syntax elements:

```bring
# 🟢 Application Configuration - Production Environment
# 🟢 Updated: 2024-01-15 by Ahmed Hafdi

app = {
    name = "WebApplication" 🟡@version="2.1.0" 🟡@env="prod"
    host = "0.0.0.0" 🟡@binding="all_interfaces"
    port = 8080 🟡@min=1024 🟡@max=65535
    debug = false
    workers = 4 🟡@optimal_for="quad_core"
    
    # 🟢 Database cluster configuration
    database = {
        primary = {
            url = "postgresql://prod-db:5432/app"
            pool_size = 20 🟡@min=5 🟡@max=50
            timeout = 30.5 🟡@unit="seconds"
            ssl_enabled = true
        }
        
        replica = {
            url = "postgresql://replica-db:5432/app"
            pool_size = 10 🟡@readonly=true
            timeout = 15.0 🟡@unit="seconds"
        }
    }
    
    # 🟢 Feature flags and experiments
    features = ["authentication", "logging", "monitoring", "analytics"]
    
    # 🟢 API rate limiting
    rate_limits = {
        guest = 100 🟡@per="hour"
        user = 1000 🟡@per="hour" 🟡@burst=50
        premium = 10000 🟡@per="hour" 🟡@burst=200
    }
}

# 🟣 Schema definition for user validation
🟣schema 🔵User {
    id = 🔷number 🟡@min=1 🟡@required=true
    username = 🔷string 🟡@minLength=3 🟡@maxLength=20 🟡@pattern="^[a-zA-Z0-9_]+$"
    email = 🔷string 🟡@format="email" 🟡@unique=true
    age = 🔷number 🟡@min=13 🟡@max=120
    active = 🔷boolean 🟡@default=true
    role = 🔷string 🟡@enum=["admin", "user", "guest"] 🟡@default="user"
    created_at = 🔷string 🟡@format="datetime"
    preferences = 🔷object 🟡@optional=true
}

# 🟢 Sample user data
users = [
    {
        id = 1
        username = "alice_dev"
        email = "alice@company.com"
        age = 28
        active = true
        role = "admin"
        created_at = "2024-01-01T10:00:00Z"
    },
    {
        id = 2
        username = "bob_user"
        email = "bob@company.com" 
        age = 32
        active = true
        role = "user"
        created_at = "2024-01-02T14:30:00Z"
    }
]

# 🟢 Environment-specific overrides
🟣schema 🔵Environment {
    name = 🔷string 🟡@enum=["development", "staging", "production"]
    debug_mode = 🔷boolean 🟡@default=false
    log_level = 🔷string 🟡@enum=["debug", "info", "warn", "error"] 🟡@default="info"
}

environment = {
    name = "production"
    debug_mode = false
    log_level = "info"
}

# 🟢 Package dependencies (for EasierLang projects)
dependencies = [
    "http-server@^2.3.0" 🟡@scope="runtime",
    "json-parser@~1.5.2" 🟡@scope="runtime",
    "logger@>=1.0.0" 🟡@scope="runtime",
    "test-framework@^3.1.0" 🟡@scope="development"
]
```

---

## 🛠️ Color Palette Reference

| Element | Color Code | RGB | Usage |
|---------|------------|-----|-------|
| **Comments** | `#6A9955` | `rgb(106, 153, 85)` | Documentation, explanations |
| **Keywords** | `#C586C0` | `rgb(197, 134, 192)` | `schema`, reserved words |
| **Schema Names** | `#4EC9B0` | `rgb(78, 201, 176)` | Type definitions |
| **Properties** | `#9CDCFE` | `rgb(156, 220, 254)` | Variable names |
| **Strings** | `#CE9178` | `rgb(206, 145, 120)` | Text values |
| **Numbers** | `#B5CEA8` | `rgb(181, 206, 168)` | Numeric values |
| **Booleans** | `#569CD6` | `rgb(86, 156, 214)` | `true`, `false`, `null` |
| **Attributes** | `#DCDCAA` | `rgb(220, 220, 170)` | `@key=value` metadata |
| **Types** | `#4EC9B0` | `rgb(78, 201, 176)` | `string`, `number`, etc. |
| **Operators** | `#D4D4D4` | `rgb(212, 212, 212)` | `=`, assignment |
| **Delimiters** | `#FFD700` | `rgb(255, 215, 0)` | `{}`, `[]`, braces |

---

## 🎨 Theme Variations

### Dark Theme (Default)
- **Background**: `#1E1E1E` (Dark Gray)
- **Text**: `#D4D4D4` (Light Gray)
- **Optimized for**: VS Code, dark terminals

### Light Theme
- **Background**: `#FFFFFF` (White)
- **Text**: `#333333` (Dark Gray)
- **Adjusted colors**: Darker variants for better contrast

### High Contrast
- **Enhanced contrast** for accessibility
- **Bold formatting** for important elements
- **WCAG compliant** color combinations

---

## 💻 Editor Support

### VS Code Extension
```json
{
  "name": "bring-syntax-highlighter",
  "displayName": "Bring Language Support",
  "description": "Syntax highlighting for Bring configuration files",
  "version": "1.0.0",
  "publisher": "daftyon"
}
```

### Web Integration
```html
<!-- Prism.js -->
<link href="prism-bring.css" rel="stylesheet" />
<script src="prism-bring.js"></script>

<!-- Usage -->
<pre><code class="language-bring">
app = { name = "MyApp" @version="1.0" }
</code></pre>
```

### Terminal Colors
```bash
# Enable syntax highlighting in terminal
bring-parser config.bring --highlight
```

---

## 🌟 Live Demo

Try the interactive syntax highlighter: **[bring-highlighter.daftyon.com](https://bring-highlighter.daftyon.com)**

## 📚 Learn More

- **Documentation**: [bring.daftyon.com](https://bring.daftyon.com)
- **Parser (Python)**: `pip install bring-parser`
- **Parser (Node.js)**: `npm install bring-parser`
- **GitHub**: [github.com/daftyon/bring-parser](https://github.com/daftyon/bring-parser)

---

**Created by Ahmed Hafdi** | **Follow**: [@ahmed_hafdi](https://github.com/ahmed-hafdi) | **License**: MIT
