import ProfileChange from "../models/profileChange.model.js";
import Shortlist from "../models/shortlist.model.js";
import User from "../models/user.model.js";
import { sendInternalNotification } from "../controllers/notification.controller.js";

const PLAYER_TRACKED_FIELDS = [
  "name.en",
  "name.ar",
  "age",
  "gender",
  "nationality",
  "customNationality",
  "birthCountry",
  "position",
  "customPosition",
  "secondaryPosition",
  "customSecondaryPosition",
  "roleType",
  "job",
  "game",
  "height",
  "weight",
  "preferredFoot",
  "preferredHand",
  "physicalCondition",
  "contractStatus",
  "monthlySalary.amount",
  "monthlySalary.currency",
  "yearSalary.amount",
  "yearSalary.currency",
  "status",
  "isActive",
  "isConfirmed",
  "isListed",
  "isPromoted.status",
  "isPromoted.type",
  "transferredTo.club",
  "transferredTo.amount",
  "skills",
  "previousClubs",
  "media.video.url",
];

const COACH_TRACKED_FIELDS = [
  "name.en",
  "name.ar",
  "age",
  "gender",
  "nationality",
  "category",
  "contractStatus",
  "experience.years",
  "status",
  "isActive",
  "isPromoted.status",
  "isPromoted.type",
];

const SIGNIFICANT_FIELDS = [
  "name.en",
  "name.ar",
  "age",
  "nationality",
  "position",
  "secondaryPosition",
  "roleType",
  "contractStatus",
  "physicalCondition",
  "status",
  "isActive",
  "isConfirmed",
  "isListed",
  "isPromoted.status",
  "transferredTo.club",
  "game",
  "height",
  "weight",
  "preferredFoot",
  "preferredHand",
  "category",
  "experience.years",
];

const getValue = (doc, path) => {
  let cur = doc;
  for (const part of path.split(".")) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
};

const normalize = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object") {
    const { _id, ...rest } = value;
    if (Object.keys(rest).length === 0 && _id) return String(_id);
    return rest;
  }
  return value;
};

const diffProfileChanges = (before, after, trackedFields) => {
  const changes = [];
  for (const field of trackedFields) {
    const oldValue = normalize(getValue(before, field));
    const newValue = normalize(getValue(after, field));
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({ field, oldValue, newValue });
    }
  }
  return changes;
};

export const recordProfileChanges = async ({
  profileType,
  before,
  after,
  changedBy = null,
  changedByRole = null,
}) => {
  try {
    const trackedFields =
      profileType === "player" ? PLAYER_TRACKED_FIELDS : COACH_TRACKED_FIELDS;
    const changes = diffProfileChanges(before, after, trackedFields);
    if (!changes.length) return { changes: [], notified: 0 };

    const profileId = after._id;

    if (changes.length) {
      await ProfileChange.insertMany(
        changes.map((change) => ({
          profileType,
          profileId,
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
          changedBy,
          changedByRole,
        }))
      );
    }

    let notified = 0;
    const significant = changes.filter((change) =>
      SIGNIFICANT_FIELDS.includes(change.field)
    );
    if (significant.length) {
      notified = await notifyShortlistScouts(
        profileType,
        profileId,
        significant
      );
    }

    return { changes, notified };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to record profile changes:", error.message);
    }
    return { changes: [], notified: 0 };
  }
};

const notifyShortlistScouts = async (profileType, profileId, changes) => {
  try {
    const profileKey = profileType === "coach" ? "coaches" : "players";
    const shortlists = await Shortlist.find({
      [profileKey]: profileId,
    }).select("user");

    const userIds = [...new Set(shortlists.map((s) => String(s.user)))];

    const scouts = await User.find({
      _id: { $in: userIds },
      role: { $in: ["scout", "club"] },
      isActive: true,
    }).select("_id name");

    const changedLabels = changes
      .map((change) => change.field.split(".")[0])
      .filter((field, index, arr) => arr.indexOf(field) === index)
      .join(", ");

    let notified = 0;
    for (const scout of scouts) {
      await sendInternalNotification(
        scout._id,
        "Shortlisted player updated",
        `A player in your shortlist has been updated: ${changedLabels}`,
        { profileId: String(profileId), changedFields: changedLabels }
      );
      notified += 1;
    }
    return notified;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to notify shortlist scouts:", error.message);
    }
    return 0;
  }
};
