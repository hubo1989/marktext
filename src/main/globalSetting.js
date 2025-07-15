import path from 'path'
import { app } from 'electron'

// Set `__static` path to static files in production / development depending on the environment
global.__static = path
  .join(app.isPackaged ? process.resourcesPath : process.cwd(), 'static')
  .replace(/\\/g, '\\\\')
