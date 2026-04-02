import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface PromptRule {
  patterns: string[];
  promptFile: string;
  description: string;
}

export class PromptMatcher {
  private rules: PromptRule[] = [
    {
      patterns: [
        'what is openfga',
        'what is fga',
        'introduction',
        'core concept',
        'building block',
        'type definition',
        'object definition',
        'user definition',
        'relation definition',
        'relationship tuple',
        'authorization tuple',
        'tuple',
        'dsl',
        'modeling language',
        'schema',
        'zanzibar',
        'rebac',
        'relationship based access control',
        'explain fga',
        'fga basics',
        'fga fundamentals',
        'getting started'
      ],
      promptFile: 'fga-intro-concepts.md',
      description: 'OpenFGA introduction and core concepts'
    },
    {
      patterns: [
        'direct relationship',
        'concentric relationship',
        'indirect relationship',
        'x from y',
        'from keyword',
        'condition',
        'conditional',
        'userset',
        'group based',
        'hierarchical permission',
        'inherit permission',
        'parent child',
        'nested permission',
        'cel',
        'common expression language'
      ],
      promptFile: 'fga-relationships.md',
      description: 'Defining relationships in OpenFGA'
    },
    {
      patterns: [
        'custom role',
        'user defined role',
        'role assignment',
        'dynamic role',
        'assignee',
        'role#assignee',
        'flexible role',
        'user create role',
        'create role',
        'define role'
      ],
      promptFile: 'fga-custom-roles.md',
      description: 'Custom roles patterns'
    },
    {
      patterns: [
        'auth0 fga',
        'okta fga',
        'hosted fga',
        'dashboard.fga.dev',
        'fga.dev',
        'dashboard',
        'store id',
        'api token',
        'fga store',
        'managed service',
        'cloud fga',
        'fga sdk',
        '@auth0/fga',
        'deployment',
        'production',
        'store assertion',
        'dashboard assertion',
        'push assertion',
        'import assertion',
        'import store',
        'store import',
        'fga store import',
        'persistent assertion',
        'store export',
        'fga store export'
      ],
      promptFile: 'fga-auth0.md',
      description: 'Auth0 FGA hosted service'
    },
    {
      patterns: [
        'test',
        'testing',
        'validate',
        'validation',
        'fga.yaml',
        '.fga.yaml',
        'test file',
        'assertion',
        'check test',
        'list_objects',
        'list_users',
        'fga model test',
        'fga cli',
        'cli command'
      ],
      promptFile: 'fga-testing.md',
      description: 'Testing and validating FGA models'
    },
    {
      patterns: [
        'create module',
        'module',
        'modular',
        'fga.mod',
        'extend type',
        'multi product',
        'split model',
        'best practice',
        'performance',
        'optimization'
      ],
      promptFile: 'fga-advanced.md',
      description: 'Advanced topics and modules'
    },
    {
      patterns: [
        'how do i create',
        'how to model',
        'step by step',
        'build a model',
        'create a model',
        'author a model',
        'document management',
        'folder structure',
        'permission example',
        'modeling process',
        'design model',
        'can_ permission',
        'define permission',
        'add permission'
      ],
      promptFile: 'fga-modeling-guide.md',
      description: 'Step-by-step modeling guide'
    }
  ];

  /**
   * Find the best matching prompt based on the query
   */
  public findBestMatch(query: string): PromptRule | null {
    const lowercaseQuery = query.toLowerCase();
    console.error(`[DEBUG] Matching query: "${query}"`);
    
    // Look for exact matches first
    for (const rule of this.rules) {
      for (const pattern of rule.patterns) {
        if (lowercaseQuery.includes(pattern.toLowerCase())) {
          console.error(`[DEBUG] Pattern match found: "${pattern}" -> ${rule.promptFile}`);
          return rule;
        }
      }
    }
    
    console.error(`[DEBUG] No pattern match found for query: "${query}"`);
    return null;
  }

  /**
   * Get all available rules
   */
  public getAllRules(): PromptRule[] {
    return [...this.rules];
  }

  /**
   * Load prompt content from file
   */
  public async loadPromptContent(promptFile: string): Promise<string> {
    // Use the MCP server's installation directory, not the current working directory
    // __dirname points to dist/, so go up one level to reach the prompts/ directory
    const promptsDir = path.join(__dirname, '..', 'prompts');
    const filePath = path.join(promptsDir, promptFile);

    console.error(`[DEBUG] Loading prompt file: ${filePath}`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      console.error(`[DEBUG] Successfully loaded prompt file: ${promptFile} (${content.length} chars)`);
      return content;
    } catch (error) {
      console.error(`[ERROR] Failed to load prompt file ${promptFile}:`, error);
      throw new Error(`Failed to load prompt file ${promptFile}: ${error}`);
    }
  }

  /**
   * Get context for a query
   */
  public async getContextForQuery(query: string): Promise<{
    rule: PromptRule | null;
    content: string | null;
    matchFound: boolean;
  }> {
    const rule = this.findBestMatch(query);
    
    if (!rule) {
      return {
        rule: null,
        content: null,
        matchFound: false
      };
    }

    try {
      const content = await this.loadPromptContent(rule.promptFile);
      return {
        rule,
        content,
        matchFound: true
      };
    } catch (error) {
      throw new Error(`Error loading context: ${error}`);
    }
  }
}
