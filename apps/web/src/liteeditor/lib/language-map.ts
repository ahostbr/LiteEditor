const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".ts": "typescript",
  ".tsx": "typescriptreact",
  ".json": "json",
  ".jsonc": "jsonc",
  ".html": "html",
  ".htm": "html",
  ".css": "css",
  ".scss": "scss",
  ".less": "less",
  ".md": "markdown",
  ".mdx": "markdown",
  ".py": "python",
  ".rs": "rust",
  ".go": "go",
  ".java": "java",
  ".kt": "kotlin",
  ".c": "c",
  ".cpp": "cpp",
  ".h": "c",
  ".hpp": "cpp",
  ".cs": "csharp",
  ".rb": "ruby",
  ".php": "php",
  ".swift": "swift",
  ".sh": "shell",
  ".bash": "shell",
  ".zsh": "shell",
  ".ps1": "powershell",
  ".sql": "sql",
  ".xml": "xml",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".toml": "toml",
  ".ini": "ini",
  ".env": "dotenv",
  ".dockerfile": "dockerfile",
  ".lua": "lua",
  ".r": "r",
  ".dart": "dart",
  ".vue": "vue",
  ".svelte": "svelte",
  ".graphql": "graphql",
  ".gql": "graphql",
  ".tf": "hcl",
  ".proto": "protobuf",
};

const FILENAME_TO_LANGUAGE: Record<string, string> = {
  Dockerfile: "dockerfile",
  Makefile: "makefile",
  ".gitignore": "ignore",
  ".gitattributes": "properties",
  ".env": "dotenv",
  ".env.local": "dotenv",
  ".env.development": "dotenv",
  ".env.production": "dotenv",
};

export function getLanguageFromPath(filePath: string): string {
  const filename = filePath.split(/[\\/]/).pop() || "";

  if (FILENAME_TO_LANGUAGE[filename]) {
    return FILENAME_TO_LANGUAGE[filename];
  }

  const ext = "." + filename.split(".").pop()?.toLowerCase();
  return EXTENSION_TO_LANGUAGE[ext] || "plaintext";
}

export function getLanguageDisplayName(languageId: string): string {
  const displayNames: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    typescriptreact: "TypeScript React",
    json: "JSON",
    html: "HTML",
    css: "CSS",
    markdown: "Markdown",
    python: "Python",
    rust: "Rust",
    go: "Go",
    java: "Java",
    csharp: "C#",
    cpp: "C++",
    c: "C",
    shell: "Shell",
    powershell: "PowerShell",
    sql: "SQL",
    yaml: "YAML",
    plaintext: "Plain Text",
  };
  return displayNames[languageId] || languageId;
}
