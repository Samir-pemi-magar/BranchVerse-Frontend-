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
        bulletList: { HTMLAttributes: { class: "list-disc ml-3" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-3" } },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] sm:min-h-[460px] bg-slate-50 border rounded-md py-3 px-3 sm:py-4 sm:px-4 text-sm sm:text-base leading-7 w-full focus:outline-none",
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
