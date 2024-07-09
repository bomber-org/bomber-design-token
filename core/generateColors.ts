declare var require: any;
const fs = require('fs');

// Read the JSON file
const rawData = fs.readFileSync('core/variables.json');

const jsonData = JSON.parse(rawData);
// Helper function to sanitize color names
const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '_');

const themeBaseColorsType = `type ThemeBaseColors = {
   [K in Theme]: {[X in BaseColors]: string};
 };\n\n`;

const themeColorsType = `type ThemeColors = {
   [K in Theme]: {[X in ColorKeys]: string};
 };\n\n`;

const exportColorConst = 'export default Colors;\n\n'; 

const exportTypeColors = `export type ColorsType = {
  [key in ColorKeys]: string;
};
`;

let themeType = 'export type Theme = ';
let baseColorsType = 'type BaseColors = \n  ';
let colorKeysType = 'type ColorKeys = \n  BaseColors\n  | ';

const themes = new Set();
const baseColors = new Set();
const colorKeys = new Set();

let themeBaseColorsConst = 'const ThemeBaseColors: ThemeBaseColors = {\n';
let colorsConst = 'const Colors: ThemeColors = {\n';

type _color = { value: { name: string }, name: string, isAlias: boolean }

const themeData = jsonData.collections[0].modes;
themeData.forEach((theme: { name: string, variables: [_color] }) => {
  const mode = sanitizeName(theme.name);
  themes.add(mode);
  colorsConst += `  ${mode}: {\n`;
  themeBaseColorsConst += `  ${mode}: {\n`;

  const colors = theme.variables;
  colors.forEach((color: _color) => {
    if (!color.isAlias) {
      const colorName = sanitizeName(color.name);
      baseColors.add(colorName);
      themeBaseColorsConst += `    ${colorName}: '${color.value}',\n`;
    } else {
      const colorKeyName = sanitizeName(color.name);
      const colorName = sanitizeName(color.value.name);
      colorKeys.add(colorKeyName);
      colorsConst += `    ${colorKeyName}: ThemeBaseColors.${mode}.${colorName},\n`;
    }
  });
  themeBaseColorsConst += '  },\n';
  colorsConst += `    ...ThemeBaseColors.${mode},\n`;
  colorsConst += '  },\n';
});

themeBaseColorsConst += '};\n\n';
colorsConst += '};\n\n';

themeType +=
  Array.from(themes)
    .map(theme => `'${theme}'`)
    .join(' | ') + ';\n\n';
baseColorsType +=
  Array.from(baseColors)
    .map(color => `'${color}'`)
    .join('\n  | ') + ';\n\n';
colorKeysType +=
  Array.from(colorKeys)
    .map(colorKey => `'${colorKey}'`)
    .join('\n  | ') + ';\n\n';

const tsOutput =
  themeBaseColorsType +
  themeColorsType +
  themeType +
  baseColorsType +
  colorKeysType +
  themeBaseColorsConst +
  colorsConst +
  exportColorConst +
  exportTypeColors;

fs.writeFileSync('src/colors.ts', tsOutput);
