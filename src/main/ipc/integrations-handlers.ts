import { BrowserWindow, ipcMain, shell } from 'electron'
import { integrationsManager } from '../services/integrations-manager'
import { type IntegrationId, type IntegrationProgress } from '../services/integrations-types'

let progressListener: ((event: IntegrationProgress) => void) | null = null
let activeMainWindow: BrowserWindow | null = null

function asIntegrationId(value: unknown): IntegrationId {
  if (value === 'codex' || value === 'claude') return value
  throw new Error(`Unknown integration id: ${String(value)}`)
}

export function registerIntegrationsHandlers(mainWindow: BrowserWindow): void {
  activeMainWindow = mainWindow

  if (!progressListener) {
    progressListener = (progress) => {
      if (activeMainWindow && !activeMainWindow.isDestroyed()) {
        activeMainWindow.webContents.send('integrations:progress', progress)
      }
    }
    integrationsManager.on('progress', progressListener)
  }

  ipcMain.handle('integrations:list-status', async () => integrationsManager.listStatus())

  ipcMain.handle('integrations:check-updates', async (_e, integrationId?: IntegrationId) => {
    if (integrationId !== undefined) {
      return integrationsManager.checkUpdates(asIntegrationId(integrationId))
    }
    return integrationsManager.checkUpdates()
  })

  ipcMain.handle('integrations:install', async (_e, integrationId: IntegrationId, options?: { reinstall?: boolean }) => {
    return integrationsManager.install(asIntegrationId(integrationId), options ?? {})
  })

  ipcMain.handle('integrations:update', async (_e, integrationId: IntegrationId) => {
    return integrationsManager.update(asIntegrationId(integrationId))
  })

  ipcMain.handle('integrations:verify', async (_e, integrationId: IntegrationId) => {
    return integrationsManager.verify(asIntegrationId(integrationId))
  })

  ipcMain.handle('integrations:reveal-path', async (_e, integrationId: IntegrationId) => {
    const path = integrationsManager.revealPath(asIntegrationId(integrationId))
    if (path) {
      await shell.openPath(path)
    }
    return path
  })
}

export function shutdownIntegrationsHandlers(): void {
  ipcMain.removeHandler('integrations:list-status')
  ipcMain.removeHandler('integrations:check-updates')
  ipcMain.removeHandler('integrations:install')
  ipcMain.removeHandler('integrations:update')
  ipcMain.removeHandler('integrations:verify')
  ipcMain.removeHandler('integrations:reveal-path')

  if (progressListener) {
    integrationsManager.off('progress', progressListener)
    progressListener = null
  }
  activeMainWindow = null
}
