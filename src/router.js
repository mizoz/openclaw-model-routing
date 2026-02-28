/**
 * Model Router - Core Selection Logic
 * 
 * @description Determines the best model based on task type and requirements
 * @module src/router
 */

const models = require('../lib/models');

/**
 * Get model recommendation based on task type and options
 * 
 * @param {string} taskType - Type of task (coding, vision, reasoning, etc.)
 * @param {Object} options - Additional options
 * @param {number} options.contextSize - Estimated context size in tokens
 * @param {number} options.outputSize - Expected output size in tokens
 * @param {boolean} options.hasImage - Whether input contains images
 * @returns {Object} Recommendation with model, reason, and context
 */
function getRecommendation(taskType, options = {}) {
  const { contextSize = 0, outputSize = 0, hasImage = false } = options;
  
  // Task type to model mapping
  const taskMap = {
    'vision': {
      model: 'kimi-k2.5',
      reason: 'Only model with vision capability in your lineup',
      context: '262K context, supports images'
    },
    'coding': {
      model: contextSize > 200000 ? 'qwen3-coder-plus' : 'qwen3-coder-next',
      reason: contextSize > 200000 
        ? 'Large codebase + coding optimization' 
        : 'Coding-optimized, fast response',
      context: contextSize > 200000 ? '1M context window' : '262K context window'
    },
    'reasoning': {
      model: 'MiniMax-M2.5',
      reason: 'Highest intelligence (41.9 AA index) in your lineup',
      context: '205K context, 131K max output'
    },
    'long-context': {
      model: 'qwen3.5-plus',
      reason: 'Largest context window (1M tokens)',
      context: '1M context, also has vision support'
    },
    'general': {
      model: 'qwen3-max-2026-01-23',
      reason: 'Latest Qwen model, balanced performance',
      context: '262K context window'
    },
    'quick': {
      model: 'glm-4.7',
      reason: 'Fast, lower cost for simple tasks',
      context: '203K context, efficient for quick queries'
    }
  };
  
  // Override for long output requirements
  if (outputSize > 32000 && taskType !== 'vision') {
    return {
      model: 'MiniMax-M2.5',
      reason: 'Only model with 131K max output (your requirement)',
      context: 'MiniMax-M2.5 supports up to 131K output tokens'
    };
  }
  
  // Override for very large context
  if (contextSize > 500000) {
    return {
      model: 'qwen3-coder-plus',
      reason: 'Only option with 1M context for your needs',
      context: '1M context + coding optimization'
    };
  }
  
  // Get recommendation or default to MiniMax-M2.5
  const recommendation = taskMap[taskType] || taskMap['general'];
  
  return {
    ...recommendation,
    taskType
  };
}

/**
 * Generate routing configuration for openclaw.json
 * 
 * @returns {string} JSON configuration snippet
 */
function generateConfig() {
  const configTemplate = {
    agents: {
      defaults: {
        model: {
          primary: "bailian/MiniMax-M2.5"
        }
      }
    }
  };
  
  const routingRules = {
    routing: {
      enabled: true,
      default: "MiniMax-M2.5",
      rules: [
        {
          name: "Vision tasks",
          match: {
            hasImage: true
          },
          model: "kimi-k2.5",
          provider: "bailian"
        },
        {
          name: "Coding tasks",
          match: {
            keywords: ["code", "function", "debug", "implement", "script", "programming", "algorithm"]
          },
          model: "qwen3-coder-next",
          provider: "bailian"
        },
        {
          name: "Large context",
          match: {
            contextSize: { ">": 200000 }
          },
          model: "qwen3.5-plus",
          provider: "bailian"
        },
        {
          name: "Complex reasoning",
          match: {
            keywords: ["analyze", "reason", "explain", "compare", "evaluate", "research"]
          },
          model: "MiniMax-M2.5",
          provider: "bailian"
        },
        {
          name: "Quick tasks",
          match: {
            priority: "low"
          },
          model: "glm-4.7",
          provider: "bailian"
        }
      ]
    }
  };
  
  return JSON.stringify(routingRules, null, 2);
}

/**
 * Get all available models with their specs
 * 
 * @returns {Array} Array of model objects
 */
function getAvailableModels() {
  return models.bailianModels;
}

module.exports = {
  getRecommendation,
  generateConfig,
  getAvailableModels
};