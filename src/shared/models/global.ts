
declare global {
  interface Window {
    electron: any;
  }
}

// need an export for global to be affected
export function neededForGlobal() { }