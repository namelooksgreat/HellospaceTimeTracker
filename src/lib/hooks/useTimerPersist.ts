import { useState, useEffect } from "react";
import { supabase } from "../supabase";

interface TimerState {
  time: number;
  startTime: string | null;
  isRunning: boolean;
}

export function useTimerPersist(userId: string | undefined) {
  const [timerState, setTimerState] = useState<TimerState>({
    time: 0,
    startTime: null,
    isRunning: false,
  });

  // Load initial timer state
  useEffect(() => {
    if (!userId) return;
    const loadTimerState = async () => {
      const { data, error } = await supabase
        .from("timer_states")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error loading timer state:", error);
        return;
      }

      if (data) {
        // If timer was running, calculate elapsed time
        if (data.is_running && data.start_time) {
          const startTime = new Date(data.start_time);
          const elapsedSeconds = Math.floor(
            (Date.now() - startTime.getTime()) / 1000,
          );
          setTimerState({
            time: data.time + elapsedSeconds,
            startTime: data.start_time,
            isRunning: true,
          });
        } else {
          setTimerState({
            time: data.time,
            startTime: data.start_time,
            isRunning: false,
          });
        }
      }
    };

    loadTimerState();
  }, [userId]);

  // Save timer state when it changes
  const saveTimerState = async (state: TimerState) => {
    if (!userId) return;

    try {
      // Önce mevcut kaydı kontrol et
      const { data: existingData } = await supabase
        .from("timer_states")
        .select()
        .eq("user_id", userId)
        .maybeSingle();

      if (existingData) {
        // Kayıt varsa güncelle
        const { error: updateError } = await supabase
          .from("timer_states")
          .update({
            time: state.time,
            start_time: state.startTime,
            is_running: state.isRunning,
          })
          .eq("user_id", userId);

        if (updateError) throw updateError;
      } else {
        // Kayıt yoksa yeni kayıt oluştur
        const { error: insertError } = await supabase
          .from("timer_states")
          .insert({
            user_id: userId,
            time: state.time,
            start_time: state.startTime,
            is_running: state.isRunning,
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Error saving timer state:", error);
    }
  };

  const startTimer = () => {
    const newState = {
      ...timerState,
      startTime: new Date().toISOString(),
      isRunning: true,
    };
    setTimerState(newState);
    saveTimerState(newState);
  };

  const pauseTimer = () => {
    const newState = {
      ...timerState,
      startTime: null,
      isRunning: false,
    };
    setTimerState(newState);
    saveTimerState(newState);
  };

  const resetTimer = async () => {
    if (!userId) return;

    // Önce veritabanındaki kaydı sil
    const { error: deleteError } = await supabase
      .from("timer_states")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error deleting timer state:", deleteError);
      return;
    }

    // Yeni boş kayıt oluştur
    const newState = {
      time: 0,
      startTime: null,
      isRunning: false,
    };

    setTimerState(newState);

    const { error: insertError } = await supabase.from("timer_states").insert({
      user_id: userId,
      time: 0,
      start_time: null,
      is_running: false,
    });

    if (insertError) {
      console.error("Error creating new timer state:", insertError);
    }
  };

  const updateTime = (newTime: number) => {
    const newState = {
      ...timerState,
      time: newTime,
      startTime: timerState.isRunning ? timerState.startTime : null,
    };
    setTimerState(newState);
    saveTimerState(newState);
  };

  return {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    updateTime,
  };
}
