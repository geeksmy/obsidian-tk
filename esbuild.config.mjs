import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const banner = `/*
 * Tk Render - Obsidian TikZ 渲染插件
 * 此文件由 esbuild 自动生成，请勿手动编辑
 */
`;

const prod = process.argv[2] === "production";

esbuild.build({
  banner: { js: banner },
  entryPoints: ["main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/closebrackets",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/comment",
    "@codemirror/fold",
    "@codemirror/gutter",
    "@codemirror/highlight",
    "@codemirror/history",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/matchbrackets",
    "@codemirror/panel",
    "@codemirror/rangeset",
    "@codemirror/rectangular-selection",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/stream-parser",
    "@codemirror/text",
    "@codemirror/tooltip",
    "@codemirror/view",
    "fs/promises",
    "child_process",
    "crypto",
    "os",
    "path",
    ...builtins,
  ],
  format: "cjs",
  target: "es2016",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
}).catch(() => process.exit(1));
