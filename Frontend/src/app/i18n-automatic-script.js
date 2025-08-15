// i18n-automatic-script.js
// This script helps to analyze your codebase and find hardcoded text for translation

/**
 * This is a Next.js compatible script that:
 * 1. Scans your React components for hardcoded text
 * 2. Generates translation keys for them
 * 3. Updates your translation files
 *
 * Usage:
 * node src/app/i18n-automatic-script.js
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

// Paths configuration
const componentPaths = [
  "src/app/**/*.jsx",
  "src/app/**/*.tsx",
  "src/components/**/*.jsx",
  "src/components/**/*.tsx",
];
const enTranslationsPath = path.join(
  __dirname,
  "../../public/locales/en/common.json"
);
const arTranslationsPath = path.join(
  __dirname,
  "../../public/locales/ar/common.json"
);

// Load existing translations
const enTranslations = JSON.parse(fs.readFileSync(enTranslationsPath, "utf8"));
const arTranslations = JSON.parse(fs.readFileSync(arTranslationsPath, "utf8"));

// Track new translations
const newTranslations = {};

// Function to detect hardcoded strings in a component
function detectHardcodedStrings(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const detectedStrings = [];

  try {
    const ast = parser.parse(fileContent, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "classProperties", "decorators-legacy"],
    });

    // Find JSX text
    traverse(ast, {
      JSXText(path) {
        const text = path.node.value.trim();
        if (text.length > 1 && !/^[0-9\s\-.:,;!?()[\]{}]+$/.test(text)) {
          detectedStrings.push({
            text,
            location: `line ${path.node.loc.start.line}`,
            type: "JSXText",
          });
        }
      },

      StringLiteral(path) {
        // Check if this is likely a UI text and not a file path, variable name, etc.
        const text = path.node.value.trim();
        const parent = path.parent;

        // Skip common non-UI strings
        if (
          text.length <= 1 ||
          text.includes("/") || // paths
          (text.includes(".") && !text.match(/[a-z]{2,}\.[a-z]{2,}/i)) || // file extensions
          text.match(/^[A-Z][A-Z0-9_]+$/) || // constants
          text.includes("${") || // template literals
          text.match(/^[a-z0-9_]+$/i) // variable names
        ) {
          return;
        }

        // Check if it's already in a t() call
        if (parent.type === "CallExpression" && parent.callee.name === "t") {
          return;
        }

        // Check if it's in a JSX attribute that likely needs translation
        if (
          parent.type === "JSXAttribute" &&
          ["placeholder", "title", "alt", "aria-label", "label"].includes(
            parent.name.name
          )
        ) {
          detectedStrings.push({
            text,
            location: `line ${path.node.loc.start.line}`,
            type: "JSXAttribute",
          });
        }

        // Other potential UI text in props or variables
        if (
          (parent.type === "ObjectProperty" &&
            [
              "title",
              "label",
              "message",
              "placeholder",
              "buttonText",
              "errorMessage",
            ].some((key) => parent.key && parent.key.name === key)) ||
          (parent.type === "VariableDeclarator" &&
            [
              "title",
              "label",
              "message",
              "placeholder",
              "buttonText",
              "errorMessage",
            ].some((key) => parent.id && parent.id.name === key))
        ) {
          detectedStrings.push({
            text,
            location: `line ${path.node.loc.start.line}`,
            type: "PropOrVar",
          });
        }
      },
    });
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
  }

  return detectedStrings;
}

// Function to create a translation key
function createTranslationKey(text, namespace = "ui") {
  const key = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim()
    .replace(/\s+/g, ".")
    .substring(0, 30);

  return `${namespace}.${key}`;
}

// Function to check if a translation already exists
function findExistingTranslation(text) {
  const flattened = flattenObject(enTranslations);

  for (const [key, value] of Object.entries(flattened)) {
    if (typeof value === "string" && value === text) {
      return key;
    }
  }

  return null;
}

// Helper to flatten nested objects
function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? `${prefix}.` : "";
    if (
      typeof obj[k] === "object" &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObject(obj[k], `${pre}${k}`));
    } else {
      acc[`${pre}${k}`] = obj[k];
    }
    return acc;
  }, {});
}

// Function to unflatten object for insertion
function unflattenObject(obj) {
  const result = {};

  for (const key in obj) {
    const keys = key.split(".");
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = obj[key];
  }

  return result;
}

// Function to add a translation
function addTranslation(key, enText, arText = "") {
  const parts = key.split(".");
  const namespace = parts[0];
  const restOfKey = parts.slice(1).join(".");

  if (!enTranslations[namespace]) {
    enTranslations[namespace] = {};
  }

  // For nested keys, we need to ensure the structure exists
  let current = enTranslations[namespace];
  let arCurrent = arTranslations[namespace] || {};

  const nestedParts = restOfKey.split(".");
  for (let i = 0; i < nestedParts.length - 1; i++) {
    const part = nestedParts[i];
    if (!current[part]) current[part] = {};
    if (!arCurrent[part]) arCurrent[part] = {};
    current = current[part];
    arCurrent = arCurrent[part];
  }

  const finalKey = nestedParts[nestedParts.length - 1];
  current[finalKey] = enText;

  // Ensure AR translations structure
  if (!arTranslations[namespace]) {
    arTranslations[namespace] = {};
  }

  // Add placeholder to Arabic
  arCurrent[finalKey] = arText || enText + " [AR]";

  // Track for reporting
  newTranslations[key] = { en: enText, ar: arText || enText + " [AR]" };
}

// Main function
async function main() {
  console.log("Scanning components for hardcoded text...");

  // Get all component files
  const componentFiles = [];
  for (const pattern of componentPaths) {
    const files = glob.sync(pattern);
    componentFiles.push(...files);
  }

  console.log(`Found ${componentFiles.length} component files.`);

  // Process each file
  let totalHardcodedStrings = 0;

  for (const file of componentFiles) {
    const hardcodedStrings = detectHardcodedStrings(file);

    if (hardcodedStrings.length > 0) {
      console.log(
        `\n${file} - ${hardcodedStrings.length} potential hardcoded strings`
      );

      for (const { text, location, type } of hardcodedStrings) {
        const existingKey = findExistingTranslation(text);

        if (existingKey) {
          console.log(`  [${location}] "${text}" -> use: t("${existingKey}")`);
        } else {
          // Create a namespace based on the file path
          const filePathParts = file.split("/");
          const component =
            filePathParts[filePathParts.length - 1].split(".")[0];
          const namespace =
            type === "JSXAttribute"
              ? "ui"
              : type === "JSXText"
              ? "content"
              : "common";

          const newKey = createTranslationKey(text, namespace);
          addTranslation(newKey, text);

          console.log(`  [${location}] "${text}" -> NEW: t("${newKey}")`);
        }
      }

      totalHardcodedStrings += hardcodedStrings.length;
    }
  }

  // Save updated translations
  if (Object.keys(newTranslations).length > 0) {
    fs.writeFileSync(
      enTranslationsPath,
      JSON.stringify(enTranslations, null, 2)
    );
    fs.writeFileSync(
      arTranslationsPath,
      JSON.stringify(arTranslations, null, 2)
    );

    console.log(
      `\nAdded ${
        Object.keys(newTranslations).length
      } new translations. Updated translation files!`
    );
    console.log(
      "Please review and properly translate the Arabic entries marked with [AR]."
    );
  } else {
    console.log("\nNo new translations added.");
  }

  console.log(
    `\nTotal potential hardcoded strings found: ${totalHardcodedStrings}`
  );
}

// Run the script
main().catch(console.error);
