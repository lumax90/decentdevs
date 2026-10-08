// Frame the character above a close-up horizon. Around 60–70% of the globe is
// visible; the rest continues below the stage instead of shrinking to fit it.
export function getWorldFraming(width: number, height: number) {
  const aspect = width / Math.max(height, 1);
  const horizontalSpan = 3.55 + Math.min(1, Math.max(0, (aspect - 0.9) / 0.32));
  const zoom = Math.min(Math.max(width, 1) / horizontalSpan, Math.max(height, 1) / 3.8);
  const top = Math.min(52, height * 0.085);
  return { zoom, centerY: (height / 2 - top) / zoom - 2.94 };
}
