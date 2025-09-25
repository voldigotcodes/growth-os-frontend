import { useCallback, useEffect, useRef } from 'react';

export function useSwipeGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  restraint = 100,
  allowedTime = 300
} = {}) {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchStartTime = useRef(null);
  const elementRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStartX.current || !touchStartY.current || !touchStartTime.current) return;

    const touch = e.changedTouches[0];
    const distX = touch.clientX - touchStartX.current;
    const distY = touch.clientY - touchStartY.current;
    const elapsedTime = Date.now() - touchStartTime.current;

    // Check if swipe was fast enough and far enough
    if (elapsedTime <= allowedTime) {
      // Horizontal swipe
      if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
        if (distX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
      // Vertical swipe
      else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
        if (distY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    // Reset
    touchStartX.current = null;
    touchStartY.current = null;
    touchStartTime.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, restraint, allowedTime]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return elementRef;
}