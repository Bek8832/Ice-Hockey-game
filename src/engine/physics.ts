/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pos, Velocity } from '../types';

export function distance(p1: Pos, p2: Pos): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function handleCircleCollision(
  obj1: { pos: Pos; vel: Velocity; radius: number; mass: number },
  obj2: { pos: Pos; vel: Velocity; radius: number; mass: number }
) {
  const dist = distance(obj1.pos, obj2.pos);
  if (dist < obj1.radius + obj2.radius) {
    // Collision detected
    const nx = (obj2.pos.x - obj1.pos.x) / dist;
    const ny = (obj2.pos.y - obj1.pos.y) / dist;

    const relVelX = obj1.vel.vx - obj2.vel.vx;
    const relVelY = obj1.vel.vy - obj2.vel.vy;

    const dot = relVelX * nx + relVelY * ny;

    if (dot > 0) {
      const impulse = (2 * dot) / (obj1.mass + obj2.mass);
      
      obj1.vel.vx -= impulse * obj2.mass * nx;
      obj1.vel.vy -= impulse * obj2.mass * ny;
      obj2.vel.vx += impulse * obj1.mass * nx;
      obj2.vel.vy += impulse * obj1.mass * ny;
    }

    // Separate overlapping circles
    const overlap = obj1.radius + obj2.radius - dist;
    obj1.pos.x -= (overlap / 2) * nx;
    obj1.pos.y -= (overlap / 2) * ny;
    obj2.pos.x += (overlap / 2) * nx;
    obj2.pos.y += (overlap / 2) * ny;
  }
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
