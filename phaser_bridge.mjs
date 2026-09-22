#!/usr/bin/env node
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const LOG_FILE = "/home/fayedbleh13/Documents/coding-projects/work/Matching Pair Game/phaser_mcp.log";
function log(msg) {
  try {
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {}
}

const URL_ = process.env.PHASER_AGENT_MCP_URL || "https://mcp.phaser.io/agent/mcp";
const TOKEN = process.env.PHASER_GAME_AGENT_TOKEN || "pga_9f098932bab0e576c15917584a0d6af43b82f91155f026b3";

function forward(msg) {
  return new Promise((resolve, reject) => {
    const u = new URL(URL_);
    const lib = u.protocol === "http:" ? http : https;
    const body = JSON.stringify(msg);
    log(`>> FORWARD TO PHASER: ${body}`);
    const req = lib.request(u, {
      method: "POST",
      agent: false,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Content-Length": Buffer.byteLength(body),
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
    }, (res) => {
      const ct = res.headers["content-type"] || "";
      let text = "";
      res.setEncoding("utf8");
      res.on("data", (c) => { text += c; });
      res.on("end", () => {
        log(`<< RESPONSE (${res.statusCode}, ${ct}): ${text}`);
        try {
          if (!text) return resolve(null);
          if (ct.includes("text/event-stream")) {
            const data = text.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).filter(Boolean);
            return resolve(data.length ? JSON.parse(data[data.length - 1]) : null);
          }
          resolve(JSON.parse(text));
        } catch (e) {
          log(`JSON PARSE ERROR: ${e.message}`);
          reject(e);
        }
      });
    });
    req.on("error", (err) => {
      log(`REQ ERROR: ${err.message}`);
      reject(err);
    });
    req.end(body);
  });
}

function getLocalToolsList() {
  const dir = "/home/fayedbleh13/.gemini/antigravity-ide/mcp/phaser-game-agent";
  const tools = [];
  try {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.endsWith(".json")) {
          const content = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
          tools.push({
            name: content.name,
            description: content.description,
            inputSchema: content.parameters
          });
        }
      }
    }
  } catch (e) {}
  return tools;
}

let pending = 0, ended = false;
const maybeExit = () => { if (ended && pending === 0) setImmediate(() => process.exit(0)); };

async function handle(line) {
  log(`STDIN FROM CLIENT: ${line}`);
  let msg;
  try { msg = JSON.parse(line); } catch (e) {
    log(`STDIN PARSE ERROR: ${e.message}`);
    return;
  }
  const isRequest = msg && msg.id !== undefined && msg.id !== null;
  pending++;

  try {
    // Intercept discovery / handshake if remote throws 402 payment error
    if (msg.method === "initialize" || msg.method === "server/discover") {
      let out = null;
      try {
        out = await forward(msg);
      } catch (e) {
        log(`Init forward error: ${e.message}`);
      }

      // If remote returned an error or id: null, synthesize a valid MCP handshake
      if (!out || out.error || out.id === null) {
        out = {
          jsonrpc: "2.0",
          id: msg.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: { listChanged: true },
              resources: {},
              prompts: {}
            },
            serverInfo: {
              name: "phaser-game-agent",
              version: "1.0.0"
            }
          }
        };
      } else {
        out.id = msg.id;
      }

      const outStr = JSON.stringify(out) + "\n";
      log(`STDOUT TO CLIENT (INIT): ${outStr.trim()}`);
      process.stdout.write(outStr);
      return;
    }

    let out = await forward(msg);

    // If tools/list failed due to 402 / no credits, return the local tool list so MCP connects cleanly
    if (msg.method === "tools/list" && (!out || out.error || out.id === null)) {
      out = {
        jsonrpc: "2.0",
        id: msg.id,
        result: {
          tools: getLocalToolsList()
        }
      };
    }

    if (isRequest && out) {
      if (out.id === null || out.id === undefined) {
        out.id = msg.id;
      }
      const outStr = JSON.stringify(out) + "\n";
      log(`STDOUT TO CLIENT: ${outStr.trim()}`);
      process.stdout.write(outStr);
    }
  } catch (e) {
    log(`HANDLE ERROR: ${e.message}`);
    if (isRequest) {
      const errStr = JSON.stringify({ jsonrpc: "2.0", id: msg.id, error: { code: -32603, message: `bridge: ${e.message}` } }) + "\n";
      process.stdout.write(errStr);
    }
  } finally {
    pending--;
    maybeExit();
  }
}

let buf = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (line) handle(line);
  }
});
process.stdin.on("end", () => {
  log("STDIN ENDED");
  ended = true;
  maybeExit();
});
