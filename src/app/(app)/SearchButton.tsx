"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Target, Image as ImageIcon, ListChecks, FolderOpen } from "lucide-react";
import { searchAll, type SearchResult } from "./searchActions";

const KIND_META = {
  opportunity: { label: "Opportunities", icon: Target },
  project: { label: "Projects", icon: ImageIcon },
  task: { label: "Tasks", icon: ListChecks },
  asset: { label: "Assets", icon: FolderOpen },
} as const;

export function SearchButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [active, setActive] = useState(0);

  function open() {
    dialogRef.current?.showModal();
  }
  function close() {
    dialogRef.current?.close();
  }

  // Cmd/Ctrl+K opens search from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dialogRef.current?.showModal();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced search; a stale response never overwrites a newer one.
  useEffect(() => {
    let cancelled = false;
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await searchAll(query);
        if (!cancelled) {
          setResults(r);
          setSearched(true);
          setActive(0);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setSearched(true);
        }
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  function go(r: SearchResult) {
    close();
    setQuery("");
    router.push(r.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  const kinds = (["opportunity", "project", "task", "asset"] as const).filter((k) => results.some((r) => r.kind === k));

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="mx-3 mb-4 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-sm text-neutral-500 shadow-[0_0_0_1px_rgba(55,53,47,0.1)] hover:text-neutral-800"
      >
        <Search size={15} strokeWidth={2} className="shrink-0" />
        <span className="flex-1 text-left">Search</span>
        <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-600 max-md:hidden">⌘K</kbd>
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && close()}
        onClose={() => setQuery("")}
        className="mx-auto mt-[12vh] mb-auto w-[min(34rem,calc(100vw-2rem))] rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-[0_8px_30px_rgba(15,15,15,0.18)] backdrop:bg-black/30"
      >
        <div className="flex items-center gap-2 border-b border-neutral-200 px-4">
          <Search size={16} strokeWidth={2} className="shrink-0 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-label="Search opportunities, projects, tasks and assets"
            placeholder="Search opportunities, projects, tasks, assets"
            className="w-full py-3.5 text-sm outline-none placeholder:text-neutral-500"
          />
        </div>
        <div id="search-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {query.trim().length < 2 && (
            <p className="px-2 py-6 text-center text-sm text-neutral-500">Type at least two letters.</p>
          )}
          {searched && results.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-neutral-500">Nothing found for &ldquo;{query.trim()}&rdquo;.</p>
          )}
          {kinds.map((k) => {
            const { label, icon: Icon } = KIND_META[k];
            return (
              <div key={k} className="mb-1">
                <p className="px-2 pt-2 pb-1 text-xs font-medium text-neutral-500">{label}</p>
                {results.map((r, i) =>
                  r.kind !== k ? null : (
                    <button
                      key={r.kind + r.id}
                      type="button"
                      role="option"
                      aria-selected={i === active}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(r)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left ${
                        i === active ? "bg-blue-50" : ""
                      }`}
                    >
                      <Icon size={15} strokeWidth={2} className="shrink-0 text-neutral-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-neutral-900">{r.title}</span>
                        <span className="block truncate text-xs text-neutral-500">{r.subtitle}</span>
                      </span>
                    </button>
                  ),
                )}
              </div>
            );
          })}
        </div>
      </dialog>
    </>
  );
}
