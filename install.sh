#!/usr/bin/env bash

# OpenFGA Modeling MCP Server Installer
# Created by Andrés Aguiar
#
# This script automates the installation of:
# 1. OpenFGA Modeling MCP Server for Claude Code CLI
#
# Compatible with both bash and zsh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory (compatible with both bash and zsh)
if [ -n "${BASH_SOURCE[0]}" ]; then
    # Running in bash
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
elif [ -n "${ZSH_VERSION}" ]; then
    # Running in zsh
    SCRIPT_DIR="$(cd "$(dirname "${(%):-%N}")" && pwd)"
else
    # Fallback for other shells
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  OpenFGA Modeling MCP Server Installer                    ║${NC}"
echo -e "${BLUE}║  Created by Andrés Aguiar                                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "  Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version 18+ required (current: $(node -v))${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check Claude Code CLI
if ! command -v claude &> /dev/null; then
    echo -e "${RED}✗ Claude Code CLI not found${NC}"
    echo "  Please install Claude Code CLI first"
    echo "  Visit: https://docs.anthropic.com/claude/docs/claude-code"
    exit 1
fi
echo -e "${GREEN}✓ Claude Code CLI${NC}"

# Check OpenFGA CLI (optional but recommended)
if ! command -v fga &> /dev/null; then
    echo -e "${YELLOW}⚠ OpenFGA CLI not found (recommended)${NC}"
    echo "  Install with: brew install openfga/tap/fga"
    echo ""
    read -p "Continue without FGA CLI? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ OpenFGA CLI$(fga version | head -1)${NC}"
fi

echo ""

# Step 1: Build MCP Server
echo -e "${BLUE}[1/2] Building MCP Server...${NC}"
cd "$SCRIPT_DIR"

if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install
fi

echo "  Compiling TypeScript..."
npm run build

if [ ! -f "dist/index.js" ]; then
    echo -e "${RED}✗ Build failed - dist/index.js not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MCP Server built successfully${NC}"
echo ""

# Step 2: Register MCP Server
echo -e "${BLUE}[2/2] Registering MCP Server with Claude Code...${NC}"

# Check if already registered
if claude mcp list 2>/dev/null | grep -q "openfga"; then
    echo -e "${YELLOW}⚠ MCP server 'openfga' already registered${NC}"
    read -p "  Replace existing registration? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "  Removing existing registration..."
        claude mcp remove fga
    else
        echo "  Skipping MCP server registration"
        echo ""
        MCP_SKIPPED=true
    fi
fi

if [ "$MCP_SKIPPED" != "true" ]; then
    echo "  Registering server globally..."
    claude mcp add --scope user fga -- node "$SCRIPT_DIR/dist/index.js"

    # Verify registration
    if claude mcp list | grep -q "fga"; then
        echo -e "${GREEN}✓ MCP Server registered successfully${NC}"
    else
        echo -e "${RED}✗ MCP Server registration failed${NC}"
        exit 1
    fi
fi
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Installation Complete!                                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Restart Claude Code CLI:"
echo -e "   ${BLUE}claude${NC}"
echo ""
echo "2. Install the OpenFGA skill (maintained by the OpenFGA team):"
echo -e "   ${BLUE}npx skills add openfga/agent-skills${NC}"
echo ""
echo "3. (Optional) Register the Lucid MCP server for diagram integration:"
echo -e "   ${BLUE}claude mcp add --scope user lucid --transport http https://llm.atko.ai/lucid/mcp${NC}"
echo -e "   ${YELLOW}Note: Requires access to the internal llm.atko.ai gateway.${NC}"
echo ""
echo "4. Verify MCP tools are available:"
echo -e "   ${BLUE}What MCP tools do you have available?${NC}"
echo ""
echo "5. Try the FGA skill:"
echo -e "   ${BLUE}/openfga design an authorization model for a document management system${NC}"
echo ""
echo "6. Or just ask OpenFGA questions naturally:"
echo -e "   ${BLUE}How do I model hierarchical permissions in OpenFGA?${NC}"
echo ""
echo -e "${YELLOW}Tip:${NC} The MCP server works automatically. The /openfga skill provides"
echo "     structured workflows for complex modeling tasks."
echo ""
echo "Documentation:"
echo "  - README: $SCRIPT_DIR/README.md"
echo "  - OpenFGA skill: https://github.com/openfga/agent-skills"
echo ""
echo -e "${BLUE}Original Author: Andrés Aguiar${NC}"
echo -e "${BLUE}Original Repository: https://github.com/aaguiarz/openfga-modeling-mcp${NC}"
echo ""
