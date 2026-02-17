import { readFile, readdir, stat } from 'fs/promises'
import { join, relative, extname } from 'path'

export interface SearchOptions {
  regex?: boolean
  caseSensitive?: boolean
  wholeWord?: boolean
  include?: string
  exclude?: string
}

export interface SearchMatch {
  line: number
  col: number
  text: string
  lineContent: string
}

export interface SearchResult {
  file: string
  matches: SearchMatch[]
}

const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'out', '.cache',
  '__pycache__', '.vscode', '.idea', 'coverage', '.turbo'
])

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2',
  '.ttf', '.eot', '.mp3', '.mp4', '.zip', '.tar', '.gz', '.exe',
  '.dll', '.so', '.dylib', '.pdf', '.doc', '.xls'
])

export class SearchService {
  constructor(private root: string) {}

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!query) return []

    const files = await this.collectFiles(this.root)
    const results: SearchResult[] = []
    const pattern = this.buildPattern(query, options)

    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8')
        const lines = content.split('\n')
        const matches: SearchMatch[] = []

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          let match: RegExpExecArray | null

          const regex = new RegExp(pattern.source, pattern.flags)
          while ((match = regex.exec(line)) !== null) {
            matches.push({
              line: i + 1,
              col: match.index + 1,
              text: match[0],
              lineContent: line.trimEnd()
            })
            if (!regex.global) break
          }
        }

        if (matches.length > 0) {
          results.push({
            file: relative(this.root, file),
            matches
          })
        }
      } catch {
        // Skip files that can't be read
      }
    }

    return results
  }

  private buildPattern(query: string, options: SearchOptions): RegExp {
    let source = options.regex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    if (options.wholeWord) {
      source = `\\b${source}\\b`
    }

    const flags = options.caseSensitive ? 'g' : 'gi'
    return new RegExp(source, flags)
  }

  private async collectFiles(dir: string, files: string[] = []): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      if (IGNORED_DIRS.has(entry.name)) continue

      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        await this.collectFiles(fullPath, files)
      } else {
        const ext = extname(entry.name).toLowerCase()
        if (!BINARY_EXTENSIONS.has(ext)) {
          files.push(fullPath)
        }
      }
    }

    return files
  }
}
