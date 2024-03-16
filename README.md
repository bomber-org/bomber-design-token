# bomber-design-token

## Installation

Add the dependency in `package.json`:

```json
"dependencies": {
  "bomber-design-token": "git+https://github.com/bomber-org/bomber-design-token.git"
}
```

## Usage

### Import

```javascript
import Colors, { ColorsType } from 'bomber-design-token';
```

### Create Context

```typescript
import React, { createContext, useState, useContext } from 'react';

export interface ThemeInterface {
  colors: Colors;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeInterface>({} as ThemeInterface);
```

### Context Provider

```typescript
const ThemeProvider = ({ children }: any) => {
  const [isLightTheme, setLightTheme] = useState<boolean>(false);
  const toggleTheme = () => setLightTheme(previousState => !previousState);
  const theme: ThemeInterface = {
    colors: isLightTheme ? Colors.General : Colors.Neon_Style,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};
```

### Create Hooks

```typescript
const useTheme = () => useContext<ThemeInterface>(ThemeContext);
```

### Usage in Component

```typescript
import React from 'react';
import { View, Text } from 'react-native';

const Component = () => {
  const { colors } = useTheme();
  return (
    <View>
       <Text style={{ color: colors.Semantic_Text_text_body_50 }}>Component</Text>
    </View>
  );
};
```

## Tailwind Configuration

### Installation
install [tw-colors](https://www.npmjs.com/package/tw-colors).

Add plugins in `tailwind.config.js`:

```javascript
const colors = require('bomber-design-token');
module.exports = {
  plugins: [
    createThemes(colors)
  ],
};
```

### Create Context and Apply Theme Class

```javascript
import React, { createContext, useState, useContext } from 'react';

export interface ThemeInterface {
  theme: string;
}

export const ThemeContext = createContext<ThemeInterface>({} as ThemeInterface);

const ThemeProvider = ({ children }: any) => {
  const [themeClass, setThemeClass] = useState<string>('');

  return (
    <ThemeContext.Provider value={{ theme: themeClass }}>
      <body className={themeClass}>{children}</body>
    </ThemeContext.Provider>
  );
};
```

### Usage in Component

```javascript
import React from 'react';
import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

const Component = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <p className={'text-Semantic_Text_text_body_50'}>
      Component
    </p>
  );
};
```

### Usage in CSS

```css
.my-class {
  color: hsl(var(--twc-Semantic_Text_text_body_50));
  background: hsl(var(--twc-Semantic_Text_text_body_50) / 0.5);
}
```
