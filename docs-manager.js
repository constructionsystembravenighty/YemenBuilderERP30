#!/usr/bin/env node

/**
 * Documentation Management Interface
 * 
 * Simple CLI tool for managing project documentation consolidation
 * Run with: node docs-manager.js [command]
 * 
 * Commands:
 *   consolidate - Merge all .md files into replit.md
 *   watch       - Start auto-consolidation watcher
 *   help        - Show help information
 */

import DocumentationConsolidator from './scripts/consolidate-docs.js';

const command = process.argv[2] || 'help';

console.log('📚 Documentation Management System');
console.log('==================================\n');

switch (command) {
  case 'consolidate':
    console.log('🔄 Running documentation consolidation...\n');
    const consolidator = new DocumentationConsolidator();
    await consolidator.consolidate();
    break;
    
  case 'watch':
    console.log('👁️  Starting auto-consolidation watcher...\n');
    console.log('⚠️  Auto-watch feature coming soon - use "consolidate" for now');
    break;
    
  case 'help':
  default:
    console.log('📖 Available commands:');
    console.log('  node docs-manager.js consolidate  - Merge all .md files into replit.md');
    console.log('  node docs-manager.js watch        - Start auto-consolidation watcher');
    console.log('  node docs-manager.js help         - Show this help\n');
    console.log('💡 The consolidation system automatically:');
    console.log('  ✓ Reads all .md files from docs/ directory');
    console.log('  ✓ Organizes content by category');
    console.log('  ✓ Updates replit.md with consolidated documentation');
    console.log('  ✓ Removes processed files to maintain single source of truth');
    console.log('  ✓ Preserves development sessions and user preferences\n');
    break;
}