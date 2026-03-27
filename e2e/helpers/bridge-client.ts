import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const PORT = 7423;
const BASE = `http://127.0.0.1:${PORT}`;

function getToken(): string {
  const tokenPath = path.join(os.homedir(), ".liteeditor", "bridge-token");
  return fs.readFileSync(tokenPath, "utf-8").trim();
}

async function request(
  method: string,
  endpoint: string,
  body?: object
): Promise<{ status: number; data: unknown }> {
  const token = getToken();
  const url = `${BASE}${endpoint}`;
  const opts: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

export const bridge = {
  async healthCheck(): Promise<boolean> {
    try {
      const { status } = await request("GET", "/pty/list");
      return status === 200;
    } catch {
      return false;
    }
  },

  async ptyList(): Promise<{ status: number; data: unknown }> {
    return request("GET", "/pty/list");
  },

  async ptyCreate(opts?: { cwd?: string; shell?: string }): Promise<{ status: number; data: unknown }> {
    return request("POST", "/pty/create", opts);
  },

  async ptyRead(sessionId: string): Promise<{ status: number; data: unknown }> {
    return request("POST", "/pty/read", { session_id: sessionId });
  },

  async ptyWrite(sessionId: string, data: string): Promise<{ status: number; data: unknown }> {
    return request("POST", "/pty/write", { session_id: sessionId, data });
  },

  async ptyKill(sessionId: string): Promise<{ status: number; data: unknown }> {
    return request("DELETE", `/pty/${sessionId}`);
  },

  async browserList(): Promise<{ status: number; data: unknown }> {
    return request("GET", "/browser/list");
  },

  async browserCreate(url?: string): Promise<{ status: number; data: unknown }> {
    return request("POST", "/browser/create", url ? { url } : {});
  },

  async browserNavigate(sessionId: string, url: string): Promise<{ status: number; data: unknown }> {
    return request("POST", `/browser/navigate`, { session_id: sessionId, url });
  },

  async browserDestroy(sessionId: string): Promise<{ status: number; data: unknown }> {
    return request("DELETE", `/browser/${sessionId}`);
  },

  async sessionList(): Promise<{ status: number; data: unknown }> {
    return request("GET", "/session/list");
  },

  async sessionRegister(body: {
    session_id: string;
    cli_type?: string;
    label?: string;
    agent_id?: string;
  }): Promise<{ status: number; data: unknown }> {
    return request("POST", "/session/register", body);
  },

  async sessionResolve(body: {
    agent_id?: string;
    label?: string;
    cli_type?: string;
  }): Promise<{ status: number; data: unknown }> {
    return request("POST", "/session/resolve", body);
  },

  async sessionUnregister(sessionId: string): Promise<{ status: number; data: unknown }> {
    return request("DELETE", `/session/${sessionId}`);
  },

  async editorOpen(filePath: string): Promise<{ status: number; data: unknown }> {
    return request("POST", "/editor/open", { filePath });
  },
};
