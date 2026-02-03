import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect } from 'react';

interface CheckInAnimationProps {
  streak: number;
  onComplete: () => void;
}

export function CheckInAnimation({ streak, onComplete }: CheckInAnimationProps) {
  const { language } = useLanguage();
  
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const pawPrints = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
    size: 20 + Math.random() * 20,
    rotation: Math.random() * 360,
  }));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Floating paw prints */}
      {pawPrints.map((paw) => (
        <motion.div
          key={paw.id}
          className="absolute text-primary"
          style={{
            left: `${paw.x}%`,
            top: `${paw.y}%`,
            fontSize: paw.size,
          }}
          initial={{ opacity: 0, scale: 0, rotate: paw.rotation }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0.8],
            y: [-20, 0, 10, 30],
          }}
          transition={{ 
            duration: 2,
            delay: paw.delay,
            ease: "easeOut",
          }}
        >
          🐾
        </motion.div>
      ))}

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center p-8"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2 
        }}
      >
        {/* Paw circle */}
        <motion.div
          className="w-32 h-32 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.span
            className="text-6xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 10,
              delay: 0.5 
            }}
          >
            🐾
          </motion.span>
        </motion.div>

        {/* Success text */}
        <motion.h2
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {language === 'zh' ? '打卡成功！' : 'Check-in Complete!'}
        </motion.h2>

        {/* Streak */}
        <motion.div
          className="flex items-center justify-center gap-2 text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-xl">🔥</span>
          <span className="text-xl font-semibold">
            {language === 'zh' 
              ? `连续打卡 ${streak} 天` 
              : `${streak} day streak`}
          </span>
        </motion.div>

        {/* Sparkle effects */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos((i / 8) * Math.PI * 2) * 100,
              y: Math.sin((i / 8) * Math.PI * 2) * 100,
              opacity: 0,
              scale: [1, 0],
            }}
            transition={{
              duration: 1,
              delay: 0.7,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
