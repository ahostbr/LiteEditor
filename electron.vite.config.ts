import { resolve } from 'path'
import { execSync } from 'child_process'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

let commitHash = 'unknown'
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim()
} catch { /* not a git repo */ }

const buildDate = new Date().toISOString().split('T')[0]

const buildDefines = {
  __COMMIT_HASH__: JSON.stringify(commitHash),
  __BUILD_DATE__: JSON.stringify(buildDate)
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    define: buildDefines,
    build: {
      rollupOptions: {
        external: ['node-pty', 'better-sqlite3']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    define: buildDefines,
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/preload/index.ts'),
          'claude-preload': resolve('src/main/claude/claude-preload.ts'),
          'codex-preload': resolve('src/main/codex/codex-preload.ts')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer')
      }
    },
    define: buildDefines,
    plugins: [react()],
    css: {
      postcss: './postcss.config.js'
    }
  }
})
