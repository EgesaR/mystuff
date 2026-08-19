import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

function urlToEmbedHtml(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) {
    return `<p><iframe width="560" height="315" src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allowfullscreen></iframe></p>`;
  }
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return `<p><video controls src="${url}" style="max-width:100%"></video></p>`;
  }
  if (/\.(mp3|wav|m4a)(\?.*)?$/i.test(url)) {
    return `<p><audio controls src="${url}"></audio></p>`;
  }
  return `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`;
}

export function EmbedDialog({
  open,
  onOpenChange,
  onInsert,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (html: string) => void;
}) {
  const [url, setUrl] = useState("");

  const handleInsert = () => {
    if (!url.trim()) return;
    onInsert(urlToEmbedHtml(url.trim()));
    setUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Embed a link</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="YouTube link, video/audio URL, or any link"
            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
          />
          <p className="text-xs text-muted-foreground mt-2">
            YouTube links embed as video. Direct .mp4/.webm and .mp3/.wav links
            embed as playable media. Anything else inserts as a plain link.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleInsert}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
