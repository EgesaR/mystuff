import React from "react";

// Regular expression to match URLs
const urlRegex = /(https?:\/\/[^\s<>"']+[^\s<>"'.,!?])/g;

export const renderContentWithLinks = (content: string): React.ReactNode => {
  if (!content) return content;

  // Split content by URLs and render links
  const parts = content.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};