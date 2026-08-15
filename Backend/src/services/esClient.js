let client = null;
let initializationFailed = false;

export const isSearchEngineEnabled = () => {
  const url = process.env.ELASTICSEARCH_URL;
  return Boolean(url && url !== "disabled");
};

export const getSearchClient = async () => {
  if (!isSearchEngineEnabled() || initializationFailed) return null;
  if (client) return client;
  try {
    const { Client } = await import("@elastic/elasticsearch");
    const auth = process.env.ELASTICSEARCH_AUTH
      ? JSON.parse(process.env.ELASTICSEARCH_AUTH)
      : undefined;
    client = new Client({
      node: process.env.ELASTICSEARCH_URL,
      ...(auth ? { auth } : {}),
      maxRetries: 1,
      requestTimeout: 3000,
    });
    return client;
  } catch (error) {
    initializationFailed = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Elasticsearch client init failed:", error.message);
    }
    return null;
  }
};

export const resetSearchClient = () => {
  client = null;
  initializationFailed = false;
};
