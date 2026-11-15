const { getRecommendations } = require('./recs.service');

function getPersonalizedRecommendationsSql(userId, limit = 10) {
  return getRecommendations(userId, limit);
}

module.exports = { getPersonalizedRecommendationsSql };
