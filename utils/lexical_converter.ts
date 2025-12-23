// utils/lexicalMarkdownConverter.ts
import { createHeadlessEditor } from '@lexical/headless';
import {
  $convertToMarkdownString,
  $convertFromMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import { $getRoot } from 'lexical';

const editor = createHeadlessEditor({
  nodes: [],
  onError: (error) => console.error('Lexical headless error:', error),
});

export function lexicalToMarkdown(lexical: any): string {
  if (!lexical) return '';

  try {
    const json = typeof lexical === 'string' ? JSON.parse(lexical) : lexical;
    const editorState = editor.parseEditorState(json);
    editor.setEditorState(editorState);

    let markdown = '';
    editor.read(() => {
      markdown = $convertToMarkdownString(TRANSFORMERS);
    });
    return markdown.trim();
  } catch (error) {
    console.error('lexicalToMarkdown error:', error);
    return extractPlainText(lexical);
  }
}

/**
 * Markdown string → Lexical JSON string (cho Payload)
 */
export function markdownToLexical(markdown: string): string {
  try {
    let lexicalJson = '';

    // DÙNG editor.update + read() để đảm bảo state được apply đầy đủ
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      $convertFromMarkdownString(markdown || '', TRANSFORMERS);
    });

    // ĐỌC STATE SAU KHI UPDATE HOÀN TẤT
    editor.read(() => {
      lexicalJson = JSON.stringify(editor.getEditorState().toJSON());
    });

    return lexicalJson;
  } catch (error) {
    console.error('markdownToLexical error:', error);
    return JSON.stringify({
      root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 },
    });
  }
}

// Fallback extract plain text
function extractPlainText(lexical: any): string {
  let text = '';
  try {
    const json = typeof lexical === 'string' ? JSON.parse(lexical) : lexical;
    const traverse = (node: any) => {
      if (node.type === 'text') text += node.text;
      if (node.type === 'linebreak') text += '\n';
      if (Array.isArray(node.children)) node.children.forEach(traverse);
    };
    json.root?.children?.forEach(traverse);
  } catch {}
  return text.trim();
}