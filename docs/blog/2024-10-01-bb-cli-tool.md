---
slug: bb-cli-tool
title: BB CLI Tool
authors: [basebuild]
tags: [cli, developer-experience, tools]
---

Introducing the `bb` CLI tool - a command-line interface for common development tasks.

<!-- truncate -->

## Installation

The CLI is installed automatically by `dev_setup.sh`, or manually:

```bash
sudo cp bb.sh /usr/local/bin/bb
sudo cp -r bb.d /usr/local/bin/bb.d
```

## Key Commands

### Testing

```bash
bb test           # Run all tests
bb test django    # Django tests only
bb test next      # Next.js tests
bb coverage       # Tests with coverage
```

### Database

```bash
bb db             # Database shell
bb migrate        # Run migrations
bb shell          # Django shell
```

### Docker

```bash
bb logs           # View logs
bb clean          # Clean up containers
bb stop           # Stop services
```

## Modular Architecture

The CLI uses a modular architecture where each command is a separate script in `bb.d/commands/`. This makes it easy to add custom commands for your project.

See the [CLI Tool Documentation](/docs/development/cli-tool) for the full reference.
