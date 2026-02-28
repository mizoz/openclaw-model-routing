# OpenClaw Model Routing

> Auto Model Routing for OpenClaw - Intelligent model selection based on task detection using Alibaba/Bailian models.

**NOTE:** This tool is designed for use with [OpenClaw](https://github.com/openclaw/openclaw) framework. It reads your OpenClaw configuration and helps you select the optimal model for each task.

## Features

- **Model Lookup** - Query Artificial Analysis API for latest model data and rankings
- **Task Detection** - Analyze your prompt to suggest the best model automatically
- **Config Generator** - Generate routing rules for your openclaw.json
- **Interactive Mode** - Guided model selection with questions
- **Health Check** - Analyze your current setup and suggest improvements

## Requirements

- Node.js 18+
- OpenClaw installed and configured
- Artificial Analysis API key (free tier available)

## Installation

```bash
# Clone the repo
git clone https://github.com/mizoz/openclaw-model-routing.git
cd openclaw-model-routing

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env
```

## Configuration

### Getting an Artificial Analysis API Key

1. Go to [Artificial Analysis](https://artificialanalysis.ai)
2. Create an account
3. Generate an API key
4. Add it to your `.env` file:

```bash
# .env file (DO NOT COMMIT THIS)
ARTIFICIAL_ANALYSIS_API_KEY=aa_your_key_here
OPENCLAW_CONFIG_PATH=~/.openclaw/openclaw.json
```

### Setting Up Your OpenClaw Models

This tool assumes you have Bailian models configured in OpenClaw. Add these to your `openclaw.json`:

```json
{
  "models": {
    "providers": {
      "bailian": {
        "apiKey": "YOUR_BAILIAN_API_KEY",
        "models": [
          { "id": "qwen3.5-plus", "contextWindow": 1000000 },
          { "id": "qwen3-max-2026-01-23", "contextWindow": 262144 },
          { "id": "qwen3-coder-next", "contextWindow": 262144 },
          { "id": "qwen3-coder-plus", "contextWindow": 1000000 },
          { "id": "MiniMax-M2.5", "contextWindow": 204800 },
          { "id": "glm-5", "contextWindow": 202752 },
          { "id": "glm-4.7", "contextWindow": 202752 },
          { "id": "kimi-k2.5", "contextWindow": 262144 }
        ]
      }
    }
  }
}
```

## Usage

### Interactive Mode (Recommended)

```bash
npm run interactive
# or
node bin/omr.js interactive
```

This will ask you what you're trying to do and recommend the best model.

### Model Lookup

Query the latest model rankings from Artificial Analysis:

```bash
npm run lookup
# or
node bin/omr.js lookup

# Filter by specific criteria
node bin/omr.js lookup --top 5
node bin/omr.js lookup --provider deepseek
node bin bin/omr.js lookup --min-intelligence 40
```

### Task Detection

Analyze a prompt and get model recommendations:

```bash
npm run detect -- "write a function to sort an array"
# Output: Recommended model: qwen3-coder-next (coding task detected)
```

### Health Check

Analyze your current OpenClaw setup:

```bash
npm run health
# or
node bin/omr.js health
```

This will:
- Check your current default model
- Compare it to recommendations
- Suggest improvements

### Config Generator

Generate routing rules for your openclaw.json:

```bash
npm run config
# or
node bin/omr.js config

# Output routing rules you can add to openclaw.json
```

## Model Reference

| Model | Best For | Context | Index |
|-------|----------|---------|-------|
| MiniMax-M2.5 | Complex reasoning, analysis | 205K | 41.9 |
| kimi-k2.5 | Vision tasks | 262K | 46.8 |
| qwen3-max | General purpose | 262K | ~40 |
| qwen3.5-plus | Large context | 1M | ~32 |
| qwen3-coder-next | Coding | 262K | ~32 |
| qwen3-coder-plus | Large codebase | 1M | ~30 |
| glm-5 | Balanced tasks | 203K | ~38 |
| glm-4.7 | Quick tasks | 203K | ~28 |

*Index = Artificial Analysis Intelligence Index (higher = smarter)*

## Security

- **NEVER commit API keys** - Use `.env` files
- **`.gitignore` includes**: `.env`, `node_modules/`, `*.log`
- **API keys read from environment only**
- Tool reads OpenClaw config in read-only mode for analysis

## Project Structure

```
openclaw-model-routing/
├── bin/
│   └── omr.js              # CLI entry point
├── src/
│   ├── index.js            # Main module
│   ├── router.js           # Model selection logic
│   ├── detector.js         # Task type detection
│   ├── aa-client.js        # Artificial Analysis API client
│   └── config.js           # OpenClaw config handler
├── lib/
│   └── models.js           # Model specifications
├── .env.example            # Template (no real keys)
├── .gitignore              # Ignore sensitive files
├── package.json
└── README.md
```

## Commands

| Command | Description |
|---------|-------------|
| `omr` | Show help |
| `omr interactive` | Guided model selection |
| `omr lookup` | Query AA API for model data |
| `omr detect <prompt>` | Analyze prompt for task type |
| `omr health` | Check current setup |
| `omr config` | Generate routing rules |

## Examples

### Example 1: Coding Task

```bash
$ omr detect "debug this function that's not working"

🤖 Task Detected: Coding/Debugging
📊 Recommended: qwen3-coder-next
💡 Reason: Coding keywords detected
📝 Context: Short task, no special requirements
```

### Example 2: Vision Task

```bash
$ omr detect "analyze this screenshot"

🤖 Task Detected: Vision
📊 Recommended: kimi-k2.5
💡 Reason: Image/screenshot detected
📝 Context: Only model with vision capability
```

### Example 3: Large Document

```bash
$ omr detect "analyze this 500 page document"

🤖 Task Detected: Long Context
📊 Recommended: qwen3.5-plus
💡 Reason: Context > 200K tokens
📝 Context: 1M context window required
```

## Troubleshooting

### "API key not found"

Make sure you have `ARTIFICIAL_ANALYSIS_API_KEY` in your `.env` file.

### "OpenClaw config not found"

Set `OPENCLAW_CONFIG_PATH` in `.env` or use default `~/.openclaw/openclaw.json`

### "Module not found"

Run `npm install` to install dependencies.

## License

MIT

## Author

[mizoz](https://github.com/mizoz)

## Credits

- [Artificial Analysis](https://artificialanalysis.ai) for model benchmark data
- [OpenClaw](https://github.com/openclaw/openclaw) for the framework