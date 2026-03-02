import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Undo,
  Redo,
  RemoveFormatting,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Start in HTML mode */
  defaultHtmlMode?: boolean;
  /** Minimum height for the editable area */
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  defaultHtmlMode = false,
  minHeight = 150,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlMode, setHtmlMode] = useState(defaultHtmlMode);
  const [htmlSource, setHtmlSource] = useState(value);
  const isInternalUpdate = useRef(false);

  // Sync external value into contentEditable when not in HTML mode
  useEffect(() => {
    if (!htmlMode && editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalUpdate.current = false;
  }, [value, htmlMode]);

  // Sync html source when value changes externally
  useEffect(() => {
    if (htmlMode && !isInternalUpdate.current) {
      setHtmlSource(value);
    }
  }, [value, htmlMode]);

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    // Read back the HTML after formatting
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  }, [exec]);

  const toggleMode = useCallback(() => {
    if (htmlMode) {
      // Switching from HTML → Visual: push htmlSource into value
      onChange(htmlSource);
    } else {
      // Switching from Visual → HTML: read current editor content
      setHtmlSource(editorRef.current?.innerHTML || value);
    }
    setHtmlMode((m) => !m);
  }, [htmlMode, htmlSource, onChange, value]);

  const handleHtmlChange = useCallback(
    (raw: string) => {
      setHtmlSource(raw);
      isInternalUpdate.current = true;
      onChange(raw);
    },
    [onChange]
  );

  const ToolBtn = ({
    cmd,
    icon: Icon,
    val,
    title,
    onClick,
  }: {
    cmd?: string;
    icon: React.ComponentType<{ className?: string }>;
    val?: string;
    title: string;
    onClick?: () => void;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // keep focus in editor
        if (onClick) onClick();
        else if (cmd) exec(cmd, val);
      }}
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  );

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b bg-muted/40">
        <ToolBtn cmd="bold" icon={Bold} title="Bold" />
        <ToolBtn cmd="italic" icon={Italic} title="Italic" />
        <ToolBtn cmd="underline" icon={Underline} title="Underline" />
        <ToolBtn cmd="strikeThrough" icon={Strikethrough} title="Strikethrough" />
        <Separator orientation="vertical" className="h-5 mx-1" />
        <ToolBtn icon={Link} title="Insert Link" onClick={handleLink} />
        <ToolBtn cmd="removeFormat" icon={RemoveFormatting} title="Remove Formatting" />
        <Separator orientation="vertical" className="h-5 mx-1" />
        <ToolBtn cmd="insertUnorderedList" icon={List} title="Bullet List" />
        <ToolBtn cmd="insertOrderedList" icon={ListOrdered} title="Numbered List" />
        <Separator orientation="vertical" className="h-5 mx-1" />
        <ToolBtn cmd="justifyLeft" icon={AlignLeft} title="Align Left" />
        <ToolBtn cmd="justifyCenter" icon={AlignCenter} title="Align Center" />
        <ToolBtn cmd="justifyRight" icon={AlignRight} title="Align Right" />
        <Separator orientation="vertical" className="h-5 mx-1" />
        <ToolBtn cmd="undo" icon={Undo} title="Undo" />
        <ToolBtn cmd="redo" icon={Redo} title="Redo" />

        {/* Spacer + HTML toggle */}
        <div className="flex-1" />
        <Button
          type="button"
          variant={htmlMode ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={toggleMode}
        >
          <Code className="h-3 w-3" />
          {htmlMode ? "Visual" : "HTML"}
        </Button>
      </div>

      {/* Editor area */}
      {htmlMode ? (
        <Textarea
          value={htmlSource}
          onChange={(e) => handleHtmlChange(e.target.value)}
          className="border-0 rounded-none font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 resize-y"
          style={{ minHeight }}
          placeholder="<p>Raw HTML here...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="px-3 py-2 text-sm outline-none prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline"
          style={{ minHeight }}
          data-placeholder={placeholder}
          dangerouslySetInnerHTML={{ __html: value || "" }}
        />
      )}
    </div>
  );
}
