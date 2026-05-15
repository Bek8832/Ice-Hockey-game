/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TeamData, GameState } from '../types';
import { Language, translations } from '../translations';
import { 
  RINK_WIDTH, RINK_HEIGHT, PADDLE_RADIUS, PUCK_RADIUS, 
  FRICTION, BOUNDARY_BOUNCE, GOAL_SIZE 
} from '../constants';
import { handleCircleCollision, distance, clamp } from '../engine/physics';

interface GameCanvasProps {
  team1: TeamData;
  team2: TeamData;
  onGameOver: (winner: string) => void;
  onGoal: (teamId: string) => void;
  lang: Language;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ team1, team2, onGameOver, onGoal, lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scores, setScores] = useState({ t1: 0, t2: 0 });
  
  const t = translations[lang];

  // Game state refs (to avoid stale closures in loop)
  const puck = useRef({ x: RINK_WIDTH / 2, y: RINK_HEIGHT / 2, vx: 0, vy: 0 });
  const p1 = useRef({ x: 100, y: RINK_HEIGHT / 2, vx: 0, vy: 0, activeIndex: 0 });
  const p2 = useRef({ x: RINK_WIDTH - 100, y: RINK_HEIGHT / 2, vx: 0, vy: 0, activeIndex: 0 });
  
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const update = () => {
      // 1. Move P1 (Mouse follow)
      const targetX = clamp(mousePos.current.x, PADDLE_RADIUS, RINK_WIDTH / 2 - PADDLE_RADIUS);
      const targetY = clamp(mousePos.current.y, PADDLE_RADIUS, RINK_HEIGHT - PADDLE_RADIUS);
      
      const p1Stats = team1.players[p1.current.activeIndex].stats;
      const responsiveness = 0.1 * (p1Stats.handling / 10);
      
      p1.current.vx = (targetX - p1.current.x) * responsiveness;
      p1.current.vy = (targetY - p1.current.y) * responsiveness;
      p1.current.x += p1.current.vx;
      p1.current.y += p1.current.vy;

      // 2. Move P2 (AI)
      const p2Stats = team2.players[p2.current.activeIndex].stats;
      const aiSpeed = 3 + (p2Stats.speed / 2);
      const aiHandling = 0.05 + (p2Stats.handling / 100);

      let aiTargetX, aiTargetY;
      const isPuckOnAISide = puck.current.x > RINK_WIDTH / 2;

      if (!isPuckOnAISide) {
        // Defensive Mode: Stay centered and follow puck Y loosely
        aiTargetX = RINK_WIDTH - 80;
        aiTargetY = puck.current.y;
      } else {
        // Offensive Mode: Target the puck
        if (p2.current.x > puck.current.x + 10) {
          // AI is behind the puck relative to player goal, so ATTACK
          aiTargetX = puck.current.x;
          aiTargetY = puck.current.y;
        } else {
          // AI is between the puck and its own goal, must loop around to avoid self-goal
          aiTargetX = puck.current.x + 60;
          aiTargetY = puck.current.y > RINK_HEIGHT / 2 ? puck.current.y - 60 : puck.current.y + 60;
        }
      }

      // Keep AI within its bounds
      aiTargetX = clamp(aiTargetX, RINK_WIDTH / 2 + PADDLE_RADIUS, RINK_WIDTH - PADDLE_RADIUS);
      aiTargetY = clamp(aiTargetY, PADDLE_RADIUS, RINK_HEIGHT - PADDLE_RADIUS);

      p2.current.vx = (aiTargetX - p2.current.x) * aiHandling;
      p2.current.vy = (aiTargetY - p2.current.y) * aiHandling;
      
      // Limit speed
      const mag = Math.sqrt(p2.current.vx**2 + p2.current.vy**2);
      if (mag > aiSpeed) {
        p2.current.vx = (p2.current.vx / mag) * aiSpeed;
        p2.current.vy = (p2.current.vy / mag) * aiSpeed;
      }
      
      p2.current.x += p2.current.vx;
      p2.current.y += p2.current.vy;

      // 3. Puck Physics
      puck.current.vx *= FRICTION;
      puck.current.vy *= FRICTION;
      puck.current.x += puck.current.vx;
      puck.current.y += puck.current.vy;

      // Walls
      if (puck.current.x < PUCK_RADIUS || puck.current.x > RINK_WIDTH - PUCK_RADIUS) {
        // Check for Goal
        const inGoalRange = puck.current.y > (RINK_HEIGHT - GOAL_SIZE) / 2 && puck.current.y < (RINK_HEIGHT + GOAL_SIZE) / 2;
        if (inGoalRange) {
          if (puck.current.x < PUCK_RADIUS) handleGoal('t2');
          else handleGoal('t1');
        } else {
          puck.current.vx *= -BOUNDARY_BOUNCE;
          puck.current.x = puck.current.x < PUCK_RADIUS ? PUCK_RADIUS : RINK_WIDTH - PUCK_RADIUS;
        }
      }
      if (puck.current.y < PUCK_RADIUS || puck.current.y > RINK_HEIGHT - PUCK_RADIUS) {
        puck.current.vy *= -BOUNDARY_BOUNCE;
        puck.current.y = puck.current.y < PUCK_RADIUS ? PUCK_RADIUS : RINK_HEIGHT - PUCK_RADIUS;
      }

      // 4. Collisions
      handleCircleCollision(
        { pos: p1.current, vel: p1.current, radius: PADDLE_RADIUS, mass: 2 },
        { pos: puck.current, vel: puck.current, radius: PUCK_RADIUS, mass: 1 }
      );
      handleCircleCollision(
        { pos: p2.current, vel: p2.current, radius: PADDLE_RADIUS, mass: 2 },
        { pos: puck.current, vel: puck.current, radius: PUCK_RADIUS, mass: 1 }
      );
    };

    const handleGoal = (scorer: 't1' | 't2') => {
      setScores(prev => {
        const next = { ...prev, [scorer]: prev[scorer] + 1 };
        if (next[scorer] >= 5) {
          onGameOver(scorer === 't1' ? team1.name : team2.name);
        }
        return next;
      });
      onGoal(scorer === 't1' ? team1.id : team2.id);
      resetPuck();
    };

    const resetPuck = () => {
      puck.current = { x: RINK_WIDTH / 2, y: RINK_HEIGHT / 2, vx: 0, vy: 0 };
    };

    const draw = () => {
      ctx.clearRect(0, 0, RINK_WIDTH, RINK_HEIGHT);

      // Ice Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, RINK_WIDTH, RINK_HEIGHT);

      // Markings
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      
      // Center Line
      ctx.beginPath();
      ctx.moveTo(RINK_WIDTH / 2, 0);
      ctx.lineTo(RINK_WIDTH / 2, RINK_HEIGHT);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(RINK_WIDTH / 2, RINK_HEIGHT / 2, 70, 0, Math.PI * 2);
      ctx.stroke();

      // Goals
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, (RINK_HEIGHT - GOAL_SIZE) / 2, 10, GOAL_SIZE);
      ctx.fillRect(RINK_WIDTH - 10, (RINK_HEIGHT - GOAL_SIZE) / 2, 10, GOAL_SIZE);

      // P1
      ctx.shadowBlur = 15;
      ctx.shadowColor = team1.primaryColor;
      ctx.fillStyle = team1.primaryColor;
      ctx.beginPath();
      ctx.arc(p1.current.x, p1.current.y, PADDLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();

      // P2
      ctx.shadowColor = team2.primaryColor;
      ctx.fillStyle = team2.primaryColor;
      ctx.beginPath();
      ctx.arc(p2.current.x, p2.current.y, PADDLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Puck
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(puck.current.x, puck.current.y, PUCK_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [team1, team2]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = RINK_WIDTH / rect.width;
    const scaleY = RINK_HEIGHT / rect.height;
    mousePos.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl relative z-10 px-4">
      <div className="flex justify-between items-center w-full px-6 py-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-sm shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
        
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 bg-slate-900 border border-slate-700 flex items-center justify-center font-display text-xl italic rotate-3">
             {scores.t1}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">{team1.name}</span>
            <span className="text-sm font-black italic uppercase tracking-tighter text-white leading-none">{t.home}</span>
          </div>
        </div>

        <div className="flex flex-col items-center px-6 border-x border-slate-800">
           <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em] mb-0.5">{t.live}</span>
           <div className="text-3xl font-display italic text-white tracking-tighter">
             {scores.t1}<span className="text-slate-700 mx-1">:</span>{scores.t2}
           </div>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end text-right">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-1">{team2.name}</span>
            <span className="text-sm font-black italic uppercase tracking-tighter text-white leading-none">{t.visitor}</span>
          </div>
          <div className="w-10 h-10 bg-slate-900 border border-slate-700 flex items-center justify-center font-display text-xl italic -rotate-3">
             {scores.t2}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-1 h-full bg-blue-600" />
      </div>

      <div 
        ref={containerRef}
        className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden cursor-none border-4 border-slate-800 ring-1 ring-white/10"
        onMouseMove={handleMouseMove}
      >
        <canvas 
          ref={canvasRef} 
          width={RINK_WIDTH} 
          height={RINK_HEIGHT}
          className="w-full h-auto"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mt-2">
        <div className="bg-slate-900/40 backdrop-blur-sm p-4 rounded-sm border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-10 h-0.5 bg-red-600" />
          <h3 className="text-[9px] uppercase font-black text-slate-500 mb-3 tracking-[0.1em] flex justify-between">
            <span>{t.performanceLog.toUpperCase()} / {team1.players[p1.current.activeIndex].name}</span>
            <span className="text-red-500">{t.active.toUpperCase()}</span>
          </h3>
          <div className="space-y-2">
            {Object.entries(team1.players[p1.current.activeIndex].stats).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span className="uppercase">{(t as any)[key] || key}</span>
                  <span className="font-mono">{val * 10}%</span>
                </div>
                <div className="h-1 bg-slate-800 w-full overflow-hidden rounded-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${val * 10}%` }}
                    className="h-full bg-red-500" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-sm p-4 rounded-sm border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-10 h-0.5 bg-blue-600" />
          <h3 className="text-[9px] uppercase font-black text-slate-500 mb-3 tracking-[0.1em] flex justify-between">
            <span>{t.aiAnalysis.toUpperCase()} / {team2.players[p2.current.activeIndex].name}</span>
            <span className="text-blue-500">{t.opponent.toUpperCase()}</span>
          </h3>
          <div className="space-y-2">
            {Object.entries(team2.players[p2.current.activeIndex].stats).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span className="uppercase">{(t as any)[key] || key}</span>
                  <span className="font-mono">{val * 10}%</span>
                </div>
                <div className="h-1 bg-slate-800 w-full overflow-hidden rounded-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${val * 10}%` }}
                    className="h-full bg-blue-500" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
