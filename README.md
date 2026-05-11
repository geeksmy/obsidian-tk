# obsidian-tk

使用本地 LaTeX 工具链在 Obsidian 中渲染 TikZ 图表。支持 pgfplots、动图、暗色模式，提供 IDE 级自动补全。

## 功能

- **本地编译**：latex → DVI → dvisvgm + libgs → SVG，可使用系统所有 LaTeX 宏包
- **智能包裹**：裸 `\draw`/`\node`/`\fill`/`\foreach` 等命令自动包裹 `tikzpicture` 环境
- **库自动加载**：根据内容自动加载 mindmap、automata、circuits、fillbetween、polar、cd 等库
- **动图支持**：beamer 覆盖 (`\onslide`/`\pause`/`\only`) 自动切 beamer 文档类，多页 SVG 轮播，悬停显示播放控件
- **暗色模式**：自动反转 SVG 颜色（黑→currentColor，白→背景色）
- **智能补全**：`\` 命令、`{}` 环境名、`[]` 样式选项、`()` 坐标、空行弹出 18 种结构模板
- **自动缓存**：MD5 哈希 + IndexedDB，源码不变不重新编译

## 依赖

| 工具 | 用途 | macOS 默认路径 |
|------|------|---------------|
| LaTeX (texlive) | 编译 TikZ 为 DVI | `/Library/TeX/texbin/latex` |
| dvisvgm | DVI 转 SVG | `/Library/TeX/texbin/dvisvgm` |
| Ghostscript | PostScript specials (pgfplots 必需) | `/opt/homebrew/lib/libgs.dylib` |

安装 TeX Live：`brew install --cask mactex` 或 <https://tug.org/mactex/>  
安装 Ghostscript：`brew install ghostscript`

## 安装

1. 下载 [最新 Release](https://github.com/geeksmy/obsidian-tk/releases) 中的 `main.js`、`manifest.json`、`styles.css`
2. 放入 `{仓库}/.obsidian/plugins/obsidian-tk/`
3. 重启 Obsidian，设置 → 第三方插件 → 启用 "Tk Render"

## 用法

### 基本绘图

<img src="images/basic.svg" alt="basic" width="360">

````markdown
```tk
\draw[->, thick, blue] (0,0) -- (3,2) node[right] {$\vec{v}$};
\draw[->, thick, red] (0,0) -- (3,-1) node[right] {$\vec{w}$};
```
````

插件自动包裹 `\begin{tikzpicture}...\end{tikzpicture}`，无需手动写。

### 函数图像

<img src="images/function.svg" alt="function" width="420">

````markdown
```tk
\begin{axis}[
    axis lines=middle,
    xmin=-5, xmax=5, ymin=-5, ymax=5,
    grid=both,
    title={$f(x)=x^2-4$},
]
    \addplot[thick, blue] {x^2 - 4};
\end{axis}
```
````

> `title` 中含有 `=` 时需要用 `{}` 括起来，如 `title={$f(x)=x^2$}`。

### GeoGebra 导出

直接粘贴 GeoGebra 的 TikZ 导出代码，插件自动替换 `article` 类为 `standalone`，避免空白页。

### 动图 (beamer 逐帧)

<img src="images/animation.svg" alt="animation" width="420">

````markdown
```tk
\begin{tikzpicture}
    \onslide<1->{ \draw (0,0) circle (1); }
    \onslide<2->{ \draw (2,0) circle (1); }
    \onslide<3->{ \draw (4,0) circle (1); }
\end{tikzpicture}
```
````

支持 `\onslide`、`\only`、`\pause`、`\visible` 等 beamer 覆盖命令，自动检测并切换 beamer 文档类。

### 更多图形类型

| 类型 | 示例 |
|------|------|
| 路径绘图 | `\draw` / `\fill` / `\shade` / `\pattern` |
| 节点坐标 | `\node` / `\coordinate` / `\pin` |
| 循环生成 | `\foreach \x in {...} { }` |
| pgfplots 2D | 函数曲线 / 散点 / 柱状图 / 极坐标 / 对数轴 / fill between / 参数方程 |
| pgfplots 3D | 曲面 (surf) / 网格 (mesh) / 空间曲线 |
| 结构图 | 树形图 / 流程图 / 思维导图 / 自动机 / 电路图 |
| 交换图 | tikzcd |
| 动图 | beamer 覆盖 (`\onslide` / `\pause` / `\only`) |

## 自动补全

在 `tk` 代码块内：

| 触发方式 | 补全内容 |
|----------|----------|
| `\` + 字母 | 命令（`\draw`、`\begin`、`\addplot`、`\foreach` …） |
| `\begin{` | 环境名（`tikzpicture`、`axis`、`scope`、`tikzcd` …） |
| `\usetikzlibrary{` | 库名（`arrows`、`calc`、`patterns`、`mindmap` …） |
| `\usepackage{` | 包名（`pgfplots`、`amsmath`、`circuitikz` …） |
| `\addlegendentry{` | 常用图例文本 |
| `[...]` 方括号内 | 样式选项（`thick`、`->`、`red`、`xmin=`、`opacity=` …） |
| `(...)` 圆括号内 | 坐标/路径（`0,0`、`--`、`++`、`arc`、`node` …） |
| 空行输入 | 18 种结构模板（函数图、3D 曲面、散点图、流程图、树形图…） |

## 设置

| 选项 | 说明 |
|------|------|
| LaTeX 编译器路径 | 留空自动检测 |
| dvisvgm 路径 | 留空自动检测 |
| Ghostscript 库路径 | 留空自动检测 |
| 暗色模式颜色反转 | 默认开启 |
| 清除缓存 | 手动清除所有缓存的 SVG |

## 许可

MIT
