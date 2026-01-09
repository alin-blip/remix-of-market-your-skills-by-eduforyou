import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, Globe, Coins } from 'lucide-react';

interface IkigaiCirclesProps {
  whatYouLove: string[];
  whatYoureGoodAt: string[];
  whatWorldNeeds: string[];
  whatYouCanBePaidFor: string[];
  onQuadrantClick?: (quadrant: string) => void;
}

const quadrants = [
  { 
    key: 'love', 
    label: 'Ce Iubești', 
    icon: Heart,
    color: 'rgba(244, 63, 94, 0.6)',
    hoverColor: 'rgba(244, 63, 94, 0.8)',
  },
  { 
    key: 'good', 
    label: 'La Ce Ești Bun', 
    icon: Zap,
    color: 'rgba(59, 130, 246, 0.6)',
    hoverColor: 'rgba(59, 130, 246, 0.8)',
  },
  { 
    key: 'needs', 
    label: 'Ce Are Nevoie Lumea', 
    icon: Globe,
    color: 'rgba(16, 185, 129, 0.6)',
    hoverColor: 'rgba(16, 185, 129, 0.8)',
  },
  { 
    key: 'paid', 
    label: 'Pentru Ce Poți Fi Plătit', 
    icon: Coins,
    color: 'rgba(245, 158, 11, 0.6)',
    hoverColor: 'rgba(245, 158, 11, 0.8)',
  },
];

