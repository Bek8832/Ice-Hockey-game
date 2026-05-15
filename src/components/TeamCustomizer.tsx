/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TeamData, PlayerStats } from '../types';
import { Language, translations } from '../translations';
import { Settings2, User, Palette, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface TeamCustomizerProps {
  team: TeamData;
  onUpdate: (updatedTeam: TeamData) => void;
  onBack: () => void;
  lang: Language;
}

const TeamCustomizer: React.FC<TeamCustomizerProps> = ({ team, onUpdate, onBack, lang }) => {
  const t = translations[lang];

  const updatePlayerStat = (playerId: string, stat: keyof PlayerStats, value: number) => {
    const updatedPlayers = team.players.map(p => {
      if (p.id === playerId) {
        return { ...p, stats: { ...p.stats, [stat]: Math.max(1, Math.min(10, value)) } };
      }
      return p;
    });
    onUpdate({ ...team, players: updatedPlayers });
  };

  const updatePlayerName = (playerId: string, name: string) => {
    const updatedPlayers = team.players.map(p => {
      if (p.id === playerId) return { ...p, name };
      return p;
    });
    onUpdate({ ...team, players: updatedPlayers });
  };

  const updateTeamInfo = (field: keyof TeamData, value: string) => {
    onUpdate({ ...team, [field]: value });
  };

  return (
    <div className="w-full max-w-5xl bg-slate-950/80 backdrop-blur-xl rounded-sm shadow-2xl overflow-hidden border border-slate-800 relative z-10">
      <div className="p-6 bg-slate-900/50 text-white flex justify-between items-center border-b border-slate-800 relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-red-600" />
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3 font-display">
            <Settings2 className="w-6 h-6 text-red-500" />
            {t.title} <span className="text-red-500">{t.rinkDesigner.toUpperCase()}</span>
          </h2>
          <p className="text-slate-500 text-[9px] mt-0.5 uppercase tracking-[0.3em] font-mono">FRANCHISE CONSOLE</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-white text-slate-950 px-8 py-4 rounded-sm font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all transform hover:skew-x-[-3deg]"
        >
          <Save className="w-4 h-4" />
          {t.commit}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 min-h-[600px]">
        {/* Left Sidebar: Team Identity */}
        <div className="p-8 border-r border-slate-800 bg-slate-900/30">
          <h3 className="text-[10px] font-black uppercase text-slate-500 mb-8 tracking-[0.3em] flex items-center gap-2">
            <Palette className="w-4 h-4 text-red-500" /> {t.branding}
          </h3>
          <div className="space-y-8">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-2 tracking-widest">{t.franchiseName}</label>
              <input 
                type="text" 
                value={team.name}
                onChange={(e) => updateTeamInfo('name', e.target.value)}
                className="w-full bg-slate-800 border-b-2 border-red-600 px-4 py-3 text-lg font-black italic uppercase italic text-white focus:outline-none focus:bg-slate-700 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-2 tracking-widest">{t.primaryColor}</label>
              <div className="flex gap-4">
                <input 
                  type="color" 
                  value={team.primaryColor}
                  onChange={(e) => updateTeamInfo('primaryColor', e.target.value)}
                  className="h-14 w-full rounded-sm cursor-pointer bg-slate-800 border border-slate-700 p-1"
                />
                <div className="w-14 h-14 rounded-sm border-2 border-white/10 shadow-lg" style={{ backgroundColor: team.primaryColor }} />
              </div>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-800">
             <div className="text-[40px] font-display text-slate-900 uppercase tracking-tighter leading-none opacity-50 rotate-90 origin-left mt-20 whitespace-nowrap">
                ICE HOCKEY CUSTOM v2
             </div>
          </div>
        </div>

        {/* Main Content: Roster */}
        <div className="lg:col-span-3 p-6 space-y-4 bg-slate-950/20">
          <h3 className="text-[9px] font-black uppercase text-slate-500 mb-4 tracking-[0.3em] flex items-center gap-2">
            <User className="w-4 h-4 text-red-500" /> {t.rooster.toUpperCase()}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {team.players.map((player) => (
              <motion.div 
                key={player.id}
                layout
                className="group bg-slate-900/50 p-6 rounded-sm border border-slate-800 hover:border-red-600/50 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-red-600 transition-all duration-300" />
                
                <div className="flex flex-col xl:flex-row xl:items-end gap-6">
                  <div className="flex-1">
                    <div className="text-[9px] text-red-500 font-bold uppercase tracking-[0.3em] mb-1">STARTER / {player.id}</div>
                    <input 
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayerName(player.id, e.target.value)}
                      className="text-2xl font-black italic uppercase italic text-white bg-transparent border-b-2 border-transparent hover:border-slate-800 focus:border-red-600 focus:bg-slate-800/50 px-2 py-1 outline-none w-full transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-[2]">
                    {(['speed', 'power', 'handling'] as const).map((stat) => (
                      <div key={stat} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{(t as any)[stat] || stat}</span>
                          <span className="text-lg font-display italic text-white leading-none">{player.stats[stat] * 10}</span>
                        </div>
                        <input 
                          type="range"
                          min="1"
                          max="10"
                          value={player.stats[stat]}
                          onChange={(e) => updatePlayerStat(player.id, stat, parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 appearance-none cursor-pointer accent-red-600"
                        />
                        <div className="flex justify-between gap-0.5">
                           {[...Array(10)].map((_, i) => (
                             <div 
                               key={i} 
                               className={`h-1 flex-1 ${i < player.stats[stat] ? 'bg-red-600' : 'bg-slate-800'}`} 
                             />
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCustomizer;
