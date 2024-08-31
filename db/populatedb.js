#! /usr/bin/env node

require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    password_hash TEXT,
    is_Member BOOLEAN,
    is_Admin BOOLEAN
  );
`;

const createMessagesTable = `
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER,
    title TEXT,
    timestamp TIMESTAMPTZ,
    text TEXT
  );
`;

const fillUsers = `
  INSERT INTO users (
      first_name,
      last_name,
      username,
      password_hash,
      is_Member,
      is_Admin
    )
  VALUES (
      'John',
      'Doe',
      '1',
      $2a$10$TRqezF4Iw7NROR6ajlX5lOrIejFdoq0KYWbsbi77KVKLF9JhzLGVO,
      'true',
      'true'
    ),
    (
      'Joe',
      'Schmo',
      '2',
      $2a$10$TRqezF4Iw7NROR6ajlX5lOrIejFdoq0KYWbsbi77KVKLF9JhzLGVO,
      'false',
      'false'
    );
`;

const fillMessages = `
  INSERT INTO messages (user_id, title, timestamp, text)
  VALUES (
      1,
      'Hello',
      '2024-08-31 11:29:37.371-04',
      'world'
    ),
    (
      2,
      'Goodbye',
      '2024-08-31 11:29:37.371-04',
      'everyone'
    );
`;

async function main() {
  try {
    console.log('connecting...');

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();
    console.log('creating tables...');

    await Promise.all([
      client.query(createUsersTable),
      client.query(createMessagesTable),
    ]);

    console.log('seeding...');

    const bcryptHash = await new Promise((resolve, reject) => {
      bcrypt.hash('1', 10, async (err, hashedPassword) => {
        if (err) {
          reject(err);
        }

        resolve(hashedPassword);
      });
    });

    await Promise.all([
      client.query(fillUsers, [bcryptHash]),
      client.query(fillMessages, [new Date()]),
    ]);

    await client.end();
    console.log('done');
  } catch (err) {
    console.error(err);
  }
}

main();
