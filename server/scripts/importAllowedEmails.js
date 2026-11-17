/**
 * Loads the university email list from a CSV into the database.
 *
 *   npm run import:emails                      -> reads server/data/allowed_emails.csv
 *   npm run import:emails -- other.csv         -> reads another file
 *   npm run import:emails -- --replace         -> also removes emails that are no longer in the file
 *
 * The CSV has two columns, email and role (student or counsellor). Save it from Excel as
 * "CSV UTF-8". Removing an email here only blocks new sign-ups; it never deletes an account.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const AllowedEmail = require('../models/AllowedEmail');
const { roleForEmail } = require('../utils/options');

const args = process.argv.slice(2);
const replace = args.includes('--replace');
const fileArg = args.find((a) => !a.startsWith('--'));
const file = path.resolve(fileArg || path.join(__dirname, '..', 'data', 'allowed_emails.csv'));

// Plain comma-separated values; handles a leading BOM, Windows line endings and "quoted" cells.
const readRows = (text) =>
  text
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));

const main = async () => {
  if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);

  let rows = readRows(fs.readFileSync(file, 'utf8'));
  // Skip the header row (any capitalisation) if there is one.
  if (rows.length && rows[0][0].toLowerCase() === 'email') rows = rows.slice(1);

  const valid = new Map(); // email -> role
  const problems = [];

  rows.forEach(([rawEmail = '', rawRole = ''], i) => {
    const line = i + 2; // +1 for the header, +1 because lines start at 1
    const email = rawEmail.toLowerCase();
    const role = rawRole.toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return problems.push(`line ${line}: "${rawEmail}" is not a valid email`);
    if (!['student', 'counsellor'].includes(role)) return problems.push(`line ${line}: role "${rawRole}" must be student or counsellor`);
    const byDomain = roleForEmail(email);
    if (byDomain !== role) {
      return problems.push(`line ${line}: ${email} is listed as ${role} but its domain is ${byDomain ? `a ${byDomain} one` : 'not a university one'}`);
    }
    if (valid.has(email) && valid.get(email) !== role) return problems.push(`line ${line}: ${email} appears with two different roles`);
    valid.set(email, role);
  });

  await mongoose.connect(process.env.MONGODB_URI);

  if (valid.size) {
    await AllowedEmail.bulkWrite(
      [...valid].map(([email, role]) => ({
        updateOne: { filter: { email }, update: { $set: { email, role } }, upsert: true },
      }))
    );
  }

  let removed = 0;
  if (replace) {
    const result = await AllowedEmail.deleteMany({ email: { $nin: [...valid.keys()] } });
    removed = result.deletedCount;
  }

  const total = await AllowedEmail.countDocuments();
  console.log(`Read ${rows.length} row(s) from ${file}`);
  console.log(`  imported or updated: ${valid.size}`);
  if (replace) console.log(`  removed (not in file): ${removed}`);
  console.log(`  skipped: ${problems.length}`);
  problems.forEach((p) => console.log(`    - ${p}`));
  console.log(`Emails in the database now: ${total}`);
};

main()
  .catch((e) => {
    console.error('Import failed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
