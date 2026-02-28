/**
 * OpenClaw Config Handler
 * 
 * @description Reads and analyzes OpenClaw configuration
 * @module src/config
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Get OpenClaw config path
 * 
 * @returns {string} Config file path
 */
function getConfigPath() {
  return process.env.OPENCLAW_CONFIG_PATH || 
         path.join(os.homedir(), '.openclaw', 'openclaw.json');
}

/**
 * Read OpenClaw config
 * 
 * @returns {Object} Config object
 * @throws {Error} If config not found or invalid
 */
function readConfig() {
  const configPath = getConfigPath();
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`OpenClaw config not found at: ${configPath}`);
  }
  
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    throw new Error(`Failed to parse OpenClaw config: ${error.message}`);
  }
}

/**
 * Get current default model
 * 
 * @returns {string} Model name
 */
function getDefaultModel() {
  try {
    const config = readConfig();
    return config.agents?.defaults?.model?.primary || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Get available models in config
 * 
 * @returns {Array} Array of model objects
 */
function getConfiguredModels() {
  try {
    const config = readConfig();
    const models = config.models?.providers?.bailian?.models || [];
    return models.map(m => ({
      id: m.id,
      name: m.name,
      contextWindow: m.contextWindow,
      maxTokens: m.maxTokens,
      vision: m.input?.includes('image')
    }));
  } catch {
    return [];
  }
}

/**
 * Check if a model is configured
 * 
 * @param {string} modelId - Model ID
 * @returns {boolean} True if configured
 */
function isModelConfigured(modelId) {
  const models = getConfiguredModels();
  return models.some(m => m.id === modelId || m.name === modelId);
}

/**
 * Get health check results
 * 
 * @returns {Object} Health check results
 */
async function getHealthCheck() {
  const results = {
    currentModel: 'unknown',
    configPath: getConfigPath(),
    capabilities: {},
    recommendations: []
  };
  
  // Get current model
  results.currentModel = getDefaultModel();
  
  // Get configured models
  const configuredModels = getConfiguredModels();
  
  // Check capabilities
  const requiredCapabilities = {
    'MiniMax-M2.5': { supported: false, notes: 'Complex reasoning, 131K output' },
    'kimi-k2.5': { supported: false, notes: 'Vision tasks' },
    'qwen3-coder-next': { supported: false, notes: 'Coding' },
    'qwen3.5-plus': { supported: false, notes: 'Large context (1M)' },
    'qwen3-max-2026-01-23': { supported: false, notes: 'General purpose' },
    'glm-4.7': { supported: false, notes: 'Quick tasks' }
  };
  
  for (const model of configuredModels) {
    if (requiredCapabilities[model.id]) {
      requiredCapabilities[model.id].supported = true;
    }
  }
  
  results.capabilities = requiredCapabilities;
  
  // Generate recommendations
  if (results.currentModel === 'bailian/qwen3.5-plus' || 
      results.currentModel === 'qwen3.5-plus') {
    results.recommendations.push(
      'Consider switching default to MiniMax-M2.5 for higher intelligence (41.9 AA index)'
    );
  }
  
  if (!requiredCapabilities['MiniMax-M2.5'].supported) {
    results.recommendations.push(
      'Add MiniMax-M2.5 to your Bailian models for complex reasoning tasks'
    );
  }
  
  if (!requiredCapabilities['kimi-k2.5'].supported) {
    results.recommendations.push(
      'Add kimi-k2.5 for vision/image analysis tasks'
    );
  }
  
  if (!requiredCapabilities['qwen3-coder-next'].supported) {
    results.recommendations.push(
      'Add qwen3-coder-next for coding tasks'
    );
  }
  
  if (results.recommendations.length === 0) {
    results.recommendations.push('Your model setup looks optimal!');
  }
  
  return results;
}

/**
 * Validate config structure
 * 
 * @returns {Object} Validation results
 */
function validateConfig() {
  const results = {
    valid: true,
    errors: [],
    warnings: []
  };
  
  try {
    const config = readConfig();
    
    // Check for required sections
    if (!config.models) {
      results.errors.push('Missing "models" section');
      results.valid = false;
    }
    
    if (!config.models?.providers?.bailian) {
      results.errors.push('Missing Bailian provider configuration');
      results.valid = false;
    }
    
    if (!config.agents?.defaults?.model?.primary) {
      results.warnings.push('No default model configured');
    }
    
    // Check for API key (warning only - shouldn't be in config)
    const configStr = JSON.stringify(config);
    if (configStr.includes('sk-')) {
      results.warnings.push('API key found in config - consider using environment variables');
    }
    
  } catch (error) {
    results.valid = false;
    results.errors.push(error.message);
  }
  
  return results;
}

module.exports = {
  getConfigPath,
  readConfig,
  getDefaultModel,
  getConfiguredModels,
  isModelConfigured,
  getHealthCheck,
  validateConfig
};