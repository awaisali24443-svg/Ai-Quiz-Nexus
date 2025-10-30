
import { useState, useEffect, useRef, useCallback } from 'react';

export const useQuizTimer = (duration: number, onTimeout: () => void) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<number | null>(null);

    const onTimeoutCb = useCallback(onTimeout, [onTimeout]);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setIsRunning(false);
                        onTimeoutCb();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        
        return () => {
            if(timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, onTimeoutCb]);

    const start = useCallback(() => {
        setTimeLeft(duration);
        setIsRunning(true);
    }, [duration]);

    const stop = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        stop();
        setTimeLeft(duration);
    }, [duration, stop]);

    return { timeLeft, start, stop, reset, isRunning };
};
