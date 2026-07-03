import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
// eslint-disable-next-line import/no-named-as-default
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Button, Space, Tooltip, Divider, ColorPicker } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  LineOutlined,
  UnorderedListOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import './RichTextEditor.css';
import type { Content } from '@tiptap/react';

interface RichTextEditorProps {
  content: Content;
  onChange: (content: Content) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <Space size="small" wrap>
          <Tooltip title="Bold (Ctrl+B)">
            <Button
              size="small"
              type={editor.isActive('bold') ? 'primary' : 'default'}
              icon={<BoldOutlined />}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
          </Tooltip>

          <Tooltip title="Italic (Ctrl+I)">
            <Button
              size="small"
              type={editor.isActive('italic') ? 'primary' : 'default'}
              icon={<ItalicOutlined />}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
          </Tooltip>

          <Tooltip title="Strikethrough (Ctrl+Shift+X)">
            <Button
              size="small"
              type={editor.isActive('strike') ? 'primary' : 'default'}
              icon={<LineOutlined />}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title="Bullet List (Ctrl+Shift+8)">
            <Button
              size="small"
              type={editor.isActive('bulletList') ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
          </Tooltip>

          <Divider type="vertical" />

          <ColorPicker
            showText
            size="small"
            value={editor.getAttributes('textStyle').color || '#000000'}
            onChange={(_, hex) => {
              editor.chain().focus().setColor(hex).run();
            }}
          />

          <Divider type="vertical" />

          <Tooltip title="Undo (Ctrl+Z)">
            <Button
              size="small"
              icon={<UndoOutlined />}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            />
          </Tooltip>

          <Tooltip title="Redo (Ctrl+Shift+Z)">
            <Button
              size="small"
              icon={<RedoOutlined />}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            />
          </Tooltip>
        </Space>
      </div>

      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
