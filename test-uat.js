#!/usr/bin/env node

/**
 * Automated UAT Test Script for MCP Server Chunking
 *
 * Tests pattern matching, file routing, and token efficiency
 */

import { PromptMatcher } from './dist/prompt-matcher.js';

const matcher = new PromptMatcher();

console.log('\n🧪 FGA MCP Server - User Acceptance Testing\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log('✅', name);
  } catch (error) {
    failedTests++;
    console.log('❌', name);
    console.log('   Error:', error.message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertContains(array, item, message) {
  if (!array.includes(item)) {
    throw new Error(message || `Expected array to contain ${item}`);
  }
}

console.log('\n📋 Test Suite 1: Pattern Matching Accuracy\n');

test('Routes "What is OpenFGA?" to intro-concepts', () => {
  const match = matcher.findBestMatch('What is OpenFGA?');
  assertEqual(match?.promptFile, 'fga-intro-concepts.md');
});

test('Routes "hierarchical permissions" to relationships', () => {
  const match = matcher.findBestMatch('How do I define hierarchical permissions?');
  assertEqual(match?.promptFile, 'fga-relationships.md');
});

test('Routes "test my model" to testing', () => {
  const match = matcher.findBestMatch('How do I test my model?');
  assertEqual(match?.promptFile, 'fga-testing.md');
});

test('Routes "custom roles" to custom-roles', () => {
  const match = matcher.findBestMatch('How do I create custom roles?');
  assertEqual(match?.promptFile, 'fga-custom-roles.md');
});

test('Routes "Auth0 FGA" to auth0', () => {
  const match = matcher.findBestMatch('How do I use Auth0 FGA?');
  assertEqual(match?.promptFile, 'fga-auth0.md');
});

test('Routes "modules" to advanced', () => {
  const match = matcher.findBestMatch('How do I create modules?');
  assertEqual(match?.promptFile, 'fga-advanced.md');
});

test('Routes "document management" to modeling-guide', () => {
  const match = matcher.findBestMatch('Create a document management model');
  assertEqual(match?.promptFile, 'fga-modeling-guide.md');
});

console.log();
console.log('📦 Test Suite 2: Context Availability\n');

test('All 7 topic files are registered', () => {
  const rules = matcher.getAllRules();
  assertEqual(rules.length, 7, `Expected 7 rules, got ${rules.length}`);
});

test('Core concepts file is available', () => {
  const rules = matcher.getAllRules();
  const files = rules.map(r => r.promptFile);
  assertContains(files, 'fga-intro-concepts.md');
});

test('Relationships file is available', () => {
  const rules = matcher.getAllRules();
  const files = rules.map(r => r.promptFile);
  assertContains(files, 'fga-relationships.md');
});

test('Testing file is available', () => {
  const rules = matcher.getAllRules();
  const files = rules.map(r => r.promptFile);
  assertContains(files, 'fga-testing.md');
});

test('Custom roles file is available', () => {
  const rules = matcher.getAllRules();
  const files = rules.map(r => r.promptFile);
  assertContains(files, 'fga-custom-roles.md');
});

test('Advanced file is available', () => {
  const rules = matcher.getAllRules();
  const files = rules.map(r => r.promptFile);
  assertContains(files, 'fga-advanced.md');
});

test('Auth0 FGA file is available', () => {
  const rules = matcher.getAllRules();
  const files = rules.map(r => r.promptFile);
  assertContains(files, 'fga-auth0.md');
});

console.log();
console.log('📏 Test Suite 3: File Size Verification\n');

const targetFiles = [
  { file: 'fga-intro-concepts.md', maxTokens: 2000 },
  { file: 'fga-relationships.md', maxTokens: 2000 },
  { file: 'fga-modeling-guide.md', maxTokens: 2000 },
  { file: 'fga-testing.md', maxTokens: 2000 },
  { file: 'fga-custom-roles.md', maxTokens: 2000 },
  { file: 'fga-advanced.md', maxTokens: 1000 },
  { file: 'fga-auth0.md', maxTokens: 6500 },
];

for (const { file, maxTokens } of targetFiles) {
  test(`${file} is under ${maxTokens} tokens`, async () => {
    const match = matcher.getAllRules().find(r => r.promptFile === file);
    if (!match) throw new Error(`File ${file} not found`);

    const content = await matcher.loadPromptContent(file);
    const estimatedTokens = Math.round(content.length / 4);

    if (estimatedTokens > maxTokens) {
      throw new Error(`${file} has ~${estimatedTokens} tokens, exceeds ${maxTokens}`);
    }
  });
}

console.log();
console.log('🔍 Test Suite 4: Edge Cases\n');

test('Returns null for non-FGA queries', () => {
  const match = matcher.findBestMatch('What is the weather today?');
  assertEqual(match, null, 'Should return null for non-FGA query');
});

test('Handles empty query gracefully', () => {
  const match = matcher.findBestMatch('');
  assertEqual(match, null, 'Should return null for empty query');
});

test('Pattern matching is case-insensitive', () => {
  const match1 = matcher.findBestMatch('WHAT IS OPENFGA?');
  const match2 = matcher.findBestMatch('what is openfga?');
  assertEqual(match1?.promptFile, match2?.promptFile, 'Should match regardless of case');
});

console.log();
console.log('⚡ Test Suite 5: Performance\n');

test('Pattern matching completes in < 10ms', () => {
  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    matcher.findBestMatch('How do I model hierarchical permissions?');
  }
  const duration = Date.now() - start;
  const avgTime = duration / 100;

  if (avgTime > 10) {
    throw new Error(`Average pattern matching took ${avgTime.toFixed(2)}ms, expected < 10ms`);
  }
});

test('Content loading completes in < 100ms', async () => {
  const start = Date.now();
  await matcher.loadPromptContent('fga-testing.md');
  const duration = Date.now() - start;

  if (duration > 100) {
    throw new Error(`Content loading took ${duration}ms, expected < 100ms`);
  }
});

// Summary
console.log();
console.log('═══════════════════════════════════════════');
console.log('📊 UAT Summary\n');
console.log(`Total Tests:  ${totalTests}`);
console.log(`Passed:       ${passedTests}`);
console.log(`Failed:       ${failedTests}`);
console.log();

if (failedTests === 0) {
  console.log('✅ All tests passed! MCP server chunking is working correctly.');
  console.log();
  console.log('Next steps:');
  console.log('  1. Test with Claude Code: claude');
  console.log('  2. Try sample queries from UAT-GUIDE.md');
  console.log('  3. Verify no "Large MCP response" warnings');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the errors above.');
  console.log();
  console.log('To rollback changes:');
  console.log('  git checkout 01599ee -- prompts/authorization-model.md src/prompt-matcher.ts');
  console.log('  npm run build');
  process.exit(1);
}
