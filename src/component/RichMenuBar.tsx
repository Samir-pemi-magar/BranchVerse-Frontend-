// RichMenuBar.tsx
import { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";

interface MenuBarProps {
  editor: Editor | null;
}

export default function MenuBar({ editor }: MenuBarProps) {
  if (!editor) return null;

  const Options = [
    {
      icon: <Heading1 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive("heading", { level: 1 }),
      title: "Heading 1",
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive("heading", { level: 2 }),
      title: "Heading 2",
    },
    {
      icon: <Heading3 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive("heading", { level: 3 }),
      title: "Heading 3",
    },
    { type: "divider" },
    {
      icon: <Bold className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive("bold"),
      title: "Bold",
    },
    {
      icon: <Italic className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive("italic"),
      title: "Italic",
    },
    {
      icon: <Strikethrough className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      pressed: editor.isActive("strike"),
      title: "Strikethrough",
    },
    {
      icon: <Highlighter className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      pressed: editor.isActive("highlight"),
      title: "Highlight",
    },
    { type: "divider" },
    {
      icon: <AlignLeft className="w-4 h-4" />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      pressed: editor.isActive({ textAlign: "left" }),
      title: "Align Left",
    },
    {
      icon: <AlignCenter className="w-4 h-4" />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      pressed: editor.isActive({ textAlign: "center" }),
      title: "Align Center",
    },
    {
      icon: <AlignRight className="w-4 h-4" />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      pressed: editor.isActive({ textAlign: "right" }),
      title: "Align Right",
    },
    { type: "divider" },
    {
      icon: <List className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      pressed: editor.isActive("bulletList"),
      title: "Bullet List",
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: editor.isActive("orderedList"),
      title: "Ordered List",
    },
  ];

  return (
    <div
      className="flex flex-wrap gap-1 p-1.5 mb-2 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.1)",
      }}
    >
      {Options.map((option, index) => {
        if (option.type === "divider") {
          return (
            <div
              key={index}
              className="w-px mx-1 self-stretch"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
          );
        }
        return (
          <button
            key={index}
            type="button"
            title={option.title}
            onClick={option.onClick}
            data-active={option.pressed}
            className="p-2 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{
              background: option.pressed
                ? "rgba(108,78,242,0.3)"
                : "transparent",
              color: option.pressed ? "#957bda" : "rgba(255,255,255,0.45)",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              if (!option.pressed) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(255,255,255,0.85)";
              }
            }}
            onMouseLeave={(e) => {
              if (!option.pressed) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(255,255,255,0.45)";
              }
            }}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
