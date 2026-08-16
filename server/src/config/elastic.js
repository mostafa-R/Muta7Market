import { Client } from '@elastic/elasticsearch';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let client = null;
let isAvailable = false;

export async function initElastic() {
  if (!config.elastic.enabled) {
    logger.info('Elasticsearch disabled — scouting engine will use MongoDB fallback');
    return null;
  }

  try {
    client = new Client({ node: config.elastic.url, requestTimeout: 3000, maxRetries: 1 });
    await client.ping();
    isAvailable = true;
    logger.info('Elasticsearch connected ✅');
  } catch (err) {
    isAvailable = false;
    logger.warn('Elasticsearch unavailable — scouting engine falls back to MongoDB:', err.message);
  }
  return client;
}

export function getElastic() {
  return isAvailable ? client : null;
}

export function isElasticReady() {
  return isAvailable && !!client;
}

export function searchIndexName() {
  return `${config.elastic.indexPrefix}-players`;
}

export async function ensureSearchIndex() {
  if (!isElasticReady()) return;
  const index = searchIndexName();
  const exists = await client.indices.exists({ index });
  if (!exists) {
    await client.indices.create({
      index,
      settings: { number_of_shards: 1, number_of_replicas: 0 },
      mappings: {
        properties: {
          playerId: { type: 'keyword' },
          name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
          sportCode: { type: 'keyword' },
          positions: { type: 'keyword' },
          heightCm: { type: 'integer' },
          weightKg: { type: 'integer' },
          preferredFoot: { type: 'keyword' },
          physicalStatus: { type: 'keyword' },
          contractStatus: { type: 'keyword' },
          birthDate: { type: 'date' },
          country: { type: 'keyword' },
          city: { type: 'text' },
          ratingAvg: { type: 'float' },
          ratingCount: { type: 'integer' },
          isFeatured: { type: 'boolean' },
          isPublic: { type: 'boolean' },
          views: { type: 'integer' },
          updatedAt: { type: 'date' },
        },
      },
    });
    logger.info(`Elasticsearch index created: ${index}`);
  }
}
