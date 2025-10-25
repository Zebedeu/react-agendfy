export type PluginLocation = 'left' | 'right' | 'header' | 'footer' | 'view' | 'data-source' | 'export' | 'theme' | 'ui';

export interface BasePlugin {
  key: string;
  type: string;
  enabled?: boolean;
  description?: string;
  [k: string]: any;
}

/** plugin pode ser fornecido como objeto ou loader (dynamic import) */
export type PluginInput = BasePlugin | (() => Promise<{ default: BasePlugin }>);

/** plugin record com estado */
export interface RegisteredPlugin {
  instance?: BasePlugin;
  loader?: () => Promise<BasePlugin>;
  loaded: boolean;
  enabled: boolean;
}

/** PluginManager simples: registra, carrega, ativa, desativa, lista */
export class PluginManager {
  private registry: Map<string, RegisteredPlugin> = new Map();

  register(plugin: PluginInput) {
    if (typeof plugin === 'function') {
      // loader
      // try to infer a key only after load; assign a temporary id
      const tempKey = `loader:${Math.random().toString(36).slice(2, 9)}`;
      this.registry.set(tempKey, {
        loader: async () => {
          const mod = await (plugin as () => Promise<{ default: BasePlugin }>)();
          return mod.default as BasePlugin;
        },
        loaded: false,
        enabled: true,
      });
      return tempKey;
    } else {
      const p = plugin as BasePlugin;
      if (!p.key) throw new Error('Plugin must have a key');
      this.registry.set(p.key, { instance: p, loaded: true, enabled: p.enabled !== false });
      return p.key;
    }
  }

  async load(key: string) {
    const rec = this.registry.get(key);
    if (!rec) throw new Error(`Plugin ${key} not registered`);
    if (rec.loaded && rec.instance) return rec.instance;
    if (!rec.loader) throw new Error(`Plugin ${key} has no loader`);
    const instance = await rec.loader();
    if (!instance.key) instance.key = key;
    rec.instance = instance;
    rec.loaded = true;
    rec.enabled = instance.enabled !== false;
    this.registry.set(key, rec);
    return instance;
  }

  async activate(key: string) {
    const rec = this.registry.get(key);
    if (!rec) throw new Error(`Plugin ${key} not registered`);
    const instance = rec.loaded && rec.instance ? rec.instance : await this.load(key);
    if ((instance as any).activate && typeof (instance as any).activate === 'function') {
      await (instance as any).activate();
    }
    rec.enabled = true;
    this.registry.set(key, rec);
    return instance;
  }

  async deactivate(key: string) {
    const rec = this.registry.get(key);
    if (!rec) throw new Error(`Plugin ${key} not registered`);
    if (rec.instance && (rec.instance as any).deactivate && typeof (rec.instance as any).deactivate === 'function') {
      await (rec.instance as any).deactivate();
    }
    rec.enabled = false;
    this.registry.set(key, rec);
  }

  getRegisteredKeys() {
    return Array.from(this.registry.keys());
  }

  getPluginInstance(key: string) {
    const rec = this.registry.get(key);
    return rec?.instance;
  }

  async invokeExport(key: string, ...args: any[]) {
    const instance = await this.load(key);
    if (!instance || typeof (instance as any).exportFunction !== 'function') {
      throw new Error(`Plugin ${key} is not an export plugin`);
    }
    return (instance as any).exportFunction(...args);
  }
}

export default PluginManager;