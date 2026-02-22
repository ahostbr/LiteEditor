import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const DIR_NAME = '.liteeditor'
const STATE_FILE = 'workspace.json'
const SETTINGS_FILE = 'settings.json'

export class WorkspaceService {
  private dirPath(projectRoot: string): string {
    return join(projectRoot, DIR_NAME)
  }

  async loadState(projectRoot: string): Promise<unknown | null> {
    try {
      const content = await readFile(join(this.dirPath(projectRoot), STATE_FILE), 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  async saveState(projectRoot: string, state: string): Promise<void> {
    try {
      const dir = this.dirPath(projectRoot)
      await mkdir(dir, { recursive: true })
      await writeFile(join(dir, STATE_FILE), state, 'utf-8')
    } catch { /* ignore */ }
  }

  async loadSettings(projectRoot: string): Promise<Record<string, unknown> | null> {
    try {
      const content = await readFile(join(this.dirPath(projectRoot), SETTINGS_FILE), 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  async saveSettings(projectRoot: string, settings: string): Promise<void> {
    try {
      const dir = this.dirPath(projectRoot)
      await mkdir(dir, { recursive: true })
      await writeFile(join(dir, SETTINGS_FILE), settings, 'utf-8')
    } catch { /* ignore */ }
  }
}
