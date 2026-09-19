import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Send, Paperclip, X, Loader2 } from "lucide-react";

export function ChatInputBox({
  value,
  onValueChange,
  onSendMessage,
  onTyping,
  isSending,
}) {
  // Only used if the component is used in uncontrolled mode (no `value` prop provided)
  const [uncontrolledText, setUncontrolledText] = useState("");
  const [attachments, setAttachments] = useState([]);

  // Derive current text value: controlled prop takes precedence over internal state
  const isControlled = value !== undefined;
  const currentText = isControlled ? value : uncontrolledText;

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            url: reader.result,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    maxSize: 5 * 1024 * 1024,
    accept: {
      "image/*": [".jpeg", ".png", ".webp", ".avif"],
    },
  });

  const handleInputChange = (e) => {
    const nextVal = e.target.value;
    if (!isControlled) {
      setUncontrolledText(nextVal);
    }
    onValueChange?.(nextVal);
    onTyping?.(true);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!currentText.trim() && attachments.length === 0) return;

    onSendMessage(currentText.trim(), attachments);

    if (!isControlled) {
      setUncontrolledText("");
    }
    onValueChange?.("");
    setAttachments([]);
    onTyping?.(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      {...getRootProps()}
      className={`p-3 border-t border-border-subtle bg-surface-card transition-colors ${
        isDragActive ? "bg-brand-primary/10 border-brand-primary" : ""
      }`}
    >
      <input {...getInputProps()} />

      {isDragActive && (
        <div className="p-2 mb-2 rounded-xl bg-brand-primary/20 text-brand-primary text-xs text-center font-mono font-semibold animate-pulse">
          Drop screenshot or receipt to attach
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-1.5 rounded-xl bg-surface-elevated border border-border-subtle">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg overflow-hidden border border-border-main bg-surface-card"
            >
              <img
                src={att.url}
                alt={att.fileName}
                className="w-12 h-12 object-cover"
              />
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-500 transition-colors cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-end gap-2">
        <button
          type="button"
          onClick={open}
          className="min-h-10 min-w-10 rounded-xl flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface-elevated transition-colors cursor-pointer shrink-0"
          aria-label="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          rows={1}
          value={currentText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Write your message..."
          className="flex-1 min-h-10 max-h-24 px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs resize-none focus:outline-hidden focus:border-brand-primary transition-colors custom-scrollbar"
        />

        <button
          type="submit"
          disabled={
            isSending || (!currentText.trim() && attachments.length === 0)
          }
          className="min-h-10 min-w-10 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 active:scale-95 shadow-xs shadow-brand-primary/25"
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
