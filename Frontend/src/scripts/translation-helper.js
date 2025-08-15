/**
 * This script helps with identifying hardcoded text in components
 * and replacing them with translation keys.
 *
 * To use:
 * 1. Run this script with Node.js
 * 2. Check the output for identified hardcoded text
 * 3. Use the suggested translation keys in your components
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Path to translation files
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

// Function to create translation key from text
function createTranslationKey(text) {
  // Remove special characters and convert to lowercase
  const baseKey = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim()
    .replace(/\s+/g, ".");

  // Limit key length
  return baseKey.substring(0, 30);
}

// Function to find pages and components
function findReactFiles() {
  const files = glob.sync("src/app/**/*.{jsx,tsx}", {
    ignore: [
      "**/node_modules/**",
      "**/*.test.{jsx,tsx}",
      "**/*.spec.{jsx,tsx}",
    ],
  });

  return files;
}

// Function to analyze a file for hardcoded text
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Very simple regex to find potential hardcoded strings (this is not perfect)
  const jsxTextRegex = />([^<>{]+)</g;
  const stringLiteralsRegex = /(["'])((?:(?!\1).)+)\1/g;

  let match;
  const hardcodedTexts = [];

  // Find JSX text
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length > 3 && !text.includes("{") && !text.startsWith("$")) {
      hardcodedTexts.push(text);
    }
  }

  // Find string literals that might be UI text (simple heuristic)
  while ((match = stringLiteralsRegex.exec(content)) !== null) {
    const text = match[2].trim();
    if (
      text.length > 3 &&
      /^[A-Z]/.test(text) && // Starts with capital letter
      !text.includes(".") && // Not likely a file path
      !text.includes("/") && // Not likely a URL or path
      !text.includes("${") // Not a template literal
    ) {
      hardcodedTexts.push(text);
    }
  }

  return hardcodedTexts;
}

// Function to check if a text is already in translations
function isInTranslations(text) {
  const values = Object.values(enTranslations).flat(Infinity);
  return values.some(
    (v) => typeof v === "string" && v.toLowerCase() === text.toLowerCase()
  );
}

// Function to get the key for a text if it exists in translations
function getKeyForText(text) {
  for (const [key, value] of Object.entries(flattenObject(enTranslations))) {
    if (
      typeof value === "string" &&
      value.toLowerCase() === text.toLowerCase()
    ) {
      return key;
    }
  }
  return null;
}

// Helper to flatten a nested object
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

// Main function
function main() {
  const files = findReactFiles();
  console.log(`Found ${files.length} React files to analyze.`);

  for (const file of files) {
    const hardcodedTexts = analyzeFile(file);

    if (hardcodedTexts.length > 0) {
      console.log(`\n\nFile: ${file}`);
      console.log("Potential hardcoded texts:");

      hardcodedTexts.forEach((text) => {
        const existingKey = getKeyForText(text);

        if (existingKey) {
          console.log(`- "${text}" => Use: t("${existingKey}")`);
        } else {
          const suggestedKey = createTranslationKey(text);
          console.log(`- "${text}" => Suggested key: "${suggestedKey}"`);
        }
      });
    }
  }
}

// Execute
main();
