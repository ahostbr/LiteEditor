import { ipcMain } from 'electron'
import { ProjectService } from '../services/project-service'

const projectService = new ProjectService()

export function registerProjectHandlers(): void {
  ipcMain.handle('project:list', async () => {
    return projectService.loadProjects()
  })

  ipcMain.handle('project:add', async (_e, rootPath: string, name?: string) => {
    return projectService.addProject(rootPath, name)
  })

  ipcMain.handle('project:remove', async (_e, id: string) => {
    return projectService.removeProject(id)
  })

  ipcMain.handle('project:update', async (_e, id: string, updates: Record<string, unknown>) => {
    return projectService.updateProject(id, updates)
  })

  ipcMain.handle('project:get', async (_e, id: string) => {
    return projectService.getProject(id)
  })
}

export { projectService }