export function IkigaiCircles({
  whatYouLove,
  whatYoureGoodAt,
  whatWorldNeeds,
  whatYouCanBePaidFor,
  onQuadrantClick,
}: IkigaiCirclesProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const getQuadrantData = (key: string) => {
    switch (key) {
      case 'love': return whatYouLove;
      case 'good': return whatYoureGoodAt;
      case 'needs': return whatWorldNeeds;
      case 'paid': return whatYouCanBePaidFor;
      default: return [];
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-full blur-3xl" />
      
      {/* SVG Container for circles */}
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          {/* Gradient definitions */}
          <radialGradient id="loveGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(244, 63, 94, 0.3)" />
            <stop offset="100%" stopColor="rgba(244, 63, 94, 0.1)" />
          </radialGradient>
          <radialGradient id="goodGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
          </radialGradient>
          <radialGradient id="needsGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
          </radialGradient>
          <radialGradient id="paidGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.3)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0.1)" />
          </radialGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top Left - What you love (Rose) */}
        <motion.circle
          cx="160"
          cy="160"
          r="100"
          fill="url(#loveGradient)"
          stroke="rgba(244, 63, 94, 0.5)"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0, duration: 0.6, ease: 'easeOut' }}
          whileHover={{ scale: 1.05 }}
          style={{ cursor: 'pointer', mixBlendMode: 'screen', transformOrigin: '160px 160px' }}
          onClick={() => onQuadrantClick?.('love')}
          onMouseEnter={() => setShowTooltip('love')}
          onMouseLeave={() => setShowTooltip(null)}
          filter={showTooltip === 'love' ? 'url(#glow)' : undefined}
        />
        
        {/* Top Right - What you're good at (Blue) */}
        <motion.circle
          cx="240"
          cy="160"
          r="100"
          fill="url(#goodGradient)"
          stroke="rgba(59, 130, 246, 0.5)"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
          whileHover={{ scale: 1.05 }}
          style={{ cursor: 'pointer', mixBlendMode: 'screen', transformOrigin: '240px 160px' }}
          onClick={() => onQuadrantClick?.('good')}
          onMouseEnter={() => setShowTooltip('good')}
          onMouseLeave={() => setShowTooltip(null)}
          filter={showTooltip === 'good' ? 'url(#glow)' : undefined}
        />
        
        {/* Bottom Right - What world needs (Emerald) */}
        <motion.circle
          cx="240"
          cy="240"
          r="100"
          fill="url(#needsGradient)"
          stroke="rgba(16, 185, 129, 0.5)"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          whileHover={{ scale: 1.05 }}
          style={{ cursor: 'pointer', mixBlendMode: 'screen', transformOrigin: '240px 240px' }}
          onClick={() => onQuadrantClick?.('needs')}
          onMouseEnter={() => setShowTooltip('needs')}
          onMouseLeave={() => setShowTooltip(null)}
          filter={showTooltip === 'needs' ? 'url(#glow)' : undefined}
        />
        
        {/* Bottom Left - What you can be paid for (Amber) */}
        <motion.circle
          cx="160"
          cy="240"
          r="100"
          fill="url(#paidGradient)"
          stroke="rgba(245, 158, 11, 0.5)"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6, ease: 'easeOut' }}
          whileHover={{ scale: 1.05 }}
          style={{ cursor: 'pointer', mixBlendMode: 'screen', transformOrigin: '160px 240px' }}
          onClick={() => onQuadrantClick?.('paid')}
          onMouseEnter={() => setShowTooltip('paid')}
          onMouseLeave={() => setShowTooltip(null)}
          filter={showTooltip === 'paid' ? 'url(#glow)' : undefined}
        />

        {/* Center IKIGAI */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
        >
          <circle
            cx="200"
            cy="200"
            r="35"
            fill="rgba(139, 92, 246, 0.3)"
            stroke="rgba(139, 92, 246, 0.6)"
            strokeWidth="2"
          />
          <motion.circle
            cx="200"
            cy="200"
            r="35"
            fill="transparent"
            stroke="rgba(139, 92, 246, 0.4)"
            strokeWidth="1"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{ transformOrigin: '200px 200px' }}
          />
          <text
            x="200"
            y="205"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            fontFamily="Outfit, sans-serif"
          >
            IKIGAI
          </text>
        </motion.g>
      </svg>

      {/* Labels positioned around the circles */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2 text-rose-400"
      >
        <Heart className="w-4 h-4" />
        <span className="text-sm font-medium">Ce Iubești</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.45 }}
        className="absolute top-1/2 right-0 -translate-y-1/2 flex items-center gap-2 text-blue-400"
      >
        <span className="text-sm font-medium">Ești Bun</span>
        <Zap className="w-4 h-4" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 text-emerald-400"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">Lumea Are Nevoie</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.75 }}
        className="absolute top-1/2 left-0 -translate-y-1/2 flex items-center gap-2 text-amber-400"
      >
        <Coins className="w-4 h-4" />
        <span className="text-sm font-medium">Plătit</span>
      </motion.div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
          style={{ marginTop: '-120px' }}
        >
          <div className="bg-card/95 backdrop-blur-lg border border-white/10 rounded-xl p-4 shadow-xl max-w-xs">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              {showTooltip === 'love' && <Heart className="w-4 h-4 text-rose-400" />}
              {showTooltip === 'good' && <Zap className="w-4 h-4 text-blue-400" />}
              {showTooltip === 'needs' && <Globe className="w-4 h-4 text-emerald-400" />}
              {showTooltip === 'paid' && <Coins className="w-4 h-4 text-amber-400" />}
              {quadrants.find(q => q.key === showTooltip)?.label}
            </h4>
            <ul className="space-y-1">
              {getQuadrantData(showTooltip).slice(0, 3).map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
              {getQuadrantData(showTooltip).length > 3 && (
                <li className="text-xs text-muted-foreground/60">
                  +{getQuadrantData(showTooltip).length - 3} mai multe...
                </li>
              )}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Intersection labels */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Passion: Love + Good */}
        <div className="absolute text-[10px] text-purple-400/80 font-medium" style={{ top: '28%', left: '50%', transform: 'translateX(-50%)' }}>
          Pasiune
        </div>
        {/* Mission: Love + Needs */}
        <div className="absolute text-[10px] text-teal-400/80 font-medium" style={{ top: '50%', left: '28%', transform: 'translateY(-50%)' }}>
          Misiune
        </div>
        {/* Profession: Good + Paid */}
        <div className="absolute text-[10px] text-cyan-400/80 font-medium" style={{ top: '50%', right: '28%', transform: 'translateY(-50%)' }}>
          Profesie
        </div>
        {/* Vocation: Needs + Paid */}
        <div className="absolute text-[10px] text-lime-400/80 font-medium" style={{ bottom: '28%', left: '50%', transform: 'translateX(-50%)' }}>
          Vocație
        </div>
      </motion.div>
    </div>
  );
}
