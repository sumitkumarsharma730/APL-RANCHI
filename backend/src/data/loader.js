/**
 * DATA LOADER
 *
 * Loads player and question data from JSON files.
 * Provides caching for performance.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory - loader.js is in src/data, so data is in same directory
const DATA_DIR = __dirname;

/**
 * Load players from JSON file
 *
 * @returns {Array} - Array of player objects
 */
export function loadPlayers() {
  const filePath = path.join(DATA_DIR, 'players.json');

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);

    console.log(`Loaded ${json.players.length} players from database`);

    return json.players;

  } catch (error) {
    console.error('Error loading players:', error.message);
    return [];
  }
}

/**
 * Load questions from JSON file
 *
 * @returns {Array} - Array of question objects
 */
export function loadQuestions() {
  const filePath = path.join(DATA_DIR, 'questions.json');

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);

    console.log(`Loaded ${json.questions.length} questions`);

    return json.questions;

  } catch (error) {
    console.error('Error loading questions:', error.message);
    return [];
  }
}

/**
 * Get all unique attributes from player data
 *
 * @param {Array} players - Array of player objects
 * @returns {Array} - Array of attribute names
 */
export function getAllAttributes(players) {
  const attributes = new Set();

  players.forEach(player => {
    if (player.attributes) {
      Object.keys(player.attributes).forEach(attr => {
        attributes.add(attr);
      });
    }
  });

  return Array.from(attributes).sort();
}

/**
 * Get attribute distribution across players
 *
 * @param {Array} players - Array of player objects
 * @returns {object} - { attribute: { true: count, false: count } }
 */
export function getAttributeDistribution(players) {
  const distribution = {};

  players.forEach(player => {
    if (player.attributes) {
      Object.entries(player.attributes).forEach(([attr, value]) => {
        if (!distribution[attr]) {
          distribution[attr] = { true: 0, false: 0 };
        }
        distribution[attr][value ? 'true' : 'false']++;
      });
    }
  });

  return distribution;
}

/**
 * Get all unique roles
 *
 * @param {Array} players - Array of player objects
 * @returns {Array}
 */
export function getUniqueRoles(players) {
  const roles = new Set();

  players.forEach(player => {
    if (player.role) {
      roles.add(player.role);
    }
  });

  return Array.from(roles);
}

/**
 * Get all unique teams
 *
 * @param {Array} players - Array of player objects
 * @returns {Array}
 */
export function getUniqueTeams(players) {
  const teams = new Set();

  players.forEach(player => {
    if (player.teams) {
      player.teams.forEach(team => teams.add(team));
    }
  });

  return Array.from(teams).sort();
}

/**
 * Get player statistics summary
 *
 * @param {Array} players - Array of player objects
 * @returns {object}
 */
export function getPlayerStats(players) {
  return {
    total: players.length,
    active: players.filter(p => p.active).length,
    retired: players.filter(p => !p.active || p.attributes?.retired).length,
    indians: players.filter(p => p.attributes?.indian).length,
    overseas: players.filter(p => p.attributes?.overseas).length,
    roles: getUniqueRoles(players),
    teams: getUniqueTeams(players),
    attributes: getAllAttributes(players).length
  };
}

/**
 * Find player by ID
 *
 * @param {string} id - Player ID
 * @param {Array} players - Array of player objects
 * @returns {object|null}
 */
export function findPlayerById(id, players) {
  return players.find(p => p.id === id) || null;
}

/**
 * Find player by name (case insensitive)
 *
 * @param {string} name - Player name
 * @param {Array} players - Array of player objects
 * @returns {object|null}
 */
export function findPlayerByName(name, players) {
  const searchName = name.toLowerCase().trim();

  return players.find(p =>
    p.name.toLowerCase() === searchName ||
    p.known_names?.some(n => n.toLowerCase() === searchName)
  ) || null;
}

/**
 * Search players by name
 *
 * @param {string} query - Search query
 * @param {Array} players - Array of player objects
 * @returns {Array}
 */
export function searchPlayers(query, players) {
  const searchQuery = query.toLowerCase().trim();

  if (!searchQuery) {
    return [];
  }

  return players.filter(p =>
    p.name.toLowerCase().includes(searchQuery) ||
    p.known_names?.some(n => n.toLowerCase().includes(searchQuery))
  );
}

/**
 * Validate player data structure
 *
 * @param {object} player - Player object
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validatePlayer(player) {
  const errors = [];

  if (!player.id) errors.push('Missing ID');
  if (!player.name) errors.push('Missing name');
  if (!player.role) errors.push('Missing role');
  if (!player.attributes) errors.push('Missing attributes');

  // Check for minimum required attributes
  const requiredAttrs = ['indian', 'overseas', 'wicketkeeper', 'batsman', 'bowler', 'allrounder'];
  if (player.attributes) {
    requiredAttrs.forEach(attr => {
      if (player.attributes[attr] === undefined) {
        errors.push(`Missing attribute: ${attr}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get dataset validation report
 *
 * @param {Array} players - Array of player objects
 * @returns {object}
 */
export function validateDataset(players) {
  const report = {
    total: players.length,
    valid: 0,
    invalid: 0,
    errors: {}
  };

  players.forEach(player => {
    const validation = validatePlayer(player);
    if (validation.valid) {
      report.valid++;
    } else {
      report.invalid++;
      const playerId = player.id || 'unknown';
      report.errors[playerId] = validation.errors;
    }
  });

  return report;
}