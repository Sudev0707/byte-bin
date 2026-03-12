import * as React from "react"
import { cn } from "@/lib/utils"
import CodeMirror, { basicSetup } from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { cpp } from "@codemirror/lang-cpp"
import { oneDark } from "@codemirror/theme-one-dark"

interface CodeEditorProps {
  value?: string
  onChange?: (value: string) => void
  language?: string
  className?: string
}

const languageMap: Record<string, any> = {
  javascript: javascript(),
  "javascript": javascript(),
  js: javascript(),
  typescript: javascript({ typescript: true }),
  ts: javascript({ typescript: true }),
  python: python(),
  py: python(),
  java: java(),
  cpp: cpp(),
  "c++": cpp(),
  c: cpp(),
  rust: javascript(),
  go: javascript(),
  react: javascript({ jsx: true }),
  "node.js": javascript(),
}

const CodeEditor = React.forwardRef<HTMLElement, CodeEditorProps>(
  ({ 
    className, 
    language = "javascript", 
    value, 
    onChange, 
    ...props 
  }, ref) => {
    const langExtension = languageMap[language.toLowerCase()] || javascript()

    return (
      <CodeMirror
        ref={ref as any}
        value={value || ""}
        extensions={[basicSetup, langExtension]}
        theme={oneDark}
        onChange={onChange}
        className={cn(
          "min-h-[300px] rounded-md border border-input bg-background shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
        style={{ fontSize: '14px' }}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true
        }}
        {...props}
      />
    )
  }
)

CodeEditor.displayName = "CodeEditor"

export { CodeEditor }

