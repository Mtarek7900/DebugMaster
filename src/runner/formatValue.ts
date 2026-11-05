/**
 * Formats a value for expected-versus-actual messages so a Learner can read it:
 * strings are quoted, arrays and objects are expanded, and cycles are marked.
 */
export function formatValue(value: unknown): string {
  return format(value, new Set());
}

const MAX_DEPTH = 6;

function format(value: unknown, seen: Set<object>, depth = 0): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') return Object.is(value, -0) ? '-0' : String(value);
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'function') return `[Function ${value.name || '(anonymous)'}]`;
  if (typeof value === 'symbol') return value.toString();
  if (value === null || typeof value !== 'object') return String(value);

  if (seen.has(value)) return '[Circular]';
  if (value instanceof Date) return `Date(${Number.isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString()})`;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof RegExp) return String(value);
  if (depth >= MAX_DEPTH) return Array.isArray(value) ? '[Array]' : '[Object]';

  seen.add(value);
  try {
    const inner = (v: unknown) => format(v, seen, depth + 1);
    if (Array.isArray(value)) return `[${value.map(inner).join(', ')}]`;
    if (value instanceof Map) {
      return `Map(${value.size}) { ${[...value].map(([k, v]) => `${inner(k)} => ${inner(v)}`).join(', ')} }`;
    }
    if (value instanceof Set) return `Set(${value.size}) { ${[...value].map(inner).join(', ')} }`;

    const entries = Object.entries(value).map(([k, v]) => `${formatKey(k)}: ${inner(v)}`);
    const proto = Object.getPrototypeOf(value);
    const className = proto && proto !== Object.prototype ? proto.constructor?.name : '';
    const body = entries.length ? `{ ${entries.join(', ')} }` : '{}';
    return className ? `${className} ${body}` : body;
  } finally {
    seen.delete(value);
  }
}

function formatKey(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}
