import { javascript } from '@codemirror/lang-javascript';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { EditorView, basicSetup } from 'codemirror';
import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  /** The code the editor starts with; later changes come from the Learner's typing. */
  initialCode: string;
  onChange: (code: string) => void;
}

/** Syntax colours from the site's colour tokens, so light and dark mode both read well. */
const highlightStyle = HighlightStyle.define([
  { tag: [tags.keyword, tags.operatorKeyword, tags.modifier], color: 'var(--syntax-keyword)' },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'var(--syntax-string)' },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: 'var(--syntax-number)' },
  { tag: tags.comment, color: 'var(--syntax-comment)', fontStyle: 'italic' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: 'var(--syntax-function)' },
  { tag: [tags.className, tags.definition(tags.className)], color: 'var(--syntax-function)' },
]);

/** The editor's chrome (background, gutter, cursor, selection) from the same tokens. */
const editorTheme = EditorView.theme({
  '&': { backgroundColor: 'var(--surface)', color: 'var(--text)' },
  '.cm-content': { caretColor: 'var(--text)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--text)' },
  '.cm-gutters': { backgroundColor: 'var(--code-bg)', color: 'var(--muted)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'var(--active-line)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--active-line)', color: 'var(--text)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--selection)',
  },
  '.cm-matchingBracket': { backgroundColor: 'var(--selection)', outline: 'none' },
});

/** A CodeMirror 6 JavaScript editor with syntax highlighting and line numbers. */
export function CodeEditor({ initialCode, onChange }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const view = new EditorView({
      doc: initialCode,
      parent: host.current!,
      extensions: [
        basicSetup,
        javascript(),
        editorTheme,
        syntaxHighlighting(highlightStyle),
        EditorView.contentAttributes.of({ 'aria-label': 'Code editor' }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
      ],
    });
    return () => view.destroy();
  }, [initialCode]);

  return <div className="code-editor" ref={host} />;
}
