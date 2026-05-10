import {
  EditorSuggest,
  EditorPosition,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from "obsidian";

interface Suggestion {
  label: string;
  apply: string;
}

// ── 补全数据 ──
const cmds: Suggestion[] = [
  s("begin  开始环境", "\\begin{}"), s("end  结束环境", "\\end{}"),
  s("tikzpicture  TikZ绘图", "\\begin{tikzpicture}[]\n  \n\\end{tikzpicture}"),
  s("axis  坐标轴", "\\begin{axis}[]\n  \n\\end{axis}"),
  s("scope  作用域", "\\begin{scope}[]\n  \n\\end{scope}"),
  s("draw  绘制", "\\draw[] () ;"), s("fill  填充", "\\fill[] () ;"),
  s("filldraw  填充描边", "\\filldraw[] ();"),
  s("node  节点", "\\node[] at () {};"), s("coordinate  坐标", "\\coordinate () at ();"),
  s("path  路径", "\\path[] ();"), s("clip  裁剪", "\\clip[] ();"),
  s("foreach  循环", "\\foreach \\ in {} { };"), s("shade  渐变", "\\shade[] ();"),
  s("addplot  数据图", "\\addplot[] coordinates {};"),
  s("addplot3  3D图", "\\addplot3[] coordinates {};"),
  s("addlegendentry  图例", "\\addlegendentry{}"),
  s("usetikzlibrary  加载库", "\\usetikzlibrary{}"),
  s("usepackage  加载包", "\\usepackage{}"),
  s("pgfplotsset  设置", "\\pgfplotsset{}"),
  s("definecolor  定义颜色", "\\definecolor{}{rgb}{}"),
  s("onslide  指定帧", "\\onslide<>{}"), s("only  仅指定帧", "\\only<>{}"),
  s("pause  暂停", "\\pause"),
];

const braceEnvs = ["tikzpicture","axis","scope","tikzcd","matrix",
  "semilogxaxis","semilogyaxis","loglogaxis","polaraxis","groupplot"];
const braceLibs = ["arrows","arrows.meta","calc","decorations","patterns","shapes",
  "positioning","backgrounds","fit","3d","shadings","through","intersections",
  "angles","quotes","mindmap","trees","graphs","automata","circuits","matrix"];
const bracePkgs = ["pgfplots","amsmath","amssymb","mathrsfs","xcolor","graphicx",
  "geometry","hyperref","booktabs","circuitikz"];
const braceLegends = ["$f(x)$","$g(x)$","数据点","拟合曲线","理论值","实验值"];

const opts: Suggestion[] = [
  s("-> 箭头", "->"), s("<-> 双向", "<->"),
  s("thick 粗线", "thick"), s("dashed 虚线", "dashed"), s("dotted 点线", "dotted"),
  s("red 红", "red"), s("blue 蓝", "blue"), s("green 绿", "green"),
  s("color= 颜色", "color="), s("fill= 填充", "fill="),
  s("opacity= 透明度", "opacity="), s("scale= 缩放", "scale="),
  s("below 下方", "below"), s("above 上方", "above"),
  s("axis lines=middle 轴居中", "axis lines=middle"),
  s("grid=both 网格", "grid=both"),
  s("xmin= x最小", "xmin="), s("xmax= x最大", "xmax="),
  s("xlabel= x标签", "xlabel="), s("ylabel= y标签", "ylabel="),
  s("view= 3D视角", "view={}{}"), s("surf 曲面", "surf"),
];

const templates: Suggestion[] = [
  s("tikzpicture 空绘图", "\\begin{tikzpicture}[]\n  \n\\end{tikzpicture}"),
  s("axis 坐标轴+数据", "\\begin{tikzpicture}\n\\begin{axis}[]\n  \\addplot[] coordinates {};\n\\end{axis}\n\\end{tikzpicture}"),
  s("f(x) 函数曲线", "\\begin{tikzpicture}\n\\begin{axis}[\n  axis lines=middle,\n  xmin=-5,xmax=5,\n  ymin=-5,ymax=5,\n  grid=both,\n]\n  \\addplot[thick,blue] {x^2};\n\\end{axis}\n\\end{tikzpicture}"),
  s("3D 三维曲面", "\\begin{tikzpicture}\n\\begin{axis}[view={30}{20},colormap/viridis]\n  \\addplot3[surf,domain=-3:3,samples=30] {x^2-y^2};\n\\end{axis}\n\\end{tikzpicture}"),
  s("scatter 散点图", "\\begin{tikzpicture}\n\\begin{axis}[only marks,mark=*]\n  \\addplot coordinates {};\n\\end{axis}\n\\end{tikzpicture}"),
  s("bar 柱状图", "\\begin{tikzpicture}\n\\begin{axis}[ybar,bar width=0.5cm]\n  \\addplot coordinates {};\n\\end{axis}\n\\end{tikzpicture}"),
  s("multi 多曲线+图例", "\\begin{tikzpicture}\n\\begin{axis}[legend pos=north west]\n  \\addplot[blue] {}; \\addlegendentry{}\n  \\addplot[red,dashed] {}; \\addlegendentry{}\n\\end{axis}\n\\end{tikzpicture}"),
  s("fill between 填充", "\\begin{tikzpicture}\n\\begin{axis}\n  \\addplot[name path=A,blue] {};\n  \\addplot[name path=B,red] {};\n  \\addplot[gray,opacity=0.3] fill between[of=A and B];\n\\end{axis}\n\\end{tikzpicture}"),
  s("parametric 参数方程", "\\begin{tikzpicture}\n\\begin{axis}[axis lines=middle]\n  \\addplot[thick,blue,domain=0:360,samples=100] ({cos(x)},{sin(x)});\n\\end{axis}\n\\end{tikzpicture}"),
  s("polar 极坐标", "\\begin{tikzpicture}\n\\begin{polaraxis}[grid=both]\n  \\addplot[thick,blue,domain=0:360,samples=100] {1+cos(x)};\n\\end{polaraxis}\n\\end{tikzpicture}"),
  s("groupplot 2x2子图", "\\begin{tikzpicture}\n\\begin{groupplot}[group style={group size=2 by 2}]\n  \\nextgroupplot \\addplot {};\n  \\nextgroupplot \\addplot {};\n  \\nextgroupplot \\addplot {};\n  \\nextgroupplot \\addplot {};\n\\end{groupplot}\n\\end{tikzpicture}"),
  s("tree 树形图", "\\begin{tikzpicture}[level 1/.style={sibling distance=3cm},every node/.style={draw,rounded corners}]\n  \\node {根} child { node {} } child { node {} };\n\\end{tikzpicture}"),
  s("flow 流程图", "\\begin{tikzpicture}[node distance=2cm,block/.style={draw,minimum width=2cm,minimum height=1cm},arrow/.style={->,thick}]\n  \\node[block] (A) {};\n  \\node[block,below of=A] (B) {};\n  \\draw[arrow] (A) -- (B);\n\\end{tikzpicture}"),
  s("mindmap 思维导图", "\\begin{tikzpicture}[mindmap,concept color=blue!50,every node/.style={concept}]\n  \\node {主题} child[grow=30] { node {} } child[grow=150] { node {} } child[grow=270] { node {} };\n\\end{tikzpicture}"),
  s("beamer 逐帧", "\\begin{tikzpicture}\n  \\onslide<1->{ \\draw (0,0) circle (1); }\n  \\onslide<2->{ \\draw (2,0) circle (1); }\n  \\onslide<3->{ \\draw (4,0) circle (1); }\n\\end{tikzpicture}"),
];

// ── 辅助 ──
function s(label: string, apply: string): Suggestion { return { label, apply }; }

function nearestOpen(s: string, open: string, close: string): number {
  let d = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === close) d++;
    else if (s[i] === open) { if (d === 0) return i; d--; }
  }
  return -1;
}

