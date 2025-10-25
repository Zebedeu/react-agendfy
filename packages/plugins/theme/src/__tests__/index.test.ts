import darkThemePlugin from '../index';

describe('Theme Plugin', () => {
  beforeEach(() => {
    document.documentElement.style.cssText = '';
  });

  it('should apply theme variables', () => {
    darkThemePlugin.activate();
    expect(document.documentElement.style.getPropertyValue('--color-bg-white'))
      .toBe('#0f172a');
  });

  it('should remove theme variables on deactivate', () => {
    darkThemePlugin.activate();
    darkThemePlugin.deactivate();
    expect(document.documentElement.style.getPropertyValue('--color-bg-white'))
      .toBe('');
  });
});