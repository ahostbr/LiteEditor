import { ipcMain } from 'electron'
import { SearchService, type SearchOptions } from '../services/search-service'

let searchService: SearchService | null = null

export function registerSearchHandlers(): void {
  ipcMain.handle('search:set-root', async (_e, root: string) => {
    searchService = new SearchService(root)
  })

  ipcMain.handle('search:files', async (_e, query: string, options: SearchOptions) => {
    if (!searchService) return []
    return searchService.search(query, options)
  })
}
