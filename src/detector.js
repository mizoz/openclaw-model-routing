/**
 * Task Detector - Analyzes prompts to determine task type
 * 
 * @description Detects what type of task the user is trying to accomplish
 * @module src/detector
 */

// Keyword mappings for different task types
const taskKeywords = {
  vision: [
    'image', 'picture', 'photo', 'screenshot', 'diagram', 'chart', 'graph',
    'visual', 'analyze image', 'what is this', 'describe this', 'see',
    'ocr', 'read image', 'analyze screenshot', 'ui', 'interface'
  ],
  coding: [
    'code', 'function', 'debug', 'implement', 'script', 'programming',
    'algorithm', 'refactor', 'review code', 'write code', 'fix',
    'class', 'method', 'api', 'endpoint', 'database', 'query',
    'regex', 'validate', 'parse', 'compile', 'build', 'test'
  ],
  reasoning: [
    'analyze', 'reason', 'explain why', 'compare', 'evaluate',
    'research', 'investigate', 'break down', 'solve', 'prove',
    'hypothesis', 'strategy', 'implications', 'consequences',
    'math', 'calculate', 'derive', 'logic', 'critical'
  ],
  'long-context': [
    'document', 'pdf', 'book', 'article', 'report', 'analyze',
    'summarize', 'large', '100k', '200k', 'million', 'tokens',
    'context', 'full repo', 'codebase', 'parse', 'extract'
  ],
  general: [
    'what', 'how', 'tell me', 'explain', 'write', 'create',
    'make', 'generate', 'help', 'assistant', 'question'
  ],
  quick: [
    'quick', 'simple', 'fast', 'just', 'brief', 'short',
    'one line', 'basic', 'small', 'minor', 'tiny'
  ]
};

/**
 * Detect task type from a prompt
 * 
 * @param {string} prompt - The user's input prompt
 * @returns {Object} Detection result with task type and metadata
 */
function detectTask(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Check each task type for keyword matches
  const matches = {};
  const matchedKeywords = {};
  
  for (const [taskType, keywords] of Object.entries(taskKeywords)) {
    const taskMatches = keywords.filter(kw => lowerPrompt.includes(kw));
    if (taskMatches.length > 0) {
      matches[taskType] = taskMatches.length;
      matchedKeywords[taskType] = taskMatches;
    }
  }
  
  // Determine primary task type (highest match count)
  let taskType = 'general';
  let maxMatches = 0;
  
  for (const [task, count] of Object.entries(matches)) {
    if (count > maxMatches) {
      maxMatches = count;
      taskType = task;
    }
  }
  
  // Special case: coding takes priority over general
  if (matches.coding && matches.coding >= 1) {
    taskType = 'coding';
  }
  
  // Special case: vision takes priority over most
  if (matches.vision && matches.vision >= 1) {
    taskType = 'vision';
  }
  
  // Extract additional options from prompt
  const options = extractOptions(prompt);
  
  return {
    taskType,
    keywords: matchedKeywords[taskType] || [],
    confidence: maxMatches > 0 ? Math.min(maxMatches / 3, 1) : 0.3,
    options
  };
}

/**
 * Extract additional options from prompt
 * 
 * @param {string} prompt - The user's input prompt
 * @returns {Object} Extracted options
 */
function extractOptions(prompt) {
  const options = {
    contextSize: 1000,
    outputSize: 1000,
    hasImage: false,
    priority: 'normal'
  };
  
  const lowerPrompt = prompt.toLowerCase();
  
  // Estimate context size from prompt hints
  if (lowerPrompt.includes('large') || lowerPrompt.includes('huge')) {
    options.contextSize = 100000;
  } else if (lowerPrompt.includes('million') || lowerPrompt.includes('1000k')) {
    options.contextSize = 1000000;
  } else if (lowerPrompt.includes('document') || lowerPrompt.includes('file')) {
    options.contextSize = 50000;
  }
  
  // Check for image input
  if (lowerPrompt.includes('screenshot') || 
      lowerPrompt.includes('image') || 
      lowerPrompt.includes('picture') ||
      lowerPrompt.includes('photo')) {
    options.hasImage = true;
  }
  
  // Check priority
  if (lowerPrompt.includes('quick') || lowerPrompt.includes('fast')) {
    options.priority = 'low';
  } else if (lowerPrompt.includes('important') || lowerPrompt.includes('critical')) {
    options.priority = 'high';
  }
  
  // Check for long output needs
  if (lowerPrompt.includes('long') || 
      lowerPrompt.includes('detailed') || 
      lowerPrompt.includes('comprehensive')) {
    options.outputSize = 10000;
  }
  
  return options;
}

/**
 * Get list of all supported task types
 * 
 * @returns {Array} Array of task type strings
 */
function getSupportedTaskTypes() {
  return Object.keys(taskKeywords);
}

module.exports = {
  detectTask,
  extractOptions,
  getSupportedTaskTypes
};