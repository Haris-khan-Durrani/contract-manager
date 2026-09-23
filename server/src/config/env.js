/**
 * env.js — Centralized environment loader
 * Always loads the single root .env file at the repository root.
 */
const path = require('path');
const dotenv = require('dotenv');

// Load root .env (c:\...\contractmanager\.env)
const rootEnvPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: rootEnvPath });

// Secondary fallback in case process was started elsewhere
dotenv.config();

module.exports = process.env;
