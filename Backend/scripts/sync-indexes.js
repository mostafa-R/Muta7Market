// scripts/sync-indexes.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import Advertisement from "../src/models/advertisement.model.js";
// Import other models here if you have them, remember to add .js extension

dotenv.config();

const models = {
  Advertisement,
  // Add other models here
};

async function syncIndexes() {
  try {
    console.log("Connecting to the database...");
    await connectDB();
    console.log("Database connected.");

    for (const modelName in models) {
      if (Object.hasOwnProperty.call(models, modelName)) {
        const model = models[modelName];
        console.log(`Syncing indexes for ${modelName}...`);
        await model.syncIndexes();
        console.log(`Indexes for ${modelName} synced successfully.`);
      }
    }

    console.log("All indexes have been synced successfully.");
  } catch (error) {
    console.error("Error syncing indexes:", error);
  } finally {
    console.log("Closing database connection.");
    await mongoose.connection.close();
  }
}

syncIndexes();
