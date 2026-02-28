/**
 * OpenClaw Model Routing - Main Entry
 * 
 * @description Main module that exports all routing functionality
 * @module openclaw-model-routing
 */

const router = require('./router');
const detector = require('./detector');
const aaClient = require('./aa-client');
const config = require('./config');
const models = require('../lib/models');

module.exports = {
  router,
  detector,
  aaClient,
  config,
  models,
  
  // Convenience functions
  detectAndRecommend: (prompt, options = {}) => {
    const detection = detector.detectTask(prompt);
    const recommendation = router.getRecommendation(detection.taskType, options);
    return { detection, recommendation };
  },
  
  getBestModel: (taskType, options = {}) => {
    return router.getRecommendation(taskType, options);
  }
};