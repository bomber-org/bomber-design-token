declare var require: any;
const fs = require('fs');

// Read the JSON file
const rawData = fs.readFileSync('core/variables.json');

const jsonData = JSON.parse(rawData);
// Helper function to sanitize color names
const sanitizeName = (name: string) => name.replace(/[{}]|Colors./g, '').replace(/[^a-zA-Z0-9#]/g, '_');

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
let baseColors = new Set();
let colorKeys = new Set();

let themeBaseColorsConst = 'const ThemeBaseColors: ThemeBaseColors = {\n';
let colorsConst = 'const Colors: ThemeColors = {\n';

type _color = { value: { name: string }, name: string, isAlias: boolean };

const getKeyAndColorValue = (parentKey: string, obj: Record<string, any>) : Record<string, string> => {
    let result = {}
    let arr = Object.entries(obj); 
  
  	for(const [key, val] of arr) {
        const combinedKey = sanitizeName(`${parentKey}${parentKey ? '_' : ''}${key}`)
        if(!val.type) {
          const deepResult = getKeyAndColorValue(combinedKey, val)
          result = {
          	...result,
            ...deepResult
          }
        } else {
          const color = sanitizeName(val.value);
          result[combinedKey] = color;
        }
    }
  
    return result;
};

const themeData = Object.entries<Record<string, any>>(jsonData.Colors);
themeData.forEach(([key, value]) => {
  const mode = sanitizeName(key);
  themes.add(mode);
  colorsConst += `  ${mode}: {\n    `;
  themeBaseColorsConst += `  ${mode}: {\n    `;

  const typeKeys = Object.keys(value);

  typeKeys.forEach(typeKey => {
    const colorsMap = getKeyAndColorValue(typeKey, value[typeKey])
    const colorsMapKeys = Object.keys(colorsMap);
    if( Object.values(colorsMap)[0].includes('#')){
      baseColors = new Set([...baseColors, ...colorsMapKeys])
      themeBaseColorsConst += (`${JSON.stringify(colorsMap)}`.replace(/[{}}]/g, '').replace(/[\,]/g, ',\n    ').replace(/"/g, '\'').replace(/\:/g, '\: '))
    } else {
      colorKeys = new Set([...baseColors, ...colorsMapKeys])
      colorsConst += (`${JSON.stringify(colorsMap)}`.replace(/[{}}]/g, '').replace(/[\,]/g, ',\n    ').replace(/"/g, '\'').replace(/\:/g, '\: '))
    }
  })

    themeBaseColorsConst += '\n  },\n';
    colorsConst += `,\n    ...ThemeBaseColors.${mode},\n`;
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
