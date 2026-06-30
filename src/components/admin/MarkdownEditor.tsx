import { useState, useRef, useCallback, useEffect } from 'react';
import MarkdownContent from '../MarkdownContent';
import './MarkdownEditor.css';

type ViewMode = 'editor' | 'preview' | 'split';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ToolbarButton {
  label: string;
  icon: string;
  action: (textarea: HTMLTextAreaElement, value: string) => { newValue: string; cursorPos: number };
}

const toolbarButtons: ToolbarButton[] = [
  {
    label: 'Жирный',
    icon: 'B',
    action: (textarea, value) => {
      const { selectionStart, selectionEnd } = textarea;
      const selected = value.slice(selectionStart, selectionEnd);
      const replacement = selected ? `**${selected}**` : '**текст**';
      const newValue = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
      const cursorPos = selected
        ? selectionStart + replacement.length
        : selectionStart + 2;
      return { newValue, cursorPos };
    },
  },
  {
    label: 'Курсив',
    icon: 'I',
    action: (textarea, value) => {
      const { selectionStart, selectionEnd } = textarea;
      const selected = value.slice(selectionStart, selectionEnd);
      const replacement = selected ? `*${selected}*` : '*текст*';
      const newValue = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
      const cursorPos = selected
        ? selectionStart + replacement.length
        : selectionStart + 1;
      return { newValue, cursorPos };
    },
  },
  {
    label: 'Заголовок',
    icon: 'H',
    action: (textarea, value) => {
      const { selectionStart, selectionEnd } = textarea;
      const selected = value.slice(selectionStart, selectionEnd);
      const replacement = `## ${selected || 'Заголовок'}`;
      const newValue = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
      const cursorPos = selected
        ? selectionStart + replacement.length
        : selectionStart + 3;
      return { newValue, cursorPos };
    },
  },
  {
    label: 'Ссылка',
    icon: '🔗',
    action: (textarea, value) => {
      const { selectionStart, selectionEnd } = textarea;
      const selected = value.slice(selectionStart, selectionEnd);
      const replacement = selected ? `[${selected}](url)` : '[текст](url)';
      const newValue = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
      const cursorPos = selected
        ? selectionStart + selected.length + 3
        : selectionStart + 1;
      return { newValue, cursorPos };
    },
  },
  {
    label: 'Картинка',
    icon: '🖼',
    action: (textarea, value) => {
      const { selectionStart, selectionEnd } = textarea;
      const selected = value.slice(selectionStart, selectionEnd);
      const replacement = selected ? `![${selected}](url)` : '![alt](url)';
      const newValue = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
      const cursorPos = selected
        ? selectionStart + selected.length + 4
        : selectionStart + 2;
      return { newValue, cursorPos };
    },
  },
  {
    label: 'Код',
    icon: '</>',
    action: (textarea, value) => {
      const { selectionStart, selectionEnd } = textarea;
      const selected = value.slice(selectionStart, selectionEnd);
      const replacement = selected
        ? `\`\`\`\n${selected}\n\`\`\``
        : '```\nкод\n```';
      const newValue = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
      const cursorPos = selected
        ? selectionStart + replacement.length
        : selectionStart + 4;
      return { newValue, cursorPos };
    },
  },
  {
    label: 'Список',
    icon: '•',
    action: (textarea, value) => {
      const { selectionStart, selectionEnd } = textarea;
      const selected = value.slice(selectionStart, selectionEnd);
      const replacement = selected
        ? selected.split('\n').map((line) => `- ${line}`).join('\n')
        : '- элемент';
      const newValue = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
      const cursorPos = selectionStart + replacement.length;
      return { newValue, cursorPos };
    },
  },
  {
    label: 'Цитата',
    icon: '❝',
    action: (textarea, value) => {
      const { selectionStart, selectionEnd } = textarea;
      const selected = value.slice(selectionStart, selectionEnd);
      const replacement = selected
        ? selected.split('\n').map((line) => `> ${line}`).join('\n')
        : '> цитата';
      const newValue = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
      const cursorPos = selectionStart + replacement.length;
      return { newValue, cursorPos };
    },
  },
];

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [mode, setMode] = useState<ViewMode>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Responsive: default to 'editor' on mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    if (mq.matches) setMode('editor');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches && mode === 'split') setMode('editor');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToolbarClick = useCallback(
    (button: ToolbarButton) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const { newValue, cursorPos } = button.action(textarea, value);
      onChange(newValue);
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [value, onChange],
  );

  return (
    <div className="md-editor">
      {/* Mode toggle tabs */}
      <div className="md-editor__header">
        <div className="md-editor__modes">
          {([['editor', 'Редактор'], ['preview', 'Превью'], ['split', 'Оба']] as const).map(
            ([m, label]) => (
              <button
                key={m}
                type="button"
                className={`md-editor__mode-btn${mode === m ? ' md-editor__mode-btn--active' : ''}`}
                onClick={() => setMode(m)}
              >
                {label}
              </button>
            ),
          )}
        </div>

        {/* Toolbar – visible when editor pane is shown */}
        {mode !== 'preview' && (
          <div className="md-editor__toolbar">
            {toolbarButtons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                className="md-editor__tool-btn"
                title={btn.label}
                onClick={() => handleToolbarClick(btn)}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={`md-editor__content md-editor__content--${mode}`}>
        {mode !== 'preview' && (
          <textarea
            ref={textareaRef}
            className="md-editor__textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Введите markdown...'}
          />
        )}
        {mode !== 'editor' && (
          <div className="md-editor__preview">
            {value ? (
              <MarkdownContent content={value} />
            ) : (
              <p className="md-editor__preview-empty">Превью появится здесь...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
