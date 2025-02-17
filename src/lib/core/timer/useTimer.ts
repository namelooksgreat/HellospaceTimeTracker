import { useState, useEffect, useCallback } from "react";
import { timerCore } from "./TimerCore";
import { TimerState } from "@/types/timer";

export function useTimer() {
  const [time, setTime] = useState(timerCore.getTime());
  const [state, setState] = useState<TimerState>(timerCore.getState());

  useEffect(() => {
    const unsubscribe = timerCore.subscribe((newTime) => {
      setTime(newTime);
      setState(timerCore.getState());
    });

    return () => unsubscribe();
  }, []);

  const start = useCallback(() => {
    timerCore.start();
  }, []);

  const pause = useCallback(() => {
    timerCore.pause();
  }, []);

  const resume = useCallback(() => {
    timerCore.resume();
  }, []);

  const stop = useCallback(() => {
    timerCore.stop();
  }, []);

  return {
    time,
    state,
    start,
    pause,
    resume,
    stop,
  };
}
