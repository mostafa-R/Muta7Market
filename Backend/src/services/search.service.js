import { getSearchClient, isSearchEngineEnabled } from "./esClient.js";

export const SEARCH_INDEX = {
  player: "muta7_player_profiles",
  coach: "muta7_coach_profiles",
};

const INDEX_SETTINGS = {
  analysis: {
    analyzer: {
      arabic_analyzer: {
        type: "arabic",
        stopwords: "_arabic_",
      },
      text_analyzer: {
        type: "standard",
      },
    },
  },
};

const INDEX_MAPPINGS = {
  properties: {
    id: { type: "keyword" },
    "name.ar": {
      type: "text",
      analyzer: "arabic_analyzer",
      fields: { keyword: { type: "keyword" } },
    },
    "name.en": {
      type: "text",
      analyzer: "text_analyzer",
      fields: { keyword: { type: "keyword" } },
    },
    position: { type: "text", analyzer: "text_analyzer" },
    secondaryPosition: { type: "text", analyzer: "text_analyzer" },
    game: { type: "text", analyzer: "text_analyzer" },
    nationality: { type: "text", analyzer: "text_analyzer" },
    skills: {
      type: "text",
      analyzer: "text_analyzer",
      fields: { keyword: { type: "keyword" } },
    },
    previousClubs: { type: "text", analyzer: "text_analyzer" },
    category: { type: "text", analyzer: "text_analyzer" },
    status: { type: "keyword" },
    gender: { type: "keyword" },
    preferredFoot: { type: "keyword" },
    contractStatus: { type: "keyword" },
    physicalCondition: { type: "keyword" },
    age: { type: "integer" },
    height: { type: "integer" },
    weight: { type: "integer" },
    monthlySalaryAmount: { type: "integer" },
    experienceYears: { type: "integer" },
    views: { type: "integer" },
    isPromoted: { type: "boolean" },
    isPromotedEndDate: { type: "date" },
    isPro: { type: "boolean" },
    createdAt: { type: "date" },
    updatedAt: { type: "date" },
    profileImageUrl: { type: "keyword", index: false },
  },
};

const getField = (doc, path) => {
  const parts = path.split(".");
  let cur = doc;
  for (const part of parts) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
};

const toStringValue = (value) => {
  if (value == null) return null;
  if (typeof value === "string") return value || null;
  if (typeof value === "object") {
    return value.en || value.ar || null;
  }
  return String(value);
};

export const buildPlayerSearchDoc = (player) => {
  const doc = player && player.toObject ? player.toObject() : player || {};
  const rawName = doc.name;
  const name =
    typeof rawName === "object" && rawName
      ? rawName
      : { ar: rawName || null, en: rawName || null };
  const salary = doc.monthlySalary || {};
  return {
    id: String(doc._id),
    "name.ar": name.ar || null,
    "name.en": name.en || null,
    age: doc.age ?? null,
    gender: doc.gender || null,
    nationality: doc.nationality || null,
    position: toStringValue(doc.position),
    secondaryPosition: toStringValue(doc.secondaryPosition),
    game: toStringValue(doc.game),
    skills: Array.isArray(doc.skills) ? doc.skills : [],
    previousClubs: Array.isArray(doc.previousClubs) ? doc.previousClubs : [],
    status: doc.status || null,
    height: doc.height ?? null,
    weight: doc.weight ?? null,
    preferredFoot: doc.preferredFoot || null,
    contractStatus: doc.contractStatus || null,
    physicalCondition: doc.physicalCondition || null,
    monthlySalaryAmount: salary.amount ?? null,
    views: doc.views || 0,
    isPromoted: Boolean(doc.isPromoted?.status),
    isPromotedEndDate: doc.isPromoted?.endDate
      ? new Date(doc.isPromoted.endDate).toISOString()
      : null,
    isPro: Boolean(doc.isPro),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
    profileImageUrl: doc.media?.profileImage?.url || null,
  };
};

