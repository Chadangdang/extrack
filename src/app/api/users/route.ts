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

    // Check if username already exists (case-insensitive)
    const existingUsers = await dynamoDb.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression:
          "#username = :username OR (#usernameLower = :usernameLower)",
        ExpressionAttributeNames: {
          "#username": "username",
          "#usernameLower": "usernameLower",
        },
        ExpressionAttributeValues: {
          ":username": sanitizedUsername,
          ":usernameLower": normalizedUsername,
        },
        ProjectionExpression: "userId",
      })
    );

    if ((existingUsers.Count ?? 0) > 0) {
      return NextResponse.json(
        { message: "Username is already taken." },
        { status: 409 }
      );
    }

    // Generate userId in format "user1", "user2", ...
    const scanAll = await dynamoDb.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        ProjectionExpression: "userId",
      })
    );

    let maxNumber = 0;
    for (const item of scanAll.Items ?? []) {
      const id = typeof item.userId === "string" ? item.userId : "";
      const num = extractUserNumber(id);
      if (num > maxNumber) {
        maxNumber = num;
      }
    }

    const nextNumber = maxNumber + 1;
    const newUserId = `user${nextNumber}`;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      userId: newUserId,
      createdAt: new Date().toISOString(), // e.g., 2025-11-17T00:00:00.000Z
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      dob,
      username: sanitizedUsername,
      usernameLower: normalizedUsername,
      passwordHash,
      status: "active", // match your existing data
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
  } catch (error: any) {
    console.error("Failed to create user", error);

    // TEMP: send back error.message for debugging (remove in production)
    return NextResponse.json(
      {
        message: "Failed to create user.",
        error: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}