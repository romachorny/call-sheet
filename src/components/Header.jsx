import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm tracking-tight">CS</span>
          <span className="font-heading text-[15px] font-semibold tracking-tight">CALL SHEET</span>
        </Link>
        <a
          href="https://genvidpro.com"
          target="_blank"
          rel="noopener noreferrer"
          className="no-print inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          GenVidPro
        </a>
      </div>
    </header>
  );
}