export const buildCoachSearchDoc = (coach) => {
  const doc = coach && coach.toObject ? coach.toObject() : coach || {};
  const name = doc.name || {};
  const experience = doc.experience || {};
  const salary = doc.monthlySalary || {};
  return {
    id: String(doc._id),
    "name.ar": name.ar || null,
    "name.en": name.en || null,
    age: doc.age ?? null,
    gender: doc.gender || null,
    nationality: doc.nationality || null,
    category: doc.category || null,
    status: doc.status || null,
    contractStatus: doc.contractStatus || null,
    experienceYears: experience.years ?? null,
    monthlySalaryAmount: salary.amount ?? null,
    views: doc.views || 0,
    isPromoted: Boolean(doc.isPromoted?.status),
    isPromotedEndDate: doc.isPromoted?.endDate
      ? new Date(doc.isPromoted.endDate).toISOString()
      : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
    profileImageUrl: doc.media?.profileImage?.url || null,
  };
};

const shouldIndexPlayer = (player) =>
  Boolean(player && player.isActive && player.isConfirmed);

const shouldIndexCoach = (coach) => Boolean(coach && coach.isActive);

export const shouldIndex = (type, doc) =>
  type === "player"
    ? shouldIndexPlayer(doc)
    : type === "coach"
      ? shouldIndexCoach(doc)
      : false;

export const ensureSearchIndexes = async () => {
  if (!isSearchEngineEnabled()) return null;
  const client = await getSearchClient();
  if (!client) return null;
  const results = {};
  for (const [type, index] of Object.entries(SEARCH_INDEX)) {
    try {
      const exists = await client.indices.exists({ index });
      if (!exists) {
        await client.indices.create({
          index,
          settings: INDEX_SETTINGS,
          mappings: INDEX_MAPPINGS,
        });
      } else {
        try {
          await client.indices.putMapping({ index, properties: INDEX_MAPPINGS.properties });
        } catch (mappingError) {
          if (process.env.NODE_ENV !== "production") {
            console.error(`ES mapping update error [${type}]:`, mappingError.message);
          }
        }
      }
      results[type] = "ready";
    } catch (error) {
      results[type] = `error: ${error.message}`;
    }
  }
  return results;
};

export const indexProfile = async (type, doc) => {
  if (!isSearchEngineEnabled() || !shouldIndex(type, doc)) {
    if (isSearchEngineEnabled() && !shouldIndex(type, doc)) {
      await removeProfile(type, doc?._id);
    }
    return null;
  }
  const client = await getSearchClient();
  if (!client) return null;
  const index = SEARCH_INDEX[type];
  if (!index) return null;
  const body = type === "player" ? buildPlayerSearchDoc(doc) : buildCoachSearchDoc(doc);
  try {
    await client.index({ index, id: String(doc._id), body, refresh: false });
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`ES index error [${type}]:`, error.message);
    }
    return null;
  }
};

export const removeProfile = async (type, id) => {
  if (!isSearchEngineEnabled() || !id) return null;
  const client = await getSearchClient();
  if (!client) return null;
  const index = SEARCH_INDEX[type];
  if (!index) return null;
  try {
    await client.delete({ index, id: String(id) }, { ignore: [404] });
    return true;
  } catch (error) {
    return null;
  }
};

const buildRange = (min, max) => {
  const range = {};
  if (min != null && min !== "") range.gte = Number(min);
  if (max != null && max !== "") range.lte = Number(max);
  return Object.keys(range).length ? range : null;
};

