import type { ThemePlugin } from '@react-agendfy/core';

const darkThemePlugin: ThemePlugin = {
  key: 'dark-theme',
  type: 'theme',
  themeName: 'dark',
  description: 'Dark theme with modern aesthetics',
  cssVariables: {
    '--color-bg-white': '#0f172a',
    '--color-bg-gray-50': '#1e293b',
    '--color-bg-gray-100': '#334155',
    '--color-border': '#334155',
    '--color-text-gray-800': '#f1f5f9',
    '--color-text-gray-700': '#e2e8f0',
    '--color-text-gray-500': '#94a3b8',
    '--btn-bg': '#1e293b',
    '--btn-hover-bg': '#334155'
  },
  activate() {
    Object.entries(this.cssVariables).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  },
  deactivate() {
    Object.keys(this.cssVariables).forEach(k => {
      document.documentElement.style.removeProperty(k);
    });
  }
};

export default darkThemePlugin;