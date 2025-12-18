// utils/lexicalMarkdownConverter.ts

import { createHeadlessEditor } from '@lexical/headless';
import {
  $convertToMarkdownString,
  $convertFromMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import { $getRoot, LineBreakNode } from 'lexical'; // ← QUAN TRỌNG: Import LinebreakNode

// Tạo editor headless với các node cần thiết
const editor = createHeadlessEditor({
  nodes: [
    LineBreakNode, // ← Bắt buộc để hỗ trợ <br> và linebreak trong JSON
    // Nếu sau này dùng bold, italic, list... thì thêm các node tương ứng
    // Ví dụ: BoldNode, ItalicNode, ListNode, ListItemNode, HeadingNode...
  ],
  onError: (error) => {
    console.error('Lexical headless error:', error);
  },
});

/**
 * Lexical JSON string → Markdown string
 */
export function lexicalToMarkdown(lexicalJsonString: string): string {
  let markdown = '';

  try {
    const editorState = editor.parseEditorState(JSON.parse(lexicalJsonString));
    editor.setEditorState(editorState);

    editor.read(() => {
      markdown = $convertToMarkdownString(TRANSFORMERS);
    });
  } catch (error) {
    console.error('lexicalToMarkdown error:', error);
    // Fallback: extract plain text
    try {
      const state = JSON.parse(lexicalJsonString);
      markdown = extractPlainTextFromLexical(state);
    } catch {
      markdown = '';
    }
  }

  return markdown.trim();
}

/**
 * Markdown string → Lexical JSON string
 */
export function markdownToLexical(markdown: string): string {
  let lexicalJson = '';

  try {
    editor.update(() => {
      // Clear trước khi import markdown
      const root = $getRoot();
      root.clear();

      $convertFromMarkdownString(markdown, TRANSFORMERS);

      lexicalJson = JSON.stringify(editor.getEditorState().toJSON());
    });
  } catch (error) {
    console.error('markdownToLexical error:', error);
    // Fallback empty
    lexicalJson = JSON.stringify({
      root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 },
    });
  }

  return lexicalJson;
}

// Helper: extract plain text nếu convert fail
function extractPlainTextFromLexical(json: any): string {
  let text = '';
  function traverse(node: any) {
    if (node.type === 'text') {
      text += node.text;
    } else if (node.children) {
      node.children.forEach(traverse);
    }
    if (node.type === 'linebreak') {
      text += '\n';
    }
  }
  json.root?.children?.forEach(traverse);
  return text;
}