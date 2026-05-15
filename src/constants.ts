/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TeamData } from './types';

export const DEFAULT_RED_TEAM: TeamData = {
  id: 'team_red',
  name: 'Red Rockets',
  primaryColor: '#ef4444',
  secondaryColor: '#f87171',
  players: [
    {
      id: 'p1',
      name: 'Ace',
      stats: { speed: 8, power: 7, handling: 9 }
    },
    {
      id: 'p2',
      name: 'Tank',
      stats: { speed: 4, power: 10, handling: 5 }
    },
    {
      id: 'p3',
      name: 'Flash',
      stats: { speed: 10, power: 5, handling: 7 }
    }
  ]
};

export const DEFAULT_BLUE_TEAM: TeamData = {
  id: 'team_blue',
  name: 'Blue Blizzards',
  primaryColor: '#3b82f6',
  secondaryColor: '#60a5fa',
  players: [
    {
      id: 'p4',
      name: 'Iceman',
      stats: { speed: 7, power: 8, handling: 8 }
    },
    {
      id: 'p5',
      name: 'Bruiser',
      stats: { speed: 5, power: 9, handling: 6 }
    },
    {
      id: 'p6',
      name: 'Ghost',
      stats: { speed: 9, power: 6, handling: 10 }
    }
  ]
};

export const RINK_WIDTH = 800;
export const RINK_HEIGHT = 500;
export const PADDLE_RADIUS = 25;
export const PUCK_RADIUS = 15;
export const FRICTION = 0.985;
export const BOUNDARY_BOUNCE = 0.8;
export const GOAL_SIZE = 120;
