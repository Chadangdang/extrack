import { NextResponse } from "next/server";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

import dynamoDb from "@/lib/dynamodb";

const USERS_TABLE = process.env.USERS_TABLE_NAME || "Users";

function isFutureDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return true;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

/**
 * Helper to extract the numeric part from userId ("user1" -> 1).
 * If it can't parse, returns 0.
 */
function extractUserNumber(userId: string): number {
  const match = userId.match(/^user(\d+)$/i);
  if (!match) return 0;
  return parseInt(match[1], 10) || 0;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      dob,
      username,
      password,
      confirmPassword,
    } = body ?? {};

    // Basic validation
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !dob ||
      !username?.trim() ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match." },
        { status: 400 }
      );
    }

    if (isFutureDate(dob)) {
      return NextResponse.json(
        { message: "DOB must be today or earlier." },
        { status: 400 }
      );
    }

    const sanitizedUsername = username.trim();
    const normalizedUsername = sanitizedUsername.toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Scan existing users once to determine duplicates and next userId
    const scanAll = await dynamoDb.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        ProjectionExpression: "userId, username, email",
      })
    );

    let maxNumber = 0;
    let usernameTaken = false;
    let emailTaken = false;

    for (const item of scanAll.Items ?? []) {
      const id = typeof item.userId === "string" ? item.userId : "";
      const num = extractUserNumber(id);
      if (num > maxNumber) {
        maxNumber = num;
      }

      const existingUsername =
        typeof item.username === "string" ? item.username.toLowerCase() : "";
      const existingEmail =
        typeof item.email === "string" ? item.email.toLowerCase() : "";

      if (existingUsername === normalizedUsername) {
        usernameTaken = true;
      }

      if (existingEmail === normalizedEmail) {
        emailTaken = true;
      }
    }

    if (usernameTaken || emailTaken) {
      let message = "";
      if (usernameTaken && emailTaken) {
        message = "This username and email are already in use.";
      } else if (usernameTaken) {
        message = "This username is already in use.";
      } else {
        message = "This email is already in use.";
      }

      return NextResponse.json({ message }, { status: 409 });
    }

    const nextNumber = maxNumber + 1;
    const newUserId = `user${nextNumber}`;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      userId: newUserId,
      createdAt: new Date().toISOString(), // e.g., 2025-11-17T00:00:00.000Z
      dob,
      email: normalizedEmail,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      passwordHash,
      status: "active", // match your existing data
      username: sanitizedUsername,
    };

    // Insert into DynamoDB
    await dynamoDb.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: newUser,
        ConditionExpression: "attribute_not_exists(userId)", // avoid overwriting
      })
    );

    return NextResponse.json(
      { message: "User created successfully.", userId: newUser.userId },
      { status: 201 }
    );
    } catch (error: unknown) {
    console.error("Failed to create user", error);

    const message =
      error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        message: "Failed to create user.",
        error: message,
      },
      { status: 500 }
    );
  }
}