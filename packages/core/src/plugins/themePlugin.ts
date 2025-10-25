import type { ThemePlugin } from '../types/plugins';
import { applyCssVariables, removeCssVariables } from '../utils/pluginUtils';

const darkThemePlugin: ThemePlugin = {
  key: 'dark-theme',
  type: 'theme',
  themeName: 'dark',
  description: 'Dark theme using CSS variables',
  cssVariables: {
    '--color-bg-white': '#0f172a',
    '--color-bg-gray-50': '#0f1724',
    '--color-border': '#1f2937',
    '--color-text-gray-800': '#e6eef8',
    '--btn-bg': '#122032',
    '--btn-hover-bg': '#163048',
  },
  activate() {
    applyCssVariables(this.cssVariables);
  },
  deactivate() {
    removeCssVariables(this.cssVariables);
  }
};

export default darkThemePlugin;