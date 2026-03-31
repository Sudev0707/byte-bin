require("dotenv").config();

const mongoose = require("mongoose");
const { createClerkClient } = require("@clerk/backend");
const connectDB = require("../config/db");
const User = require("../models/User");

// Initialized in `main()` after env validation.
let clerkClient;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildDisplayName(clerkUser) {
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");
  return fullName || clerkUser.username || "Anonymous";
}

async function upsertOne(clerkUserId) {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  const userData = {
    clerkId: clerkUserId,
    name: buildDisplayName(clerkUser),
    username: clerkUser.username || "",
    imageUrl: clerkUser.imageUrl,
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || "",
  };

  // Avoid setting emails that would collide with an existing (different) Clerk user.
  // The schema doesn't enforce uniqueness on `email`, but we still avoid corrupting data.
  if (email) {
    const existingByEmail = await User.findOne({ email }).select("clerkId");
    if (!existingByEmail) {
      userData.email = email;
    } else if (existingByEmail.clerkId === clerkUserId) {
      userData.email = email;
    } else {
      console.warn(
        `[WARN] Email collision for email="${email}". Skipping email field for clerkId="${clerkUserId}".`
      );
    }
  }

  // Preserve existing app-specific fields (submissions/stats) if the user doc already exists.
  // Only apply profile fields via `$set`. Defaults apply for new docs.
  const updatedAt = new Date();
  const user = await User.findOneAndUpdate(
    { clerkId: clerkUserId },
    {
      $set: { ...userData, updatedAt },
      $setOnInsert: {
        // Ensure sensible defaults for brand new users.
        lastLogin: updatedAt,
        problemsSolved: 0,
        submissions: [],
        stats: {
          topics: { easy: 0, medium: 0, hard: 0 },
          streaks: { current: 0, max: 0 },
          heatmapData: [],
        },
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return user;
}

async function main() {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("Missing CLERK_SECRET_KEY in environment.");
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment.");
  }

  clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  // Clerk getUserList supports offset-based pagination.
  const limit = Number(process.env.CLERK_SYNC_LIMIT || 100); // max supported by Clerk is 501
  const delayMs = Number(process.env.CLERK_SYNC_DELAY_MS || 0);

  await connectDB();
  console.log(`Mongo connected. Model collection="${User.collection.name}".`);

  let offset = 0;
  let totalCount = null;
  let processed = 0;
  let failed = 0;

  console.log(`Starting Clerk->Mongo sync (limit=${limit}, delayMs=${delayMs})...`);

  while (true) {
    const page = await clerkClient.users.getUserList({ limit, offset });
    const users = Array.isArray(page)
      ? page
      : (page?.data ?? page?.users ?? []);

    const pageTotal =
      page?.totalCount ??
      page?.pagination?.totalCount ??
      page?.total ??
      null;
    totalCount = pageTotal ?? totalCount ?? offset + users.length;
    if (!users.length) break;

    for (const clerkUser of users) {
      const clerkUserId = clerkUser?.id ?? clerkUser?.userId;
      try {
        if (!clerkUserId) {
          throw new Error("Missing clerk user id in Clerk response item.");
        }
        await upsertOne(clerkUserId);
        processed += 1;
        if (delayMs > 0) await delay(delayMs);
      } catch (err) {
        failed += 1;
        console.error(
          `Failed syncing clerkUserId="${clerkUserId ?? "unknown"}": ${err.message}`
        );
        if (delayMs > 0) await delay(delayMs);
      }
    }

    offset += users.length;
    console.log(`Progress: ${processed} synced, ${failed} failed (offset=${offset}/${totalCount}).`);

    if (offset >= totalCount) break;
  }

  console.log(`Sync complete. Synced=${processed}, Failed=${failed}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Fatal sync error:", err);
  process.exit(1);
});

