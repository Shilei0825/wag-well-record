import { useState, useRef, useEffect } from 'react';
import { Stethoscope } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function FloatingAIVetBubble() {
  const navigate = useNavigate();
  const location = useLocation();
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('right');
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  // Don't show on AI Vet page or public routes
  const hiddenRoutes = ['/ai-vet', '/', '/login', '/register'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { x: position.x, y: position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    const newY = Math.max(
      100,
      Math.min(window.innerHeight - 150, initialPos.current.y + deltaY)
    );

    setPosition({ x: 0, y: newY });

    // Determine which side based on current pointer position
    if (e.clientX < window.innerWidth / 2) {
      setSide('left');
    } else {
      setSide('right');
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      const dragDistance = Math.abs(e.clientX - dragStart.current.x) + Math.abs(e.clientY - dragStart.current.y);
      
      // Only navigate if it was a click (not a drag)
      if (dragDistance < 10) {
        navigate('/ai-vet');
      }
    }
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <button
      ref={bubbleRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={cn(
        'fixed z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform',
        'hover:scale-110 active:scale-95',
        isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab',
        side === 'right' ? 'right-4' : 'left-4'
      )}
      style={{
        top: `${position.y}px`,
      }}
      aria-label="AI Vet"
    >
      <Stethoscope className="h-6 w-6" />
    </button>
  );
}
