import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Quote,
  Minus,
  Palette,
  Maximize,
  Minimize,
  ImagePlus,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  defaultHtmlMode?: boolean;
  minHeight?: number;
}

const FONT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#cccccc",
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#6366f1",
];

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
  const [fullscreen, setFullscreen] = useState(false);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!htmlMode && editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalUpdate.current = false;
  }, [value, htmlMode]);

  useEffect(() => {
    if (htmlMode && !isInternalUpdate.current) {
      setHtmlSource(value);
    }
  }, [value, htmlMode]);

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
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

  const handleInsertMedia = useCallback(() => {
    const url = prompt("Enter image URL:");
    if (url) exec("insertImage", url);
  }, [exec]);

  const handleHeadingChange = useCallback((val: string) => {
    if (val === "p") {
      exec("formatBlock", "p");
    } else {
      exec("formatBlock", val);
    }
  }, [exec]);

  const handleFontColor = useCallback((color: string) => {
    exec("foreColor", color);
  }, [exec]);

  const toggleMode = useCallback(() => {
    if (htmlMode) {
      onChange(htmlSource);
    } else {
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
        e.preventDefault();
        if (onClick) onClick();
        else if (cmd) exec(cmd, val);
      }}
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  );

  const wrapperClass = fullscreen
    ? "fixed inset-0 z-50 bg-background flex flex-col"
    : "border rounded-md overflow-hidden bg-background";

  return (
    <div className={wrapperClass}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b bg-muted/40">
        {/* Heading dropdown */}
        <Select defaultValue="p" onValueChange={handleHeadingChange}>
          <SelectTrigger className="h-7 w-[110px] text-xs border-0 bg-transparent">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
            <SelectItem value="h4">Heading 4</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolBtn cmd="bold" icon={Bold} title="Bold" />
        <ToolBtn cmd="italic" icon={Italic} title="Italic" />
        <ToolBtn cmd="underline" icon={Underline} title="Underline" />
        <ToolBtn cmd="strikeThrough" icon={Strikethrough} title="Strikethrough" />

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolBtn icon={Link} title="Insert Link" onClick={handleLink} />
        <ToolBtn icon={ImagePlus} title="Insert Media" onClick={handleInsertMedia} />
        <ToolBtn cmd="removeFormat" icon={RemoveFormatting} title="Remove Formatting" />

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolBtn cmd="insertUnorderedList" icon={List} title="Bullet List" />
        <ToolBtn cmd="insertOrderedList" icon={ListOrdered} title="Numbered List" />
        <ToolBtn cmd="formatBlock" icon={Quote} val="blockquote" title="Blockquote" />
        <ToolBtn cmd="insertHorizontalRule" icon={Minus} title="Horizontal Rule" />

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolBtn cmd="justifyLeft" icon={AlignLeft} title="Align Left" />
        <ToolBtn cmd="justifyCenter" icon={AlignCenter} title="Align Center" />
        <ToolBtn cmd="justifyRight" icon={AlignRight} title="Align Right" />

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Font Color Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Font Color">
              <Palette className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-5 gap-1">
              {FONT_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFontColor(color);
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolBtn cmd="undo" icon={Undo} title="Undo" />
        <ToolBtn cmd="redo" icon={Redo} title="Redo" />

        {/* Spacer + toggles */}
        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={() => setFullscreen(!fullscreen)}
        >
          {fullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
        </Button>

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
          className="border-0 rounded-none font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 resize-y flex-1"
          style={{ minHeight }}
          placeholder="<p>Raw HTML here...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="px-3 py-2 text-sm outline-none prose prose-sm max-w-none [&_a]:text-primary [&_a]:underline flex-1 overflow-y-auto"
          style={{ minHeight }}
          data-placeholder={placeholder}
          dangerouslySetInnerHTML={{ __html: value || "" }}
        />
      )}
    </div>
  );
}
