import { Plugin, MarkdownPostProcessorContext } from "obsidian";
import { TkPluginSettings, DEFAULT_SETTINGS, TkSettingTab } from "./settings";
import { TkSuggest } from "./suggest";
import { exec } from "child_process";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { tmpdir, platform } from "os";
import * as localForage from "localforage";
import { createHash } from "crypto";

export default class TkPlugin extends Plugin {
  settings: TkPluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new TkSettingTab(this.app, this));
    this.registerMarkdownCodeBlockProcessor("tk", this.process.bind(this));
    this.registerEditorSuggest(new TkSuggest(this.app));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // ── 工具路径检测 ──

  findTool(name: string): string {
    const os = platform();
    const candidates: string[] = [];
    if (os === "darwin") {
      candidates.push(
        `/Library/TeX/texbin/${name}`,
        `/usr/local/texlive/2026/bin/universal-darwin/${name}`,
        `/usr/local/texlive/2025/bin/universal-darwin/${name}`,
      );
    } else if (os === "linux") {
      candidates.push(`/usr/bin/${name}`);
    } else if (os === "win32") {
      candidates.push(`C:\\texlive\\2026\\bin\\windows\\${name}.exe`);
    }
    for (const p of candidates) {
      if (existsSync(p)) return p;
    }
    return name;
  }

  findLatex(): string {
    if (this.settings.compilerPath) return this.settings.compilerPath;
    return this.findTool("latex");
  }

  findDvisvgm(): string {
    if (this.settings.dvisvgmPath) return this.settings.dvisvgmPath;
    return this.findTool("dvisvgm");
  }

  findGsLib(): string | null {
    if (this.settings.ghostscriptLibPath) return this.settings.ghostscriptLibPath;
    const os = platform();
    if (os === "darwin") {
      for (const p of ["/opt/homebrew/lib/libgs.dylib", "/usr/local/lib/libgs.dylib"]) {
        if (existsSync(p)) return p;
      }
    } else if (os === "linux") {
      for (const p of ["/usr/lib/x86_64-linux-gnu/libgs.so", "/usr/lib/libgs.so"]) {
        if (existsSync(p)) return p;
      }
    } else if (os === "win32") {
      for (const p of ["C:\\Program Files\\gs\\gs10.07.0\\bin\\gsdll64.dll"]) {
        if (existsSync(p)) return p;
      }
    }
    return null;
  }

  findPdflatex(): string {
    if (this.settings.compilerPath) {
      // 用户指定了 compilerPath，尝试推导 pdflatex
      return this.settings.compilerPath.replace(/latex$/, "pdflatex");
    }
    return this.findTool("pdflatex");
  }

  // ── PDF 编译管线 ──

  async compilePDF(source: string, tempDir: string): Promise<string> {
    const texFile = join(tempDir, "doc.tex");
    const pdfFile = join(tempDir, "doc.pdf");
    await fs.writeFile(texFile, source);

    const pdflatex = this.findPdflatex();
    const env = { ...process.env };

    await new Promise<void>((resolve, reject) => {
      exec(
        `"${pdflatex}" -interaction=nonstopmode -halt-on-error -output-directory="${tempDir}" "${texFile}"`,
        { cwd: tempDir, env },
        (err, stdout) => {
          if (err) {
            // pdflatex 首次编译可能因缺少 aux 而报错，重试一次
            reject(new Error(`pdflatex 编译失败:\n${stdout.slice(-800)}`));
          } else {
            resolve();
          }
        },
      );
    });

    // 二次编译解决交叉引用
    await new Promise<void>((resolve, reject) => {
      exec(
        `"${pdflatex}" -interaction=nonstopmode -halt-on-error -output-directory="${tempDir}" "${texFile}"`,
        { cwd: tempDir, env },
        (err) => {
          // 第二次编译即使失败也可能已有可用 PDF
          resolve();
        },
      );
    });

    if (!existsSync(pdfFile)) throw new Error("pdflatex 未生成 PDF 输出");
    return pdfFile;
  }

  // ── PDF 缓存目录 ──

  get pdfCacheDir(): string {
    return join((this.app.vault.adapter as any).basePath, ".obsidian", "plugins", "obsidian-tk", "pdf-cache");
  }

  // ── 缓存 ──

  hash(source: string): string {
    return createHash("md5").update(source).digest("hex");
  }

  // ── 文档结构补全 ──

  wrapSource(source: string): string {
    // 替换非 standalone 文档类，避免 article 等产生空白首页
    // animate/OCG 等需要完整文档类，保留用户指定
    if (/\\documentclass\b/.test(source)) {
      if (/\\animategraphics|\\begin\{animateinline\}|animate/.test(source)) {
        return source; // 保留用户文档类
      }
      return source.replace(
        /\\documentclass(\[[^\]]*\])?\{[^}]*\}/,
        '\\documentclass[tikz,border=10pt]{standalone}',
      );
    }
    if (/\\begin\{document\}/.test(source)) {
      return `\\documentclass[tikz,border=10pt]{standalone}\n${source}`;
    }
    // axis 等 pgfplots 环境需要 tikzpicture 包裹，自动补上
    const pgfEnv = /\\begin\{(axis|semilogxaxis|semilogyaxis|loglogaxis|polaraxis)\b/;
    const hasTikzpicture = /\\begin\{tikzpicture\}/.test(source);
    const inner = (!hasTikzpicture && pgfEnv.test(source))
      ? `\\begin{tikzpicture}\n${source}\n\\end{tikzpicture}`
      : source;
    return [
      `\\documentclass[tikz,border=10pt]{standalone}`,
      `\\usepackage{pgfplots}`,
      `\\pgfplotsset{compat=1.15}`,
      `\\usetikzlibrary{arrows,arrows.meta,calc,decorations,patterns,shapes,positioning,backgrounds,fit,3d,shadings}`,
      `\\begin{document}`,
      inner,
      `\\end{document}`,
    ].join("\n");
  }

  // ── SVG 清理 ──

  cleanSvg(svg: string): string {
    return svg
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/^\s*\n/gm, "");
  }

  // ── 暗色模式颜色反转 ──

  invertColors(svg: string): string {
    if (!this.settings.invertColorsInDarkMode) return svg;
    return svg
      .replace(/(["'])(#000|black)\1/gi, '$1currentColor$1')
      .replace(/(["'])(#fff|white)\1/gi, '$1var(--background-primary)$1');
  }

  // ── 编译管线 ──

  async compile(source: string, tempDir: string): Promise<string[]> {
    const texFile = join(tempDir, "doc.tex");
    const dviFile = join(tempDir, "doc.dvi");
    await fs.writeFile(texFile, source);

    const latex = this.findLatex();
    const dvisvgm = this.findDvisvgm();
    const gsLib = this.findGsLib();
    const env = { ...process.env };

    // Step 1: latex → DVI
    await new Promise<void>((resolve, reject) => {
      exec(
        `"${latex}" -interaction=nonstopmode -halt-on-error -output-directory="${tempDir}" "${texFile}"`,
        { cwd: tempDir, env },
        (err, stdout) => {
          if (err) {
            reject(new Error(`LaTeX 编译失败:\n${stdout.slice(-800)}`));
          } else {
            resolve();
          }
        },
      );
    });

    // Step 2: dvisvgm → SVG (multi-page)
    const libgsArg = gsLib ? ` --libgs="${gsLib}"` : "";
    await new Promise<void>((resolve, reject) => {
      exec(
        `"${dvisvgm}"${libgsArg} --no-fonts -e -p 1- -o "${tempDir}/doc-%p.svg" "${dviFile}"`,
        { cwd: tempDir, env },
        (err, stdout) => {
          if (err) {
            reject(new Error(`dvisvgm 转换失败:\n${stdout.slice(-600)}`));
          } else {
            resolve();
          }
        },
      );
    });

    // Step 3: 收集 SVG 文件
    const files = await fs.readdir(tempDir);
    const svgFiles = files
      .filter((f) => /^doc-\d+\.svg$/.test(f))
      .sort((a, b) => {
        const na = parseInt(a.match(/\d+/)![0]);
        const nb = parseInt(b.match(/\d+/)![0]);
        return na - nb;
      });

    // 收集并过滤空白帧（仅检查实际绘制元素，排除 <g> 等结构标签）
    const hasContent = (svg: string) =>
      /<(path|circle|ellipse|rect|polygon|polyline|line|text|image|use)\b/.test(svg);
    const svgs: string[] = [];
    for (const f of svgFiles) {
      const raw = await fs.readFile(join(tempDir, f), "utf8");
      if (raw.trim() && hasContent(raw)) svgs.push(raw);
    }
    if (svgs.length === 0) throw new Error("dvisvgm 未生成任何 SVG 输出");
    return svgs;
  }

  // ── 代码块处理器 ──

  async process(source: string, el: HTMLElement, _ctx: MarkdownPostProcessorContext) {
    const key = this.hash(source);
    const isPDF = this.settings.outputMode === "pdf";
    const cacheKey = isPDF ? "pdf:" + key : key;

    const container = el.createDiv({ cls: "tk-container" });
    container.setText("正在编译 TikZ 图表…");

    let tempDir: string | null = null;
    try {
      if (isPDF) {
        const cached = await localForage.getItem<Uint8Array>(cacheKey);
        if (cached) {
          container.empty();
          this.renderPDF(container, cached);
          return;
        }
        const tex = this.wrapSource(source);
        tempDir = await fs.mkdtemp(join(tmpdir(), "tkrender-"));
        const pdfPath = await this.compilePDF(tex, tempDir);
        const data = new Uint8Array(await fs.readFile(pdfPath));
        await localForage.setItem(cacheKey, data);
        container.empty();
        this.renderPDF(container, data);
      } else {
        const cached = await localForage.getItem<string[]>(cacheKey);
        if (cached) {
          container.empty();
          this.renderInto(container, cached);
          return;
        }
        const tex = this.wrapSource(source);
        tempDir = await fs.mkdtemp(join(tmpdir(), "tkrender-"));
        const svgs = await this.compile(tex, tempDir);
        const cleaned = svgs.map((s) => this.cleanSvg(s));
        await localForage.setItem(cacheKey, cleaned);
        container.empty();
        this.renderInto(container, cleaned);
      }
    } catch (err) {
      container.empty();
      this.showError(container, err instanceof Error ? err.message : String(err));
    } finally {
      if (tempDir) {
        fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      }
    }
  }

  // ── PDF 渲染 ──

  renderPDF(container: HTMLElement, data: Uint8Array) {
    const blob = new Blob([data.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // 浏览器内嵌 PDF 查看器不支持 JavaScript，故 animate 等需外部打开
    const note = container.createDiv({ cls: "tk-pdf-note" });
    note.setText("💡 PDF 内嵌动画/交互需在外部应用打开");
    const openBtn = note.createEl("button", { text: "在外部应用中打开" });
    openBtn.onclick = async () => {
      const { shell } = require("electron");
      // 将当前 blob 写入临时文件并打开
      const { mkdtemp, writeFile } = require("fs/promises");
      const { join } = require("path");
      const { tmpdir } = require("os");
      const tmp = await mkdtemp(join(tmpdir(), "tkpdf-"));
      const pdfPath = join(tmp, "doc.pdf");
      await writeFile(pdfPath, Buffer.from(data));
      shell.openPath(pdfPath);
    };

    const embed = container.createEl("embed", { cls: "tk-pdf-embed" });
    embed.src = url;
    embed.type = "application/pdf";
  }

  // ── 渲染入口 ──

  renderInto(container: HTMLElement, svgs: string[]) {
    const dark = document.body.classList.contains("theme-dark");

    if (svgs.length === 1) {
      const svg = dark ? this.invertColors(svgs[0]) : svgs[0];
      container.innerHTML = svg;
    } else {
      this.renderAnimated(container, svgs, dark);
    }
  }

  // ── 动画渲染 ──

  renderAnimated(container: HTMLElement, svgs: string[], dark: boolean) {
    const wrapper = container.createDiv({ cls: "tk-frames" });
    // 帧叠加在同一空间，避免布局塌陷
    wrapper.style.display = "grid";
    wrapper.style.gridTemplateAreas = '"stack"';
    const frames: HTMLElement[] = [];

    for (let i = 0; i < svgs.length; i++) {
      const frame = wrapper.createDiv({
        cls: i === 0 ? "tk-frame active" : "tk-frame",
      });
      frame.style.gridArea = "stack";
      const svg = dark ? this.invertColors(svgs[i]) : svgs[i];
      frame.innerHTML = svg;
      frames.push(frame);
    }

    let current = 0;
    let playing = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const frameMs = 800;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      playing = false;
    }

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        const next = (current + 1) % frames.length;
        frames[current].classList.remove("active");
        frames[next].classList.add("active");
        current = next;
        counter.setText(`${next + 1} / ${frames.length}`);
      }, frameMs);
    };

    const stopTimer = () => {
      if (timer) { clearInterval(timer); timer = null; }
    };

    const goTo = (delta: number) => {
      const n = frames.length;
      const next = (((current + delta) % n) + n) % n;
      frames[current].classList.remove("active");
      frames[next].classList.add("active");
      current = next;
      counter.setText(`${next + 1} / ${n}`);
    };

    // 控件条
    const controls = wrapper.createDiv({ cls: "tk-controls" });
    const icon = (d: string) =>
      `<svg viewBox="0 0 16 16"><path d="${d}"/></svg>`;

    const prevBtn = controls.createEl("button");
    prevBtn.innerHTML = icon("M10 3 L5 8 L10 13");
    prevBtn.onclick = () => goTo(-1);

    const playBtn = controls.createEl("button");
    const updateIcon = () => {
      playBtn.innerHTML = playing
        ? icon("M5 3 L5 13")
        : icon("M4 3 L4 13 L12 8 Z");
    };
    updateIcon();
    playBtn.onclick = () => {
      playing = !playing;
      updateIcon();
      playing ? startTimer() : stopTimer();
    };

    const nextBtn = controls.createEl("button");
    nextBtn.innerHTML = icon("M6 3 L11 8 L6 13");
    nextBtn.onclick = () => goTo(1);

    const counter = controls.createSpan({ cls: "tk-frame-counter" });
    counter.setText(`${current + 1} / ${frames.length}`);

    if (playing) startTimer();

    // 键盘控制
    wrapper.tabIndex = 0;
    wrapper.onkeydown = (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goTo(1); }
      else if (e.key === " ") { e.preventDefault(); playBtn.click(); }
    };

    // 容器销毁时停止定时器
    const observer = new MutationObserver(() => {
      if (!wrapper.isConnected) stopTimer();
    });
    observer.observe(wrapper.parentElement!, { childList: true });
  }

  // ── 错误显示 ──

  showError(el: HTMLElement, msg: string) {
    const container = el.createDiv({ cls: "tk-error" });
    const details = container.createEl("details");
    details.createEl("summary", { text: "TikZ 编译失败 — 点击查看详情" });
    details.createEl("pre", { text: msg });
  }
}
