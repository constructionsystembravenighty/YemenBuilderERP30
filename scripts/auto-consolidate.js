#!/usr/bin/env node

/**
 * Auto-Consolidation Watch System
 * 
 * This script automatically monitors for changes in .md files and triggers
 * consolidation when new documentation is added or existing files are modified.
 * 
 * Features:
 * - File system watcher for .md files
 * - Automatic consolidation on changes
 * - Debounced consolidation to prevent spam
 * - Logging of all consolidation activities
 */

const fs = require('fs');
const path = require('path');
const DocumentationConsolidator = require('./consolidate-docs');

class AutoConsolidationWatcher {
  constructor() {
    this.consolidator = new DocumentationConsolidator();
    this.baseDir = process.cwd();
    this.docsDir = path.join(this.baseDir, 'docs');
    this.watchedPaths = [this.docsDir, this.baseDir];
    this.consolidationTimeout = null;
    this.isConsolidating = false;
  }

  /**
   * Start watching for file changes
   */
  startWatching() {
    console.log('👁️  Starting auto-consolidation watcher...');
    
    // Watch docs directory if it exists
    if (fs.existsSync(this.docsDir)) {
      this.watchDirectory(this.docsDir);
    }
    
    // Watch root directory for .md files
    this.watchDirectory(this.baseDir);
    
    console.log('✅ Auto-consolidation watcher is active');
    console.log('📝 Monitoring for .md file changes...');
  }

  /**
   * Watch a specific directory for changes
   */
  watchDirectory(dirPath) {
    try {
      fs.watch(dirPath, { recursive: false }, (eventType, filename) => {
        if (filename && filename.endsWith('.md') && filename !== 'replit.md') {
          this.handleFileChange(eventType, filename, dirPath);
        }
      });
      
      console.log(`👀 Watching: ${dirPath}`);
    } catch (error) {
      console.warn(`⚠️  Could not watch ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Handle file change events
   */
  handleFileChange(eventType, filename, dirPath) {
    const filePath = path.join(dirPath, filename);
    
    console.log(`📝 Detected ${eventType} event for: ${filename}`);
    
    // Check if file exists (handles creation and modification)
    if (fs.existsSync(filePath)) {
      this.scheduleConsolidation();
    }
  }

  /**
   * Schedule consolidation with debouncing
   */
  scheduleConsolidation() {
    if (this.isConsolidating) {
      console.log('⏳ Consolidation already in progress, skipping...');
      return;
    }

    // Clear existing timeout
    if (this.consolidationTimeout) {
      clearTimeout(this.consolidationTimeout);
    }

    // Schedule consolidation with 2-second delay to debounce multiple changes
    this.consolidationTimeout = setTimeout(() => {
      this.performConsolidation();
    }, 2000);

    console.log('⏱️  Consolidation scheduled in 2 seconds...');
  }

  /**
   * Perform the actual consolidation
   */
  async performConsolidation() {
    if (this.isConsolidating) {
      return;
    }

    this.isConsolidating = true;
    
    try {
      console.log('\n🔄 Starting automatic consolidation...');
      await this.consolidator.consolidate();
      console.log('✅ Automatic consolidation completed\n');
    } catch (error) {
      console.error('❌ Automatic consolidation failed:', error.message);
    } finally {
      this.isConsolidating = false;
    }
  }

  /**
   * Stop watching (for graceful shutdown)
   */
  stopWatching() {
    console.log('🛑 Stopping auto-consolidation watcher...');
    if (this.consolidationTimeout) {
      clearTimeout(this.consolidationTimeout);
    }
  }
}

// CLI interface
if (require.main === module) {
  const watcher = new AutoConsolidationWatcher();
  
  console.log('🤖 Auto-Consolidation Watch System');
  console.log('===================================');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    watcher.stopWatching();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    watcher.stopWatching();
    process.exit(0);
  });

  // Start watching
  watcher.startWatching();
  
  // Keep process alive
  process.stdin.resume();
}

module.exports = AutoConsolidationWatcher;