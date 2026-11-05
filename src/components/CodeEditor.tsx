import { javascript } from '@codemirror/lang-javascript';
import { EditorView, basicSetup } from 'codemirror';
import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  /** The code the editor starts with; later changes come from the Learner's typing. */
  initialCode: string;
  onChange: (code: string) => void;
}

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
