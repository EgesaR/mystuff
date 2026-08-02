import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

export function downloadNoteAsMarkdown(title: string, html: string) {
  const markdown = `# ${title}\n\n${turndown.turndown(html || "")}`;
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title || "note"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
