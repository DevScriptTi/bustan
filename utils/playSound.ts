export type SoundName = "pop" | "boop" | "sparkle" | "cheer" | "paper";

export const playSound = (soundName: SoundName) => {
  if (typeof window !== "undefined") {
    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.volume = soundName === "cheer" ? 0.7 : 0.5;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(`Audio '${soundName}' blocked by browser:`, err);
        });
      }
    } catch (err) {
      console.warn(`Audio creation error for '${soundName}':`, err);
    }
  }
};
