/**
 * Artificial Analysis API Client
 * 
 * @description Fetches model data from Artificial Analysis API
 * @module src/aa-client
 */

const axios = require('axios');

// API configuration
const AA_API_BASE = 'https://artificialanalysis.ai/api/v2/data/llms';

// Cache for API responses
let cache = null;
let cacheTime = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get API key from environment
 * 
 * @returns {string} API key
 * @throws {Error} If API key not found
 */
function getApiKey() {
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
  if (!apiKey) {
    throw new Error('ARTIFICIAL_ANALYSIS_API_KEY not found in environment. Add it to your .env file.');
  }
  return apiKey;
}

/**
 * Check if cache is valid
 * 
 * @returns {boolean} True if cache is valid
 */
function isCacheValid() {
  if (!cache || !cacheTime) return false;
  return (Date.now() - cacheTime) < CACHE_TTL;
}

/**
 * Fetch all models from Artificial Analysis API
 * 
 * @param {Object} options - Fetch options
 * @param {boolean} options.forceRefresh - Force fresh fetch (ignore cache)
 * @returns {Array} Array of model objects
 */
async function getModels(options = {}) {
  const { forceRefresh = false } = options;
  
  // Return cached data if valid and not forcing refresh
  if (!forceRefresh && isCacheValid()) {
    return cache;
  }
  
  try {
    const response = await axios.get(AA_API_BASE, {
      headers: {
        'x-api-key': getApiKey()
      },
      timeout: 10000
    });
    
    if (response.data?.data) {
      // Update cache
      cache = response.data.data;
      cacheTime = Date.now();
      
      return cache;
    }
    
    throw new Error('Invalid response from Artificial Analysis API');
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Check your ARTIFICIAL_ANALYSIS_API_KEY');
    }
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Try again later.');
    }
    throw new Error(`Failed to fetch models: ${error.message}`);
  }
}

/**
 * Get models filtered by provider
 * 
 * @param {string} providerName - Provider name (e.g., 'deepseek', 'openai')
 * @returns {Array} Filtered models
 */
async function getModelsByProvider(providerName) {
  const models = await getModels();
  
  return models.filter(m => 
    m.model_creator?.slug?.toLowerCase() === providerName.toLowerCase()
  );
}

/**
 * Get top models by intelligence index
 * 
 * @param {number} limit - Number of models to return
 * @returns {Array} Top models
 */
async function getTopModels(limit = 10) {
  const models = await getModels();
  
  return models
    .filter(m => m.evaluations?.artificial_analysis_intelligence_index)
    .sort((a, b) => 
      b.evaluations.artificial_analysis_intelligence_index - 
      a.evaluations.artificial_analysis_intelligence_index
    )
    .slice(0, limit);
}

/**
 * Get models above a minimum intelligence threshold
 * 
 * @param {number} minIndex - Minimum intelligence index
 * @returns {Array} Models above threshold
 */
async function getModelsAboveThreshold(minIndex) {
  const models = await getModels();
  
  return models
    .filter(m => m.evaluations?.artificial_analysis_intelligence_index >= minIndex)
    .sort((a, b) => 
      b.evaluations.artificial_analysis_intelligence_index - 
      a.evaluations.artificial_analysis_intelligence_index
    );
}

/**
 * Find a specific model by name
 * 
 * @param {string} modelName - Model name (partial match)
 * @returns {Object|null} Model object or null
 */
async function findModel(modelName) {
  const models = await getModels();
  const lowerName = modelName.toLowerCase();
  
  return models.find(m => 
    m.name?.toLowerCase().includes(lowerName) ||
    m.slug?.toLowerCase().includes(lowerName)
  ) || null;
}

/**
 * Get model intelligence index
 * 
 * @param {string} modelName - Model name
 * @returns {number|null} Intelligence index or null
 */
async function getModelIntelligence(modelName) {
  const model = await findModel(modelName);
  return model?.evaluations?.artificial_analysis_intelligence_index || null;
}

/**
 * Clear the cache
 */
function clearCache() {
  cache = null;
  cacheTime = null;
}

module.exports = {
  getModels,
  getModelsByProvider,
  getTopModels,
  getModelsAboveThreshold,
  findModel,
  getModelIntelligence,
  clearCache
};