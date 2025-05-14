import React, { useState } from "react";
import Button from "~/components/Button";
import {
  FiAlignCenter,
  FiAlignJustify,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiItalic,
  FiUnderline,
  FiCheck
} from "react-icons/fi";
import { Select } from "@headlessui/react";
import DragCloseDrawer from "~/components/DragCloseDrawer";

type AlignmentVariant = "left" | "center" | "justify" | "right";

interface TextFormatData {
  font: string;
  fontSize: number;
  fontColor: string;
  alignment: AlignmentVariant;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

interface TextFormatDragDrawerProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  setData: (data: TextFormatData) => void;
}

const TextFormatDragDrawer = ({
  drawerOpen,
  setDrawerOpen,
  setData
}: TextFormatDragDrawerProps) => {
  const [font, setFont] = useState("Calibri");
  const [fontSize, setFontSize] = useState(12);
  const [alignment, setAlignment] = useState<AlignmentVariant>("left");
  const [fontColor, setFontColor] = useState("bg-black");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);

  const fontList = [
    "Calibri",
    "Coming Soon",
    "Dancing Script",
    "Noto Sans Adlam",
    "Noto Sans Miao",
    "Noto Sans Mono CJK TC Regular",
    "Roboto",
    "Roboto Light",
    "Roboto Condensed",
    "Roboto Black"
  ];
  const fontSizeList = [
    12, 14, 16, 18, 20, 24, 26, 28, 32, 36, 38, 40, 44, 48, 52, 56, 60, 64, 68, 72
  ];

  const handleSave = () => {
    setData({
      font,
      fontSize,
      fontColor,
      alignment,
      bold,
      italic,
      underline
    });
  };

  return (
    <DragCloseDrawer open={drawerOpen} setOpen={setDrawerOpen}>
      <div className="mx-auto space-y-8 text-neutral-400 px-2.5">
        <section className="flex items-center mb-6">
          <h1 className="font-medium text-xl tracking-tight">Text format</h1>
        </section>
        <section className="flex items-center space-x-2.5">
          <ColorCircle
            color="bg-black"
            fontColor={fontColor}
            setFontColor={setFontColor}
          />
          <ColorCircle
            color="bg-white"
            fontColor={fontColor}
            setFontColor={setFontColor}
          />
          <ColorCircle
            color="bg-blue-700"
            fontColor={fontColor}
            setFontColor={setFontColor}
          />
          <ColorCircle
            color="bg-teal-700"
            fontColor={fontColor}
            setFontColor={setFontColor}
          />
          <ColorCircle
            color="bg-lime-700"
            fontColor={fontColor}
            setFontColor={setFontColor}
          />
        </section>
        <section className="flex items-center justify-between">
          <Button
            btn_type="outline"
            className={`px-6 py-2.5 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-800/30 dark:hover:text-orange-400 ${
              alignment === "left"
                ? "dark:bg-orange-800/30 dark:text-orange-500"
                : "dark:text-neutral-200"
            }`}
            onClick={() => setAlignment("left")}
          >
            <FiAlignLeft />
          </Button>
          <Button
            btn_type="outline"
            className={`px-6 py-2.5 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-800/30 dark:hover:text-orange-400 ${
              alignment === "center"
                ? "dark:bg-orange-800/30 dark:text-orange-500"
                : "dark:text-neutral-200"
            }`}
            onClick={() => setAlignment("center")}
          >
            <FiAlignCenter />
          </Button>
          <Button
            btn_type="outline"
            className={`px-6 py-2.5 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-800/30 dark:hover:text-orange-400 ${
              alignment === "justify"
                ? "dark:bg-orange-800/30 dark:text-orange-500"
                : "dark:text-neutral-200"
            }`}
            onClick={() => setAlignment("justify")}
          >
            <FiAlignJustify />
          </Button>
          <Button
            btn_type="outline"
            className={`px-6 py-2.5 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-800/30 dark:hover:text-orange-400 ${
              alignment === "right"
                ? "dark:bg-orange-800/30 dark:text-orange-500"
                : "dark:text-neutral-200"
            }`}
            onClick={() => setAlignment("right")}
          >
            <FiAlignRight />
          </Button>
        </section>
        <section>
          <Select
            name="font"
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="w-full inline-flex items-center gap-x-2 text-sm font-medium rounded-lg px-4 py-2 focus:outline-none disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200 border border-transparent bg-transparent text-neutral-200 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-800/30 dark:hover:text-orange-400 dark:focus:bg-orange-800/30 dark:focus:text-orange-400"
          >
            {fontList.map((fontItem, id) => (
              <option key={id} value={fontItem}>{fontItem}</option>
            ))}
          </Select>
        </section>
        <section className="flex items-center justify-between space-x-4">
          <Button
            btn_type="outline"
            className={`px-6 py-2.5 ${
              bold
                ? "dark:bg-orange-800/30 dark:text-orange-500"
                : "dark:text-neutral-200"
            }`}
            onClick={() => setBold(prev => !prev)}
          >
            <FiBold />
          </Button>
          <Button
            btn_type="outline"
            className={`px-6 py-2.5 ${
              italic
                ? "dark:bg-orange-800/30 dark:text-orange-500"
                : "dark:text-neutral-200"
            }`}
            onClick={() => setItalic(prev => !prev)}
          >
            <FiItalic />
          </Button>
          <Button
            btn_type="outline"
            className={`px-6 py-2.5 ${
              underline
                ? "dark:bg-orange-800/30 dark:text-orange-500"
                : "dark:text-neutral-200"
            }`}
            onClick={() => setUnderline(prev => !prev)}
          >
            <FiUnderline />
          </Button>
          <Select
            name="fontSize"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full inline-flex items-center gap-x-2 text-sm font-medium rounded-lg px-1 py-2 focus:outline-none transition-colors duration-200 border border-transparent bg-transparent text-neutral-200 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-800/30 dark:hover:text-orange-400 dark:focus:bg-orange-800/30 dark:focus:text-orange-400"
          >
            {fontSizeList.map((fontSizeItem, id) => (
              <option key={id} value={fontSizeItem}>{fontSizeItem}</option>
            ))}
          </Select>
        </section>
        <section>
          <Button
            btn_type="primary"
            onClick={handleSave}
            className="w-full"
          >
            Save Changes
          </Button>
        </section>
      </div>
    </DragCloseDrawer>
  );
};

interface ColorCircleProps {
  color: string;
  fontColor: string;
  setFontColor: (color: string) => void;
}

const ColorCircle = ({ color, fontColor, setFontColor }: ColorCircleProps) => {
  return (
    <div
      onClick={() => setFontColor(color)}
      className={`h-10 w-10 rounded-full grid place-content-center ${color}`}
    >
      {fontColor === color && <FiCheck className="size-6" />}
    </div>
  );
};

export default TextFormatDragDrawer;