const buildSearchQuery = (type, { q, filters = {} }) => {
  const must = [];
  const filter = [];

  if (q) {
    const fields =
      type === "player"
        ? ["name.en", "name.ar", "position", "secondaryPosition", "game", "skills", "previousClubs", "nationality"]
        : ["name.en", "name.ar", "category", "nationality"];
    must.push({
      multi_match: { query: q, fields, type: "best_fields", fuzziness: "AUTO" },
    });
  }

  if (filters.position) filter.push({ match: { position: filters.position } });
  if (filters.secondaryPosition)
    filter.push({ match: { secondaryPosition: filters.secondaryPosition } });
  if (filters.nationality)
    filter.push({ match: { nationality: filters.nationality } });
  if (filters.status) filter.push({ term: { status: filters.status } });
  if (filters.preferredFoot)
    filter.push({ term: { preferredFoot: filters.preferredFoot } });
  if (filters.contractStatus)
    filter.push({ term: { contractStatus: filters.contractStatus } });
  if (filters.physicalCondition)
    filter.push({ term: { physicalCondition: filters.physicalCondition } });
  if (filters.isPromoted !== undefined) {
    if (String(filters.isPromoted) === "true") {
      filter.push({
        bool: {
          must: [
            { term: { isPromoted: true } },
            {
              range: {
                isPromotedEndDate: { gte: new Date().toISOString() },
              },
            },
          ],
        },
      });
    } else {
      filter.push({ term: { isPromoted: false } });
    }
  }
  if (filters.gender) filter.push({ term: { gender: filters.gender } });
  if (filters.category)
    filter.push({ term: { "category.keyword": filters.category } });

  const ageRange = buildRange(filters.ageMin, filters.ageMax);
  if (ageRange) filter.push({ range: { age: ageRange } });
  const heightRange = buildRange(filters.heightMin, filters.heightMax);
  if (heightRange) filter.push({ range: { height: heightRange } });
  const weightRange = buildRange(filters.weightMin, filters.weightMax);
  if (weightRange) filter.push({ range: { weight: weightRange } });
  const salaryRange = buildRange(filters.salaryMin, filters.salaryMax);
  if (salaryRange) filter.push({ range: { monthlySalaryAmount: salaryRange } });
  const expRange = buildRange(filters.experienceMin, filters.experienceMax);
  if (expRange) filter.push({ range: { experienceYears: expRange } });

  if (filters.skills) {
    const skillsArr = String(filters.skills)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (skillsArr.length) filter.push({ terms: { "skills.keyword": skillsArr } });
  }

  const query = {
    bool: { ...(must.length ? { must } : {}) },
  };
  if (filter.length) query.bool.filter = filter;
  if (!must.length && !filter.length) {
    return { match_all: {} };
  }
  return query;
};

const buildSort = (type, sortBy) => {
  if (sortBy === "salary") return [{ monthlySalaryAmount: { order: "desc" } }];
  if (sortBy === "age") return [{ age: { order: "asc" } }];
  if (sortBy === "views") return [{ views: { order: "desc" } }];
  return [
    { isPromoted: { order: "desc" } },
    { isPro: { order: "desc" } },
    { createdAt: { order: "desc" } },
  ];
};

export const search = async (
  type,
  { q, filters = {}, from = 0, size = 10, sortBy = "date" }
) => {
  if (!isSearchEngineEnabled()) return null;
  const client = await getSearchClient();
  if (!client) return null;
  const index = SEARCH_INDEX[type];
  if (!index) return null;
  try {
    const result = await client.search({
      index,
      from,
      size,
      query: buildSearchQuery(type, { q, filters }),
      sort: buildSort(type, sortBy),
    });
    const ids = result.hits.hits.map((hit) => hit._id);
    return {
      ids,
      total: typeof result.hits.total === "number" ? result.hits.total : result.hits.total?.value || 0,
      took: result.took,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`ES search error [${type}]:`, error.message);
    }
    return null;
  }
};

export const reindexAll = async () => {
  if (!isSearchEngineEnabled()) {
    return { enabled: false, message: "Elasticsearch is disabled" };
  }
  const { default: Player } = await import("../models/player.model.js");
  const { default: Coach } = await import("../models/coach.model.js");

  let playersIndexed = 0;
  let coachesIndexed = 0;
  let errors = [];

  const playerCursor = Player.find({ isActive: true, isConfirmed: true })
    .lean()
    .cursor();
  for await (const doc of playerCursor) {
    try {
      const ok = await indexProfile("player", doc);
      if (ok) playersIndexed += 1;
    } catch (error) {
      errors.push(`player:${doc._id}: ${error.message}`);
    }
  }

  const coachCursor = Coach.find({ isActive: true }).lean().cursor();
  for await (const doc of coachCursor) {
    try {
      const ok = await indexProfile("coach", doc);
      if (ok) coachesIndexed += 1;
    } catch (error) {
      errors.push(`coach:${doc._id}: ${error.message}`);
    }
  }

  return {
    enabled: true,
    playersIndexed,
    coachesIndexed,
    errors: errors.slice(0, 20),
  };
};
