export interface NoteStats {
  words: number;
  minutes: number;
}

function stripHtmlToText(html: string): string {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent ?? "";
}

export function computeNoteStats(html: string): NoteStats {
  const text = stripHtmlToText(html).trim();
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = words === 0 ? 0 : Math.max(1, Math.round(words / 200));
  return { words, minutes };
}
