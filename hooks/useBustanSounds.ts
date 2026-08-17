"use client";

import { playSound } from "@/utils/playSound";

export const useBustanSounds = () => {
  return {
    playClick: () => playSound("pop"),
    playSuccess: () => playSound("sparkle"),
    playError: () => playSound("boop"),
    playCard: () => playSound("paper"),
    playCelebrate: () => playSound("cheer"),
  };
};
