/**
 * Model Specifications
 * 
 * @description Model specifications for Bailian models with AA intelligence indices
 * @module lib/models
 */

/**
 * Bailian models with specifications
 * Based on Artificial Analysis data
 */
const bailianModels = [
  {
    id: 'MiniMax-M2.5',
    name: 'MiniMax-M2.5',
    provider: 'bailian',
    contextWindow: 204800,
    maxTokens: 131072,
    vision: false,
    intelligence: 41.9,
    coding: 37.4,
    reasoning: true,
    bestFor: ['Complex reasoning', 'Analysis', 'Research', 'Long outputs'],
    notes: 'Highest intelligence in your lineup, best for complex tasks'
  },
  {
    id: 'kimi-k2.5',
    name: 'Kimi K2.5',
    provider: 'bailian',
    contextWindow: 262144,
    maxTokens: 32768,
    vision: true,
    intelligence: 46.8,
    coding: 39.5,
    reasoning: false,
    bestFor: ['Vision tasks', 'Image analysis', 'Screenshots'],
    notes: 'Only model with vision + high intelligence'
  },
  {
    id: 'qwen3-max-2026-01-23',
    name: 'Qwen3 Max (2026-01-23)',
    provider: 'bailian',
    contextWindow: 262144,
    maxTokens: 65536,
    vision: false,
    intelligence: 40,
    coding: 35,
    reasoning: false,
    bestFor: ['General purpose', 'Balanced tasks'],
    notes: 'Latest Qwen max model'
  },
  {
    id: 'glm-5',
    name: 'GLM-5',
    provider: 'bailian',
    contextWindow: 202752,
    maxTokens: 16384,
    vision: false,
    intelligence: 38,
    coding: 32,
    reasoning: false,
    bestFor: ['Balanced tasks', 'Backup'],
    notes: 'Solid mid-tier model'
  },
  {
    id: 'qwen3.5-plus',
    name: 'Qwen3.5 Plus',
    provider: 'bailian',
    contextWindow: 1000000,
    maxTokens: 65536,
    vision: true,
    intelligence: 32,
    coding: 30,
    reasoning: false,
    bestFor: ['Large context', 'Codebase analysis', 'Long documents'],
    notes: '1M context window - largest available'
  },
  {
    id: 'qwen3-coder-plus',
    name: 'Qwen3 Coder Plus',
    provider: 'bailian',
    contextWindow: 1000000,
    maxTokens: 65536,
    vision: false,
    intelligence: 30,
    coding: 35,
    reasoning: false,
    bestFor: ['Large codebase', 'Complex coding'],
    notes: 'Coding optimization + 1M context'
  },
  {
    id: 'qwen3-coder-next',
    name: 'Qwen3 Coder Next',
    provider: 'bailian',
    contextWindow: 262144,
    maxTokens: 65536,
    vision: false,
    intelligence: 32,
    coding: 36,
    reasoning: false,
    bestFor: ['Coding', 'Debugging', 'Implementation'],
    notes: 'Latest coding model, fast response'
  },
  {
    id: 'glm-4.7',
    name: 'GLM-4.7',
    provider: 'bailian',
    contextWindow: 202752,
    maxTokens: 16384,
    vision: false,
    intelligence: 28,
    coding: 25,
    reasoning: false,
    bestFor: ['Quick tasks', 'Simple queries', 'Low priority'],
    notes: 'Fast, lower cost for simple tasks'
  }
];

/**
 * Task type definitions
 */
const taskTypes = {
  vision: {
    name: 'Vision',
    emoji: '🖼️',
    requires: ['vision'],
    description: 'Image analysis, screenshots, diagrams'
  },
  coding: {
    name: 'Coding',
    emoji: '💻',
    requires: ['coding'],
    description: 'Programming, debugging, code review'
  },
  reasoning: {
    name: 'Complex Reasoning',
    emoji: '🧠',
    requires: ['reasoning'],
    description: 'Analysis, research, math, logic'
  },
  'long-context': {
    name: 'Long Context',
    emoji: '📄',
    requires: ['context'],
    description: 'Large documents, codebase analysis'
  },
  general: {
    name: 'General',
    emoji: '💬',
    requires: [],
    description: 'Standard chat and tasks'
  },
  quick: {
    name: 'Quick',
    emoji: '⚡',
    requires: [],
    description: 'Simple, fast responses'
  }
};

/**
 * Get model by ID
 * 
 * @param {string} id - Model ID
 * @returns {Object|null} Model object
 */
function getModelById(id) {
  return bailianModels.find(m => m.id === id) || null;
}

/**
 * Get models that support vision
 * 
 * @returns {Array} Vision-capable models
 */
function getVisionModels() {
  return bailianModels.filter(m => m.vision);
}

/**
 * Get models that support coding
 * 
 * @returns {Array} Coding-optimized models
 */
function getCodingModels() {
  return bailianModels.filter(m => m.coding > 30);
}

/**
 * Get models by minimum context
 * 
 * @param {number} minContext - Minimum context window
 * @returns {Array} Models meeting context requirement
 */
function getModelsByContext(minContext) {
  return bailianModels.filter(m => m.contextWindow >= minContext);
}

/**
 * Sort models by intelligence
 * 
 * @returns {Array} Models sorted by intelligence
 */
function getModelsByIntelligence() {
  return [...bailianModels].sort((a, b) => b.intelligence - a.intelligence);
}

module.exports = {
  bailianModels,
  taskTypes,
  getModelById,
  getVisionModels,
  getCodingModels,
  getModelsByContext,
  getModelsByIntelligence
};