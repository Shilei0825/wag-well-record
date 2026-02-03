import { useMonthlyCheckIns } from '@/hooks/useCheckIns';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Bone, Fish } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JourneyPathProps {
  petId?: string;
  species?: string;
}

export function JourneyPath({ petId, species = 'dog' }: JourneyPathProps) {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const { data: checkIns = [] } = useMonthlyCheckIns(year, month, petId);
  
  const checkedDays = new Set(
    checkIns.map(c => new Date(c.check_in_date).getDate())
  );
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const isCurrentMonth = () => {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth();
  };
  
  // Generate path points for the journey
  const generatePathPoints = () => {
    const points: { x: number; y: number; day: number }[] = [];
    const width = 280;
    const rowHeight = 50;
    const pawsPerRow = 7;
    
    for (let i = 0; i < daysInMonth; i++) {
      const row = Math.floor(i / pawsPerRow);
      const col = i % pawsPerRow;
      const isEvenRow = row % 2 === 0;
      
      points.push({
        x: isEvenRow ? col * (width / (pawsPerRow - 1)) : width - col * (width / (pawsPerRow - 1)),
        y: row * rowHeight + 20,
        day: i + 1,
      });
    }
    
    return points;
  };
  
  const pathPoints = generatePathPoints();
  const today = new Date().getDate();
  const isToday = isCurrentMonth();
  
  // Create SVG path
  const createPath = () => {
    if (pathPoints.length === 0) return '';
    
    let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    
    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];
      
      // Use smooth curves
      const cpX = (prev.x + curr.x) / 2;
      path += ` Q ${prev.x} ${(prev.y + curr.y) / 2} ${cpX} ${(prev.y + curr.y) / 2}`;
      path += ` T ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-semibold text-foreground">{monthName}</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToNextMonth}
          disabled={isCurrentMonth()}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Journey Path */}
      <div className="relative overflow-hidden" style={{ height: Math.ceil(daysInMonth / 7) * 50 + 40 }}>
        <svg 
          className="absolute inset-0 w-full h-full"
          viewBox={`-10 0 300 ${Math.ceil(daysInMonth / 7) * 50 + 40}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Dashed path line */}
          <path
            d={createPath()}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="3"
            strokeDasharray="8 8"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Paw prints */}
        {pathPoints.map((point, index) => {
          const day = point.day;
          const isChecked = checkedDays.has(day);
          const isTodayDay = isToday && day === today;
          const isFuture = isToday && day > today;
          
          return (
            <motion.div
              key={day}
              className="absolute"
              style={{
                left: `calc(${(point.x / 280) * 100}% - 12px)`,
                top: point.y - 12,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                  transition-all duration-300
                  ${isChecked 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : isTodayDay
                    ? 'bg-accent border-2 border-primary text-foreground'
                    : isFuture
                    ? 'bg-muted/30 text-muted-foreground/50'
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {isChecked ? (
                  species === 'dog' ? (
                    <Bone className="w-4 h-4" />
                  ) : (
                    <Fish className="w-4 h-4" />
                  )
                ) : (
                  <span>{day}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            {species === 'dog' ? (
              <Bone className="w-2.5 h-2.5 text-primary-foreground" />
            ) : (
              <Fish className="w-2.5 h-2.5 text-primary-foreground" />
            )}
          </div>
          <span>{language === 'zh' ? '已打卡' : 'Checked'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-muted" />
          <span>{language === 'zh' ? '未打卡' : 'Missed'}</span>
        </div>
      </div>
    </div>
  );
}

function PawIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm-5.5 3c-.83 0-1.5.67-1.5 1.5S5.67 14 6.5 14 8 13.33 8 12.5 7.33 11 6.5 11zm11 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM12 16c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4zM5 8c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm10 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/>
    </svg>
  );
}
