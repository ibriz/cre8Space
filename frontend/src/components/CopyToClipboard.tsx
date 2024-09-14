import React from "react";
import { CopyIcon } from "./Icons";

export default function CopyToClipboard({
  textToCopy,
}: {
  textToCopy: string;
}) {
  const [copyTooltip, setCopyTooltip] = React.useState(false);

  const copyToClipboard = (event: React.MouseEvent, text: string) => {
    event.stopPropagation();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyTooltip(true);
        setTimeout(() => {
          setCopyTooltip(false);
        }, 2000);
      })
      .catch((error) => {
        console.error("Error copying to clipboard: ", error);
      });
  };

  return (
    <div className="relative flex items-center">
      <div
        className={`absolute left-1/2 mt-6 -translate-x-1/2 transform rounded-lg bg-gray-700 px-3 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-300 ${
          copyTooltip ? "opacity-100" : "invisible"
        }`}
      >
        {copyTooltip ? "Copied" : "Copy"}
      </div>
      <div
        onClick={(event) => copyToClipboard(event, textToCopy)}
        className="cursor-pointer"
      >
        <CopyIcon className="h-6" />
      </div>
    </div>
  );
}
