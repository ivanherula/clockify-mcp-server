# @ivanherula/clockify-mcp-server

An MCP (Model Context Protocol) server for [Clockify](https://clockify.me) time tracking. Exposes Clockify functionality as tools that Claude and other MCP-compatible LLM clients can invoke.

## Installation

```bash
npx @ivanherula/clockify-mcp-server
```

Or install globally:

```bash
npm install -g @ivanherula/clockify-mcp-server
clockify-mcp-server
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOCKIFY_API_KEY` | **Yes** | Your Clockify API key (found in Profile Settings → API) |
| `CLOCKIFY_WORKSPACE_ID` | No | Override workspace ID. If omitted, the first workspace is used automatically. |

## Configuration

### Claude Desktop (`claude_desktop_config.json`)

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "clockify": {
      "command": "npx",
      "args": ["-y", "@ivanherula/clockify-mcp-server@latest"],
      "env": {
        "CLOCKIFY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Claude Code (`claude.json`)

```json
{
  "mcpServers": {
    "clockify": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "@ivanherula/clockify-mcp-server@latest"
      ],
      "env": {
        "CLOCKIFY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Local development / testing

```json
{
  "mcpServers": {
    "clockify": {
      "command": "node",
      "args": ["/path/to/clockify-mcp-server/build/index.js"],
      "env": {
        "CLOCKIFY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_workspaces` | List all workspaces |
| `get_current_user` | Get authenticated user info |
| `get_projects` | List projects (filter by name, archived; paginated) |
| `get_clients` | List clients (filter by name, archived; paginated) |
| `get_tags` | List tags (filter by name, archived; paginated) |
| `get_time_entries` | List time entries with optional date range filter |
| `get_current_timer` | Get the currently running timer (null if none) |
| `create_time_entry` | Create a time entry; omit `end` to start a live timer |
| `stop_timer` | Stop the running timer with an end time |
| `update_time_entry` | Full replace of a time entry (requires `start`) |
| `delete_time_entry` | Delete a time entry by ID |

## Testing with MCP Inspector

```bash
CLOCKIFY_API_KEY=your_key npx @modelcontextprotocol/inspector node build/index.js
```

Opens at `http://localhost:5173` where you can interactively test all tools.

## License

MIT
