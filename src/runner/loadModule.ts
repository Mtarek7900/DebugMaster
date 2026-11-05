/**
 * Evaluates a Challenge source file (Broken Code, Reference Fix or the Learner's
 * edit) and returns its named exports.
 *
 * Challenge code is written as an ES module with named exports only. Rather than
 * relying on dynamic `import()` of a blob/data URL (which behaves differently in
 * browsers, workers and Node), the `export` keywords are rewritten so the code can
 * run as a strict-mode function body that returns its exports. This keeps the
 * module semantics that matter to Challenges (strict mode, own scope) identical in
 * the browser worker and in Node tests.
 *
 * `globals` (such as a captured `console`) are visible to the code as plain variables.
 *
 * Supported: `export function`, `export async function`, `export function*`,
 * `export class`, `export const|let|var name`, and `export { a, b as c }`.
 */
export type ModuleExports = Record<string, unknown>;

const EXPORT_FUNCTION = /^(\s*)export\s+((?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*))/gm;
const EXPORT_DECLARATION = /^(\s*)export\s+((?:class|const|let|var)\s+([A-Za-z_$][\w$]*))/gm;
const EXPORT_LIST = /^(\s*)export\s*\{([^}]*)\}\s*;?/gm;

export function loadModule(source: string, globals: Record<string, unknown> = {}): ModuleExports {
  const exported: Array<[exportName: string, localName: string]> = [];

  const stripExport = (_match: string, indent: string, declaration: string, name: string) => {
    exported.push([name, name]);
    return indent + declaration;
  };

  const rewritten = source
    .replace(EXPORT_FUNCTION, stripExport)
    .replace(EXPORT_DECLARATION, stripExport)
    .replace(EXPORT_LIST, (_match, indent: string, list: string) => {
      for (const part of list.split(',')) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const [local, alias] = trimmed.split(/\s+as\s+/);
        exported.push([(alias ?? local).trim(), local.trim()]);
      }
      return indent;
    });

  const returned = exported.map(([name, local]) => `${JSON.stringify(name)}: ${local}`).join(', ');
  // `globals` are parameters of an outer function, so they shadow the real globals of the same
  // name, while the code runs in an inner function where it may still declare those names itself.
  const body = `"use strict";\nreturn (function () {\n${rewritten}\n;return { ${returned} };\n})();`;
  const names = Object.keys(globals);
  return new Function(...names, body)(...names.map((n) => globals[n])) as ModuleExports;
}
