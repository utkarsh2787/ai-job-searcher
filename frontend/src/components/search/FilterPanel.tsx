'use client';

import { useState } from 'react';
import { SearchFacets, SearchParams } from '@/types/api.types';

interface FilterPanelProps {
  facets:   SearchFacets | undefined;
  filters:  SearchParams;
  onChange: (updated: Partial<SearchParams>) => void;
}

export function FilterPanel({ facets, filters, onChange }: FilterPanelProps) {
  const [salaryInput, setSalaryInput] = useState(filters.salaryMin ? String(filters.salaryMin) : '');

  function applySalary() {
    const val = parseInt(salaryInput.replace(/[^0-9]/g, ''), 10);
    onChange({ salaryMin: isNaN(val) ? undefined : val });
  }

  return (
    <aside className="space-y-5">

      {/* Remote toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <div
          onClick={() => onChange({ remote: filters.remote ? undefined : true })}
          style={{
            width: 36, height: 20, borderRadius: 10, cursor: 'pointer', position: 'relative',
            background: filters.remote ? 'var(--cyan-dim)' : 'var(--bg-deep)',
            border: `1px solid ${filters.remote ? 'var(--cyan)' : 'var(--border)'}`,
            transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          <div style={{
            position: 'absolute', top: 2,
            left: filters.remote ? 18 : 2,
            width: 14, height: 14, borderRadius: '50%',
            background: filters.remote ? 'var(--cyan)' : 'var(--text-3)',
            transition: 'left 0.2s',
          }} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Remote only</span>
      </label>

      {/* Min salary */}
      <FilterSection title="Min Salary">
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            placeholder="e.g. 150000"
            value={salaryInput}
            onChange={(e) => setSalaryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySalary()}
            className="input-dark"
            style={{ flex: 1, fontSize: 12, padding: '5px 8px' }}
          />
          <button
            onClick={applySalary}
            className="btn-primary"
            style={{ fontSize: 11, padding: '5px 10px', whiteSpace: 'nowrap' }}
          >
            Set
          </button>
        </div>
        {filters.salaryMin && (
          <button
            onClick={() => { setSalaryInput(''); onChange({ salaryMin: undefined }); }}
            style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}
            className="hover:text-white transition-colors"
          >
            Clear salary filter
          </button>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {[80000, 120000, 150000, 200000].map((val) => (
            <button
              key={val}
              onClick={() => { setSalaryInput(String(val)); onChange({ salaryMin: val }); }}
              className="tag-dark"
              style={filters.salaryMin === val ? {
                background: 'rgba(0,212,255,0.15)', borderColor: 'rgba(0,212,255,0.4)', color: 'var(--cyan)',
              } : undefined}
            >
              ${(val / 1000).toFixed(0)}k+
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Date posted */}
      <FilterSection title="Date Posted">
        {[
          { label: 'Last 24 hours', value: 1 },
          { label: 'Last 7 days',   value: 7 },
          { label: 'Last 30 days',  value: 30 },
        ].map(({ label, value }) => (
          <FilterRadio
            key={value}
            label={label}
            checked={filters.postedWithin === value}
            onChange={() => onChange({ postedWithin: filters.postedWithin === value ? undefined : value })}
          />
        ))}
      </FilterSection>

      {/* Seniority */}
      {(facets?.seniority ?? []).length > 0 && (
        <FilterSection title="Seniority">
          {(facets?.seniority ?? []).map((b) => (
            <FilterCheckbox
              key={b.key}
              label={b.key}
              count={b.count}
              checked={filters.seniority === b.key}
              onChange={() => onChange({ seniority: filters.seniority === b.key ? undefined : b.key })}
            />
          ))}
        </FilterSection>
      )}

      {/* Job type */}
      {(facets?.jobTypes ?? []).length > 0 && (
        <FilterSection title="Job Type">
          {(facets?.jobTypes ?? []).map((b) => (
            <FilterCheckbox
              key={b.key}
              label={b.key.replace('_', ' ')}
              count={b.count}
              checked={filters.jobType === b.key}
              onChange={() => onChange({ jobType: filters.jobType === b.key ? undefined : b.key })}
            />
          ))}
        </FilterSection>
      )}

      {/* Skills */}
      {(facets?.skills ?? []).length > 0 && (
        <FilterSection title="Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {(facets?.skills ?? []).slice(0, 12).map((b) => {
              const activeSkills = filters.skills ? filters.skills.split(',') : [];
              const isActive = activeSkills.includes(b.key);
              return (
                <button
                  key={b.key}
                  onClick={() => {
                    const next = isActive
                      ? activeSkills.filter((s) => s !== b.key)
                      : [...activeSkills, b.key];
                    onChange({ skills: next.length > 0 ? next.join(',') : undefined });
                  }}
                  className="tag-dark"
                  style={isActive ? {
                    background: 'rgba(0,212,255,0.15)', borderColor: 'rgba(0,212,255,0.4)', color: 'var(--cyan)',
                  } : undefined}
                >
                  {b.key} <span style={{ opacity: 0.5 }}>{b.count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Locations */}
      {(facets?.locations ?? []).length > 0 && (
        <FilterSection title="Location">
          {(facets?.locations ?? []).slice(0, 8).map((b) => (
            <FilterCheckbox
              key={b.key}
              label={b.key}
              count={b.count}
              checked={filters.location === b.key}
              onChange={() => onChange({ location: filters.location === b.key ? undefined : b.key })}
            />
          ))}
        </FilterSection>
      )}

      {/* Clear all */}
      {hasActiveFilters(filters) && (
        <button
          onClick={() => {
            setSalaryInput('');
            onChange({
              remote: undefined, seniority: undefined, jobType: undefined,
              skills: undefined, location: undefined, postedWithin: undefined,
              salaryMin: undefined, salaryMax: undefined,
            });
          }}
          style={{ fontSize: 12, color: 'var(--cyan)', width: '100%', textAlign: 'left' }}
          className="hover:opacity-70 transition-opacity"
        >
          ✕ Clear all filters
        </button>
      )}
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{
        fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, count, checked, onChange }: {
  label: string; count: number; checked: boolean; onChange: () => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div
          onClick={onChange}
          style={{
            width: 14, height: 14, borderRadius: 3, flexShrink: 0, cursor: 'pointer',
            background: checked ? 'var(--cyan-dim)' : 'var(--bg-deep)',
            border: `1px solid ${checked ? 'var(--cyan)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, border-color 0.15s',
          }}
        >
          {checked && <svg style={{ width: 9, height: 9, color: 'white' }} viewBox="0 0 12 12" fill="currentColor">
            <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>}
        </div>
        <span style={{ fontSize: 12, color: checked ? 'var(--text-1)' : 'var(--text-2)', textTransform: 'capitalize' }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{count}</span>
    </label>
  );
}

function FilterRadio({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
      <div
        onClick={onChange}
        style={{
          width: 14, height: 14, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
          background: checked ? 'var(--cyan-dim)' : 'var(--bg-deep)',
          border: `1px solid ${checked ? 'var(--cyan)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        {checked && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--cyan)' }} />}
      </div>
      <span style={{ fontSize: 12, color: checked ? 'var(--text-1)' : 'var(--text-2)' }}>{label}</span>
    </label>
  );
}

function hasActiveFilters(f: SearchParams): boolean {
  return !!(f.remote || f.seniority || f.jobType || f.skills || f.location || f.postedWithin || f.salaryMin);
}
