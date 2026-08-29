'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Link2Off, Undo, Redo, Quote
} from 'lucide-react'

interface TiptapEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-lg transition-colors ${
      active
        ? 'bg-blue-100 text-blue-700'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
    }`}
  >
    {children}
  </button>
)

const Divider = () => <div className="w-px h-5 bg-stone-200 mx-1 self-center" />

export default function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      (StarterKit as any).configure({
        // Link & Underline didaftarkan manual di bawah dengan konfigurasi khusus
        // — cegah duplikat extension name
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        // F-203: force safe rel + target on every link, even those inserted
        // by paste or by a future extension. Defence-in-depth alongside
        // server-side sanitization in `lib/sanitize.ts`.
        HTMLAttributes: {
          class: 'text-blue-600 underline',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        // Reject any non-http(s)/relative/anchor/mailto/tel scheme
        validate: (href: string) =>
          /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(href),
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Tulis konten berita di sini...',
      }),
    ],
    immediatelyRender: false,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[280px] px-4 py-3 focus:outline-none',
      },
    },
  })

  if (!editor) return null

  // F-203: restrict Tiptap Link to safe URL schemes only. Defence-in-depth
  // alongside the server-side sanitizer in `lib/sanitize.ts`.
  const SAFE_URL_REGEX = /^(https?:\/\/|\/|#|mailto:|tel:)/i

  const addLink = () => {
    const url = window.prompt('Masukkan URL:')
    if (!url) return
    const trimmed = url.trim()
    if (!SAFE_URL_REGEX.test(trimmed)) {
      window.alert(
        'URL tidak valid. Gunakan link http(s), path relatif (/…), anchor (#…), mailto: atau tel:'
      )
      return
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: trimmed, target: '_blank', rel: 'noopener noreferrer' })
      .run()
  }

  const unsetLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
  }

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-stone-200 bg-stone-50">
        {/* Undo / Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="size-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <Divider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="size-4" />
        </ToolbarButton>

        <Divider />

        {/* Text align */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Rata Kiri"
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Rata Tengah"
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Rata Kanan"
        >
          <AlignRight className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Rata Kiri Kanan"
        >
          <AlignJustify className="size-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          onClick={addLink}
          active={editor.isActive('link')}
          title="Tambah Link"
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={unsetLink} active={false} title="Hapus Link">
          <Link2Off className="size-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}