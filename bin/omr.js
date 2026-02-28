#!/usr/bin/env node

/**
 * OpenClaw Model Routing - CLI Entry Point
 * 
 * Usage: omr [command] [options]
 * 
 * Commands:
 *   interactive   - Guided model selection
 *   lookup        - Query AA API for model data
 *   detect        - Analyze prompt for task type
 *   health        - Check current OpenClaw setup
 *   config        - Generate routing rules
 *   help          - Show help
 */

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Import modules
const router = require('./src/router');
const detector = require('./src/detector');
const aaClient = require('./src/aa-client');
const config = require('./src/config');

const program = new Command();

// Configure program
program
  .name('omr')
  .description('OpenClaw Model Routing - Intelligent model selection')
  .version('1.0.0');

// Interactive mode
program
  .command('interactive')
  .description('Guided model selection')
  .action(async () => {
    console.log(chalk.cyan('\n🎯 OpenClaw Model Routing - Interactive Mode\n'));
    
    const inquirer = await import('inquirer');
    
    const answers = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'taskType',
        message: 'What are you trying to do?',
        choices: [
          { name: '💻 Coding / Programming', value: 'coding' },
          { name: '🖼️ Image Analysis / Vision', value: 'vision' },
          { name: '🧠 Complex Reasoning / Analysis', value: 'reasoning' },
          { name: '📄 Large Document Analysis', value: 'long-context' },
          { name: '💬 General Chat', value: 'general' },
          { name: '⚡ Quick Simple Task', value: 'quick' }
        ]
      },
      {
        type: 'input',
        name: 'contextSize',
        message: 'Estimated context size (tokens, press enter for default):',
        default: '1000'
      },
      {
        type: 'input',
        name: 'outputSize',
        message: 'Expected output length (press enter for default):',
        default: '1000'
      }
    ]);
    
    const recommendation = router.getRecommendation(answers.taskType, {
      contextSize: parseInt(answers.contextSize),
      outputSize: parseInt(answers.outputSize)
    });
    
    console.log(chalk.green('\n✅ Recommended Model:'));
    console.log(chalk.bold(recommendation.model));
    console.log(chalk.gray(`Reason: ${recommendation.reason}`));
    console.log(chalk.gray(`Context: ${recommendation.context}`));
    
    console.log(chalk.cyan('\nTo switch model in OpenClaw, use:'));
    console.log(chalk.bold(`  /model ${recommendation.model}\n`));
  });

// Lookup command
program
  .command('lookup')
  .description('Query Artificial Analysis API for model data')
  .option('-t, --top <number>', 'Show top N models', '10')
  .option('-p, --provider <name>', 'Filter by provider')
  .option('-i, --min-intelligence <number>', 'Minimum intelligence index')
  .action(async (options) => {
    console.log(chalk.cyan('\n📊 Fetching model data from Artificial Analysis...\n'));
    
    try {
      const models = await aaClient.getModels();
      
      let filtered = models;
      
      if (options.provider) {
        filtered = filtered.filter(m => 
          m.model_creator?.slug?.toLowerCase() === options.provider.toLowerCase()
        );
      }
      
      if (options.minIntelligence) {
        filtered = filtered.filter(m => 
          m.evaluations?.artificial_analysis_intelligence_index >= parseFloat(options.minIntelligence)
        );
      }
      
      filtered.sort((a, b) => 
        (b.evaluations?.artificial_analysis_intelligence_index || 0) - 
        (a.evaluations?.artificial_analysis_intelligence_index || 0)
      );
      
      const top = parseInt(options.top);
      filtered = filtered.slice(0, top);
      
      console.log(chalk.bold('\nTop Models by Intelligence:\n'));
      console.log(chalk.gray('Rank | Model                              | Provider   | Index | Price/1M'));
      console.log(chalk.gray('-----|------------------------------------|------------|-------|---------'));
      
      filtered.forEach((m, i) => {
        const name = m.name.padEnd(35);
        const provider = (m.model_creator?.name || 'Unknown').padEnd(10);
        const index = (m.evaluations?.artificial_analysis_intelligence_index || 'N/A').toString().padEnd(5);
        const price = `$${m.pricing?.price_1m_blended_3_to_1 || 'N/A'}`;
        
        console.log(`${(i + 1).toString().padStart(4)} | ${chalk.white(name)} | ${chalk.blue(provider)} | ${chalk.green(index)} | ${price}`);
      });
      
      console.log('');
    } catch (error) {
      console.log(chalk.red(`\n❌ Error fetching models: ${error.message}\n`));
      console.log(chalk.gray('Make sure ARTIFICIAL_ANALYSIS_API_KEY is set in your .env file'));
    }
  });

// Detect command
program
  .command('detect <prompt>')
  .description('Analyze a prompt and recommend a model')
  .action(async (prompt) => {
    const detection = detector.detectTask(prompt);
    const recommendation = router.getRecommendation(detection.taskType, detection.options);
    
    console.log(chalk.cyan('\n🤖 Task Detection Results:\n'));
    console.log(chalk.bold(`Task Type: ${detection.taskType}`));
    console.log(chalk.gray(`Detected from: ${detection.keywords.join(', ')}`));
    
    console.log(chalk.green('\n✅ Recommended Model:'));
    console.log(chalk.bold(`  ${recommendation.model}`));
    console.log(chalk.gray(`  Reason: ${recommendation.reason}`));
    console.log(chalk.gray(`  Context: ${recommendation.context}`));
    
    console.log(chalk.cyan('\n💡 To use this model:'));
    console.log(chalk.bold(`  /model ${recommendation.model}\n`));
  });

// Health check command
program
  .command('health')
  .description('Check current OpenClaw model setup')
  .action(async () => {
    console.log(chalk.cyan('\n🏥 OpenClaw Model Health Check\n'));
    
    try {
      const health = await config.getHealthCheck();
      
      console.log(chalk.bold('Current Setup:'));
      console.log(`  Default Model: ${chalk.yellow(health.currentModel)}`);
      console.log(`  Config File: ${chalk.gray(health.configPath)}`);
      
      console.log(chalk.bold('\n📊 Model Capabilities:'));
      Object.entries(health.capabilities).forEach(([model, caps]) => {
        const status = caps.supported ? chalk.green('✓') : chalk.red('✗');
        console.log(`  ${status} ${model}: ${caps.notes}`);
      });
      
      console.log(chalk.bold('\n💡 Recommendations:'));
      if (health.recommendations.length > 0) {
        health.recommendations.forEach(rec => {
          console.log(`  • ${rec}`);
        });
      } else {
        console.log('  ' + chalk.green('Your setup looks good!'));
      }
      
      console.log('');
    } catch (error) {
      console.log(chalk.red(`\n❌ Health check failed: ${error.message}\n`));
    }
  });

// Config generator command
program
  .command('config')
  .description('Generate routing configuration for openclaw.json')
  .action(() => {
    console.log(chalk.cyan('\n⚙️  Generated Routing Configuration:\n'));
    
    const configOutput = router.generateConfig();
    
    console.log(chalk.gray('Add this to your openclaw.json:'));
    console.log(chalk.white(configOutput));
    
    console.log(chalk.cyan('\n📝 Note: This is a template. Adjust rules based on your needs.\n'));
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}