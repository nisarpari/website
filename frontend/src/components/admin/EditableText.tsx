'use client';

import { useState, useRef, useEffect } from 'react';
import { useAdmin } from '@/context';

interface EditableTextProps {
  value: string;
  configKey: string; // e.g., "customTexts.heroTitle" or "banners.hero.title"
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  onUpdate?: (newValue: string) => void;
  multiline?: boolean;
}

export function EditableText({
  value,
  configKey,
  as: Tag = 'span',
  className = '',
  onUpdate,
  multiline = false
}: EditableTextProps) {
  const { isAdmin, editMode, token, refreshConfig } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    setText(value);
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!token) return;

    try {
      const [section, ...rest] = configKey.split('.');
      const key = rest.join('.');

      const res = await fetch(`${API_BASE}/api/admin/config/${section}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: inputValue })
      });

      if (res.ok) {
        setText(inputValue);
        onUpdate?.(inputValue);
        await refreshConfig();
      }
    } catch (error) {
      console.error('Failed to save text:', error);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setInputValue(text);
      setIsEditing(false);
    }
  };

  // If not admin or not in edit mode, render normal text
  if (!isAdmin || !editMode) {
    return <Tag className={className}>{text}</Tag>;
  }

  // Admin edit mode
  if (isEditing) {
    return (
      <div className="relative inline-block">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={`${className} bg-gold/10 border-2 border-gold rounded px-2 py-1 focus:outline-none min-w-[200px]`}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={`${className} bg-gold/10 border-2 border-gold rounded px-2 py-1 focus:outline-none min-w-[100px]`}
          />
        )}
        <div className="absolute -bottom-6 left-0 text-[10px] text-bella-500">
          Press Enter to save, Esc to cancel
        </div>
      </div>
    );
  }

  return (
    <Tag
      className={`${className} cursor-pointer hover:bg-gold/10 hover:outline hover:outline-2 hover:outline-gold hover:outline-dashed rounded relative group`}
      onClick={() => setIsEditing(true)}
    >
      {text}
      {/* Edit indicator */}
      <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </span>
    </Tag>
  );
}