function trigger(cursor: EditorPosition, startCh: number, query: string): EditorSuggestTriggerInfo {
  return { start: { line: cursor.line, ch: startCh }, end: cursor, query };
}

export class TkSuggest extends EditorSuggest<Suggestion> {
  limit = 20;

  /** 检查光标是否在 ```tk 代码块内 */
  inTkBlock(editor: any, cursor: EditorPosition): boolean {
    // 向上扫描行，检测围栏代码块
    for (let i = cursor.line; i >= 0; i--) {
      const line = editor.getLine(i).trim();
      if (line.startsWith("```tk")) return true;
      if (line.startsWith("```") && !line.startsWith("```tk")) return false;
    }
    return false;
  }

  onTrigger(cursor: EditorPosition, editor: any, _file: TFile): EditorSuggestTriggerInfo | null {
    if (!this.inTkBlock(editor, cursor)) return null;

    const line = editor.getLine(cursor.line);
    const toCursor = line.slice(0, cursor.ch);

    // 1. 反斜杠命令
    const bm = toCursor.match(/\\[a-zA-Z]*$/);
    if (bm) {
      return trigger(cursor, cursor.ch - bm[0].length, bm[0]);
    }

    // 2. {} 花括号内
    {
      const br = nearestOpen(toCursor, "{", "}");
      if (br >= 0) {
        const pre = toCursor.slice(Math.max(0, br - 40), br);
        const partial = toCursor.slice(br + 1);
        if (/\\begin$/.test(pre))       return trigger(cursor, br + 1, partial);
        if (/\\usetikzlibrary$/.test(pre)) return trigger(cursor, br + 1, partial);
        if (/\\usepackage$/.test(pre))  return trigger(cursor, br + 1, partial);
        if (/\\addlegendentry$/.test(pre)) return trigger(cursor, br + 1, partial);
      }
    }

    // 3. [] 方括号内（同一行）
    {
      const br = nearestOpen(toCursor, "[", "]");
      if (br >= 0 && !toCursor.slice(br).includes("\n")) {
        return trigger(cursor, br + 1, toCursor.slice(br + 1).trim());
      }
    }

    // 4. () 圆括号内（同一行）
    {
      const br = nearestOpen(toCursor, "(", ")");
      if (br >= 0 && !toCursor.slice(br).includes("\n")) {
        return trigger(cursor, br + 1, toCursor.slice(br + 1).trim());
      }
    }

    // 5. 行首/空块 → 结构模板
    {
      const wm = toCursor.match(/([a-zA-Z][a-zA-Z0-9_]*)$/);
      if (wm) {
        const beforeWord = toCursor.slice(0, wm.index!);
        if (beforeWord.trim() === "") {
          return trigger(cursor, cursor.ch - wm[0].length, wm[0]);
        }
      } else if (toCursor.trim() === "") {
        // 空行，任意输入都触发
        const anyMatch = toCursor.match(/(\S*)$/);
        if (anyMatch) return trigger(cursor, cursor.ch - anyMatch[0].length, anyMatch[0]);
      }
    }

    return null;
  }

