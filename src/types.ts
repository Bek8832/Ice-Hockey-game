/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlayerStats {
  speed: number;    // 1-10, multiplier for move speed
  power: number;    // 1-10, multiplier for shot velocity/collision impact
  handling: number; // 1-10, control responsiveness
}

export interface PlayerData {
  id: string;
  name: string;
  stats: PlayerStats;
}

export interface TeamData {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  players: PlayerData[];
}

export type GameState = 'MENU' | 'CUSTOMIZE' | 'PLAYING' | 'GAMEOVER';

export interface Pos {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}
