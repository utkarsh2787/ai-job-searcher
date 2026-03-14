'use client';

import { useState, FormEvent } from 'react';

interface SearchBarProps {
  initialValue?: string;
  onSearch:  (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ initialValue = '', onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg style={{ height: 18, width: 18, color: 'var(--text-3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search jobs, skills, companies..."
          className="input-dark w-full pl-10 pr-10 py-3 text-sm"
        />
        {value && (
          <button
            type="button"
            onClick={() => { setValue(''); onSearch(''); }}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
            className="hover:text-white transition-colors"
          >
            <svg style={{ height: 15, width: 15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
