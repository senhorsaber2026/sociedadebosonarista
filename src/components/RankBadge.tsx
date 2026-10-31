import React from 'react';
import { UserRank } from '../types';
import { RANK_DEFINITIONS } from '../services/rankService';
import { Shield, Award, Star } from 'lucide-react';

interface RankBadgeProps {
  rank?: UserRank;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  onClick?: () => void;
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank = 'soldado',
  size = 'sm',
  showTitle = true,
  onClick,
  className = ''
}) => {
  const def = RANK_DEFINITIONS[rank] || RANK_DEFINITIONS.soldado;

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.2 gap-1 rounded',
    sm: 'text-[10px] px-2 py-0.5 gap-1 rounded-md',
    md: 'text-xs px-2.5 py-1 gap-1.5 rounded-lg',
    lg: 'text-sm px-3.5 py-1.5 gap-2 rounded-xl font-bold'
  };

  const starCount = def.stars;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center font-bold uppercase tracking-wider select-none border transition-all ${
        def.badgeBg
      } ${def.textColor} ${def.borderColor} ${sizeClasses[size]} ${
        onClick ? 'cursor-pointer hover:brightness-110 active:scale-95 shadow-sm' : ''
      } ${className}`}
      title={`${def.title} (Nível ${def.level}) - Clique para ver o Plano de Patentes`}
    >
      {/* Insignia symbol or stars */}
      <span className="flex items-center gap-0.5 text-[#D4AF37]">
        {rank === 'general' ? (
          <span className="flex items-center tracking-tighter text-[#E8CC76]">★★★★</span>
        ) : rank === 'coronel' ? (
          <span className="flex items-center tracking-tighter text-[#D4AF37]">✦★★★✦</span>
        ) : rank === 'capitao' ? (
          <span className="flex items-center tracking-tighter text-[#D4AF37]">★★★</span>
        ) : rank === 'major' ? (
          <span className="flex items-center tracking-tighter text-[#E8CC76]">★♦★</span>
        ) : rank === 'tenente' ? (
          <span className="text-[#F5F5F0]">★</span>
        ) : rank === 'sargento' ? (
          <span className="font-mono text-[9px] font-black">▲▲▲</span>
        ) : rank === 'cabo' ? (
          <span className="font-mono text-[9px] font-black">▲▲</span>
        ) : (
          <span className="font-mono text-[9px] font-black">▲</span>
        )}
      </span>

      {showTitle && <span>{def.name}</span>}
    </div>
  );
};
