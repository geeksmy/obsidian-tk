# obsidian-tk

使用本地 LaTeX 工具链在 Obsidian 中渲染 TikZ 图表。支持 pgfplots、动图、暗色模式，提供 IDE 级自动补全。

## 功能

- **双输出模式**：SVG（内联矢量、动图、暗色适配）| PDF（完整 LaTeX：animate、OCG、表单、中文）
- **动图支持**：多页 SVG 自动轮播，悬停显示播放控件（◀ ▶ ⏸ 帧计数），支持键盘 ← → 空格
- **暗色模式**：SVG 模式自动反转颜色（黑→currentColor，白→背景色）
- **智能补全**：`\` 命令、`{}` 环境名、`[]` 样式选项、`()` 坐标、空行弹出 20 种结构模板
- **自动缓存**：MD5 哈希 + IndexedDB，源码不变不重新编译
- **~400 项补全**：按 TikZ 手册全量覆盖命令、选项、环境、库名

## 依赖

| 工具 | 用途 | macOS 默认路径 | 模式 |
|------|------|---------------|------|
| LaTeX (texlive) | 编译 TikZ 为 DVI | `/Library/TeX/texbin/latex` | SVG |
| dvisvgm | DVI 转 SVG | `/Library/TeX/texbin/dvisvgm` | SVG |
| Ghostscript | PostScript specials (pgfplots 必需) | `/opt/homebrew/lib/libgs.dylib` | SVG |
| pdflatex (texlive) | 编译 TikZ 为 PDF | `/Library/TeX/texbin/pdflatex` | PDF |

安装 TeX Live：`brew install --cask mactex` 或 <https://tug.org/mactex/>  
安装 Ghostscript：`brew install ghostscript`

### SVG vs PDF 模式

| 特性 | SVG | PDF |
|------|-----|-----|
| 静态 TikZ 图形 | ✓ | ✓ |
| pgfplots 图表 | ✓ | ✓ |
| beamer 逐帧动画 | ✓ | ✓ |
| 暗色模式适配 | ✓ | ✗ |
| `animate` 动画包 | ✗ | ✓ |
| OCG 交互图层 | ✗ | ✓ |
| 表单/按钮 | ✗ | ✓ |
| 中文字体 | 转路径 | 原生嵌入 |
| `\includegraphics` | ✗ | ✓ |

在插件设置中切换输出模式。

## 安装

1. 下载 [最新 Release](https://github.com/geeksmy/obsidian-tk/releases) 中的 `main.js`、`manifest.json`、`styles.css`
2. 放入 `{仓库}/.obsidian/plugins/obsidian-tk/`
3. 重启 Obsidian，设置 → 第三方插件 → 启用 "Tk Render"

## 用法

````markdown
```tk
\draw[->, thick, blue] (0,0) -- (3,2) node[right] {$\vec{v}$};
\draw[->, thick, red] (0,0) -- (3,-1) node[right] {$\vec{w}$};
```
````

### 函数图像

````markdown
```tk
\begin{axis}[
    axis lines=middle,
    xmin=-5, xmax=5,
    ymin=-5, ymax=5,
    grid=both,
]
    \addplot[thick, blue] {x^2 - 4};
\end{axis}
```
````

### GeoGebra 导出

直接粘贴 GeoGebra 的 TikZ 导出代码，插件自动替换 `article`/`beamer` 类为 `standalone`，避免空白页。

### 动图 (beamer 逐帧)

````markdown
```tk
\begin{tikzpicture}
    \onslide<1->{ \draw (0,0) circle (1); }
    \onslide<2->{ \draw (2,0) circle (1); }
    \onslide<3->{ \draw (4,0) circle (1); }
\end{tikzpicture}
```
````

## 自动补全

在 `tk` 代码块内：

| 触发方式 | 补全内容 |
|----------|----------|
| `\` + 字母 | 命令（`\draw`、`\begin`、`\addplot` …） |
| `\begin{` | 环境名（`tikzpicture`、`axis`、`scope` …） |
| `\usetikzlibrary{` | 库名（`arrows`、`calc`、`patterns` …） |
| `\addlegendentry{` | 常用图例文本 |
| `[...]` 方括号内 | 样式选项（`thick`、`->`、`red`、`xmin=` …） |
| `(...)` 圆括号内 | 坐标/路径（`0,0`、`--`、`++`、`arc` …） |
| 空行输入 | 15 种结构模板（函数图、3D 曲面、流程图…），继续输入字母过滤 |

## 设置

| 选项 | 说明 |
|------|------|
| 输出模式 | SVG（默认）或 PDF |
| LaTeX 编译器路径 | 留空自动检测 |
| dvisvgm 路径 | 留空自动检测 |
| Ghostscript 库路径 | 留空自动检测 |
| 暗色模式颜色反转 | 默认开启（仅 SVG 模式） |
| 清除缓存 | 手动清除所有缓存的编译结果 |

## 许可

MIT
