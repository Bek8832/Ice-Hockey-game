/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameState, TeamData } from './types';
import { Language, translations } from './translations';
import { DEFAULT_RED_TEAM, DEFAULT_BLUE_TEAM } from './constants';
import GameCanvas from './components/GameCanvas';
import TeamCustomizer from './components/TeamCustomizer';
import { Trophy, Play, Settings, Users, RotateCcw, Zap, ChevronRight, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [lang, setLang] = useState<Language>('en');
  const [team1, setTeam1] = useState<TeamData>(DEFAULT_RED_TEAM);
  const [team2, setTeam2] = useState<TeamData>(DEFAULT_BLUE_TEAM);
  const [winner, setWinner] = useState<string | null>(null);

  const t = translations[lang];

  const startGame = () => {
    setWinner(null);
    setGameState('PLAYING');
  };

  const onGameOver = (winnerName: string) => {
    setWinner(winnerName);
    setGameState('GAMEOVER');
  };

  const cycleLanguage = () => {
    const langs: Language[] = ['en', 'ru', 'ky'];
    const idx = langs.indexOf(lang);
    setLang(langs[(idx + 1) % langs.length]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white overflow-y-auto relative">
      {/* Background Blobs */}
      <div className="theme-gradient-bg">
        <div className="blob-blue" />
        <div className="blob-red" />
      </div>

      {/* Language Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <button 
          onClick={cycleLanguage}
          className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] hover:border-red-500 transition-all text-slate-400 hover:text-white"
        >
          <Languages className="w-4 h-4 text-red-500" />
          {lang}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'MENU' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col items-center justify-center min-h-screen py-12 px-8 z-10 relative"
          >
            <div className="flex flex-col items-center mb-12">
              <div className="w-16 h-16 bg-red-600 flex items-center justify-center rotate-3 skew-x-12 mb-6">
                <span className="font-black text-4xl -skew-x-12 -rotate-3 text-white">S</span>
              </div>
              <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none font-display">
                {t.title} <span className="text-red-500">ELITE</span>
              </h1>
              <div className="mt-4 flex items-center gap-3 w-full">
                <div className="h-[2px] flex-1 bg-slate-800" />
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-500">{t.subtitle}</span>
                <div className="h-[2px] flex-1 bg-slate-800" />
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button 
                onClick={startGame}
                className="group relative bg-red-600 text-white p-5 rounded-sm font-black text-xl flex items-center justify-between hover:bg-red-500 transition-all transform hover:skew-x-[-2deg] border-b-4 border-red-800"
              >
                <span className="flex items-center gap-3 uppercase italic tracking-tighter">
                  <Play className="fill-current w-5 h-5" /> {t.startMatch}
                </span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => setGameState('CUSTOMIZE')}
                className="bg-slate-900/80 border border-slate-800 p-5 rounded-sm font-bold flex items-center justify-between hover:border-slate-600 transition-all text-slate-300 hover:text-white backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 uppercase text-sm tracking-widest font-mono">
                  <Users className="w-5 h-5 text-red-500" /> {t.rinkDesigner}
                </div>
                <div className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{t.custom}</div>
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'CUSTOMIZE' && (
          <motion.div 
            key="customize"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-12 px-8 flex items-center justify-center min-h-screen z-10 relative"
          >
            <TeamCustomizer 
              team={team1} 
              onUpdate={setTeam1} 
              onBack={() => setGameState('MENU')} 
              lang={lang}
            />
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-start min-h-screen py-12 px-8 z-10 relative"
          >
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 relative">
              <GameCanvas 
                team1={team1}
                team2={team2}
                onGameOver={onGameOver}
                onGoal={(id) => console.log(`Goal for ${id}`)}
                lang={lang}
              />
              
              <div className="lg:sticky lg:top-24 flex flex-col gap-4">
                <button 
                  onClick={() => setGameState('MENU')}
                  className="group flex flex-col items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-sm hover:border-red-500 transition-all text-slate-500 hover:text-white"
                >
                  <RotateCcw className="w-5 h-5 text-red-500 group-hover:rotate-[-45deg] transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] vertical-text lg:writing-vertical-rl">
                    {t.backToMenu}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'GAMEOVER' && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-950 text-white z-20 relative"
          >
            <div className="absolute inset-0 theme-gradient-bg opacity-30">
               <div className="blob-red scale-150" />
            </div>

            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 flex items-center gap-4"
            >
              <div className="h-px w-20 bg-red-600" />
              <Trophy className="w-16 h-16 text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
              <div className="h-px w-20 bg-red-600" />
            </motion.div>
            
            <h2 className="text-[10px] uppercase font-mono tracking-[0.8em] text-slate-500 mb-4 px-4 py-1 border border-slate-800 bg-slate-900/50">{t.matchCleared}</h2>
            <h1 className="text-9xl font-black italic uppercase tracking-tighter mb-8 text-center leading-none font-display text-white">
              {winner}<br />
              <span className="text-4xl text-red-500 not-italic block mt-2 tracking-widest">{t.supremacy}</span>
            </h1>

            <div className="flex gap-4">
              <button 
                onClick={startGame}
                className="bg-red-600 text-white px-12 py-6 rounded-sm font-black text-xl flex items-center gap-3 hover:bg-red-500 transition-all transform hover:skew-x-[-3deg] shadow-2xl border-b-4 border-red-800"
              >
                <RotateCcw className="w-6 h-6" /> {t.playAgain}
              </button>
              <button 
                onClick={() => setGameState('MENU')}
                className="bg-slate-900 border border-slate-800 text-white px-12 py-6 rounded-sm font-black text-xl hover:bg-slate-800 transition-all uppercase tracking-widest"
              >
                {t.quit}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