  getSuggestions(ctx: EditorSuggestContext): Suggestion[] {
    const q = ctx.query.toLowerCase();
    const line = ctx.editor.getLine(ctx.start.line);
    const before = line.slice(0, ctx.start.ch).trim();

    // 反斜杠命令
    if (q.startsWith("\\")) {
      return cmds.filter(c => c.label.toLowerCase().startsWith(q.slice(1)));
    }

    // 花括号内
    if (/\\begin$/.test(before))       return braceEnvs.filter(n => n.startsWith(q)).map(sn);
    if (/\\usetikzlibrary$/.test(before)) return braceLibs.filter(n => n.startsWith(q)).map(sn);
    if (/\\usepackage$/.test(before))  return bracePkgs.filter(n => n.startsWith(q)).map(sn);
    if (/\\addlegendentry$/.test(before)) return braceLegends.filter(n => n.startsWith(q)).map(sn);

    // 方括号内
    {
      const whole = ctx.editor.getLine(ctx.start.line);
      const bfr = whole.slice(0, ctx.start.ch);
      if (nearestOpen(bfr, "[", "]") >= 0) return opts.filter(o => o.label.toLowerCase().startsWith(q));
    }

    // 圆括号内
    {
      const whole = ctx.editor.getLine(ctx.start.line);
      const bfr = whole.slice(0, ctx.start.ch);
      if (nearestOpen(bfr, "(", ")") >= 0) {
        return [
          s("0,0 原点", "0,0"), s("x,y 笛卡尔", "x,y"), s("-- 直线", "--"),
          s("++ 相对", "++"), s("30:1 极坐标", "30:1"),
        ].filter(o => o.label.toLowerCase().startsWith(q));
      }
    }

    // 模板（仅行首或空块）
    {
      const line = ctx.editor.getLine(ctx.start.line);
      const bfr = line.slice(0, ctx.start.ch);
      if (bfr.trim() === "" || /[\n\r]/.test(bfr.slice(-1))) {
        return templates.filter(t => t.label.toLowerCase().startsWith(q));
      }
    }

    return [];
  }

  renderSuggestion(sug: Suggestion, el: HTMLElement): void {
    el.createDiv({ text: sug.label });
  }

  selectSuggestion(sug: Suggestion, _evt: any): void {
    const ctx = this.context;
    if (!ctx) return;
    ctx.editor.replaceRange(sug.apply, ctx.start, ctx.end);
    this.close();
  }
}

function sn(n: string): Suggestion { return { label: n, apply: n }; }
