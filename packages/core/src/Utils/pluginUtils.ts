// utilitários usados pelos plugins (download, aplicação de tema, validação)
export const downloadBlob = (data: Blob | string, filename = 'export') => {
  const blob = typeof data === 'string' ? new Blob([data], { type: 'text/plain;charset=utf-8' }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const applyCssVariables = (vars: Record<string, string>, scope: HTMLElement | Document = document.documentElement) => {
  const el = scope instanceof HTMLElement ? scope : document.documentElement;
  Object.entries(vars).forEach(([k, v]) => {
    el.style.setProperty(k, v);
  });
};

export const removeCssVariables = (vars: Record<string, string>, scope: HTMLElement | Document = document.documentElement) => {
  const el = scope instanceof HTMLElement ? scope : document.documentElement;
  Object.keys(vars).forEach(k => el.style.removeProperty(k));
};