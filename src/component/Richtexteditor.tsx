// RichTextEditor.tsx
"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import React from "react";
import MenuBar from "./RichMenuBar";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc ml-4" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-4" } },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose-editor-dark",
        style: [
          "min-height: 360px",
          "background: rgba(255,255,255,0.04)",
          "border: 0.5px solid rgba(255,255,255,0.1)",
          "border-radius: 14px",
          "color: rgba(255,255,255,0.88)",
          "padding: 20px 24px",
          "font-family: 'DM Sans', sans-serif",
          "font-size: 15px",
          "line-height: 1.8",
          "caret-color: #15b0b7",
          "outline: none",
          "width: 100%",
          "box-sizing: border-box",
          "transition: border-color 0.2s, background 0.2s",
        ].join(";"),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <div className="w-full">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="w-full" />
    </div>
  );
}
