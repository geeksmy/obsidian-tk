import {
  EditorSuggest, EditorPosition, EditorSuggestContext,
  EditorSuggestTriggerInfo, TFile,
} from "obsidian";

interface Suggestion { label: string; apply: string }
const s = (l: string, a: string): Suggestion => ({ label: l, apply: a });

// ═══════════════════════════════════════════════
// 1. 路径绘图命令
// ═══════════════════════════════════════════════
const drawCmds: Suggestion[] = [
  s("draw  绘制路径", "\\draw[] () ;"),
  s("fill  填充区域", "\\fill[] () ;"),
  s("filldraw  填充并描边", "\\filldraw[] ();"),
  s("shade  渐变填充", "\\shade[] ();"),
  s("shadedraw  渐变并描边", "\\shadedraw[] ();"),
  s("pattern  图案填充", "\\pattern[] ();"),
  s("path  不可见路径", "\\path[] ();"),
  s("clip  裁剪", "\\clip[] ();"),
  s("useasboundingbox  设为边界", "\\useasboundingbox () ;"),
  s("plot  函数曲线", "\\draw[] plot (${x},${y});"),
];

// ═══════════════════════════════════════════════
// 2. 节点/坐标
// ═══════════════════════════════════════════════
const nodeCmds: Suggestion[] = [
  s("node  放置节点", "\\node[] at () {};"),
  s("coordinate  定义坐标", "\\coordinate () at ();"),
  s("matrix  节点矩阵", "\\matrix[] {\n  \\node {}; & \\node {}; \\\\\n};"),
  s("label  节点标签", "\\node[label={${}}:{}] at () {};"),
  s("pin  节点引脚", "\\node[pin={${}}:{}] at () {};"),
];

// ═══════════════════════════════════════════════
// 3. 环境
// ═══════════════════════════════════════════════
const envCmds: Suggestion[] = [
  s("begin  开始环境", "\\begin{}"),
  s("end  结束环境", "\\end{}"),
  s("tikzpicture  绘图环境", "\\begin{tikzpicture}[]\n  \n\\end{tikzpicture}"),
  s("scope  局部作用域", "\\begin{scope}[]\n  \n\\end{scope}"),
  s("tikzcd  交换图", "\\begin{tikzcd}\n  \n\\end{tikzcd}"),
  s("frame  beamer帧", "\\begin{frame}{}\n  \n\\end{frame}"),
];

// ═══════════════════════════════════════════════
// 4. pgfplots 命令
// ═══════════════════════════════════════════════
const plotCmds: Suggestion[] = [
  s("axis  线性坐标轴", "\\begin{axis}[]\n  \n\\end{axis}"),
  s("semilogxaxis  x对数轴", "\\begin{semilogxaxis}[]\n  \n\\end{semilogxaxis}"),
  s("semilogyaxis  y对数轴", "\\begin{semilogyaxis}[]\n  \n\\end{semilogyaxis}"),
  s("loglogaxis  双对数轴", "\\begin{loglogaxis}[]\n  \n\\end{loglogaxis}"),
  s("polaraxis  极坐标轴", "\\begin{polaraxis}[]\n  \n\\end{polaraxis}"),
  s("ternaryaxis  三元相图", "\\begin{ternaryaxis}[]\n  \n\\end{ternaryaxis}"),
  s("groupplot  子图组", "\\begin{groupplot}[group style={group size=2 by 2}]\n  \\nextgroupplot \\addplot {};\n\\end{groupplot}"),
  s("addplot  数据图", "\\addplot[] coordinates {};"),
  s("addplot+  数据图(带样式)", "\\addplot+[] coordinates {};"),
  s("addplot3  3D数据图", "\\addplot3[] coordinates {};"),
  s("addplot3+  3D图(带样式)", "\\addplot3+[] coordinates {};"),
  s("addplot table  表格数据", "\\addplot[] table {};"),
  s("addplot expression  函数表达式", "\\addplot[] {};"),
  s("addplot file  文件数据", "\\addplot[] file {};"),
  s("addlegendentry  图例条目", "\\addlegendentry{}"),
  s("legend  图例", "\\legend{}"),
  s("pgfplotsset  全局设置", "\\pgfplotsset{}"),
  s("pgfplotstableread  读入数据表", "\\pgfplotstableread{}{\\}"),
  s("pgfplotstabletypeset  排版数据表", "\\pgfplotstabletypeset[]{\\}"),
  s("pgfplotsinvokeforeach  循环绘图", "\\pgfplotsinvokeforeach{}{\\addplot {};}"),
];

// ═══════════════════════════════════════════════
// 5. 样式/配置
// ═══════════════════════════════════════════════
const styleCmds: Suggestion[] = [
  s("tikzset  全局样式", "\\tikzset{}"),
  s("tikzstyle  样式定义(旧)", "\\tikzstyle{}"),
  s("definecolor  定义颜色", "\\definecolor{}{rgb}{}"),
  s("colorlet  派生颜色", "\\colorlet{}{}"),
  s("usetikzlibrary  加载库", "\\usetikzlibrary{}"),
  s("usepackage  加载包", "\\usepackage{}"),
  s("pgfplotsset   pgfplots设置", "\\pgfplotsset{}"),
  s("pgfkeys  通用键值设置", "\\pgfkeys{}"),
  s("pgfdeclarelayer  声明图层", "\\pgfdeclarelayer{}"),
  s("pgfsetlayers  设置图层顺序", "\\pgfsetlayers{}"),
  s("pgfdeclareshape  声明形状", "\\pgfdeclareshape{}{}"),
  s("usepgflibrary  加载PGF库", "\\usepgflibrary{}"),
];

// ═══════════════════════════════════════════════
// 6. 循环/流程控制
// ═══════════════════════════════════════════════
const flowCmds: Suggestion[] = [
  s("foreach  循环", "\\foreach \\ in {} { };"),
  s("pgfmathsetmacro  数学宏", "\\pgfmathsetmacro{\\}{}"),
  s("pgfmathtruncatemacro  整数宏", "\\pgfmathtruncatemacro{\\}{}"),
  s("pgfmathparse  解析数学表达式", "\\pgfmathparse{}"),
  s("pgfmathresult  获取数学结果", "\\pgfmathresult"),
  s("pgfmathsetlength  长度宏", "\\pgfmathsetlength{\\}{}"),
  s("pgfmathsetcount  计数宏", "\\pgfmathsetcount{\\}{}"),
  s("ifdim  TeX长度判断", "\\ifdim ... \\fi"),
  s("ifnum  TeX整数判断", "\\ifnum ... \\fi"),
];

// ═══════════════════════════════════════════════
// 7. beamer 覆盖
// ═══════════════════════════════════════════════
const beamerCmds: Suggestion[] = [
  s("onslide  指定帧显示", "\\onslide<>{}"),
  s("only  仅指定帧", "\\only<>{}"),
  s("visible  可见(占位)", "\\visible<>{}"),
  s("invisible  不可见(占位)", "\\invisible<>{}"),
  s("alt  交替显示", "\\alt<>{}{}"),
  s("temporal  时序显示", "\\temporal<>{}{}{}"),
  s("pause  暂停逐项", "\\pause"),
  s("uncover  逐步揭开", "\\uncover<>{}"),
];

// ═══════════════════════════════════════════════
// 8. 外部化/图片
// ═══════════════════════════════════════════════
const extCmds: Suggestion[] = [
  s("tikzexternalize  启用外部化", "\\tikzexternalize[]"),
  s("tikzsetnextfilename  指定外部文件名", "\\tikzsetnextfilename{}"),
  s("includegraphics  插入图片", "\\includegraphics[]{}"),
  s("pgfimage  插入PG图片", "\\pgfimage[]{}"),
];

// ═══════════════════════════════════════════════
// 9. 透明度/混合
// ═══════════════════════════════════════════════
const blendCmds: Suggestion[] = [
  s("transparency group  透明度组", "\\begin{scope}[transparency group=knockout]\n  \n\\end{scope}"),
  s("blend group  混合组", "\\begin{scope}[blend group=screen]\n  \n\\end{scope}"),
];

// ── 合并所有命令 ──
const allCmds: Suggestion[] = [
  ...drawCmds, ...nodeCmds, ...envCmds, ...plotCmds,
  ...styleCmds, ...flowCmds, ...beamerCmds, ...extCmds, ...blendCmds,
];

// ═══════════════════════════════════════════════
// 花括号环境列表
// ═══════════════════════════════════════════════
const braceEnvs = [
  "tikzpicture", "axis", "scope", "tikzcd", "matrix",
  "semilogxaxis", "semilogyaxis", "loglogaxis", "polaraxis",
  "groupplot", "ternaryaxis", "document", "frame",
  "minipage", "figure", "table", "center",
];

// ═══════════════════════════════════════════════
// 花括号库名
// ═══════════════════════════════════════════════
const braceLibs = [
  "arrows","arrows.meta","calc","decorations","patterns","shapes",
  "positioning","backgrounds","fit","3d","shadings","through",
  "intersections","angles","quotes","mindmap","trees","graphs",
  "automata","circuits","matrix","chains","scopes","er","petri",
  "spy","folding","turtle","lindenmayer","calendar","math",
  "plothandlers","decorations.pathmorphing",
  "decorations.pathreplacing","decorations.markings",
  "decorations.text","decorations.shapes",
  "decorations.fractals","decorations.footprints",
  "shapes.geometric","shapes.arrows","shapes.multipart",
  "shapes.misc","shapes.symbols","shapes.callouts",
  "patterns.meta","fadings","perspective","external",
  "overlay-beamer-styles","babel","svg.path","datavisualization",
  "datavisualization.formats.functions",
];

// ═══════════════════════════════════════════════
// 花括号包名
// ═══════════════════════════════════════════════
const bracePkgs = [
  "pgfplots","amsmath","amssymb","mathrsfs","xcolor",
  "graphicx","geometry","hyperref","booktabs","siunitx",
  "tikz-3dplot","circuitikz","pgfplotstable","subcaption",
  "tkz-euclide","tkz-fct","pgf-pie","hf-tikz",
  "standalone","animate","multido","fp","calc",
];

// ═══════════════════════════════════════════════
// 花括号图例
// ═══════════════════════════════════════════════
const braceLegends = [
  "$f(x)$","$g(x)$","$h(x)$","数据点","拟合曲线",
  "理论值","实验值","上限","下限","均值","样本",
];

// ═══════════════════════════════════════════════
// [] 方括号选项
// ═══════════════════════════════════════════════
const opts: Suggestion[] = [
  // 线型
  s("ultra thin  极细", "ultra thin"), s("very thin  很细", "very thin"),
  s("thin  细线", "thin"), s("semithick  中粗", "semithick"),
  s("thick  粗线", "thick"), s("very thick  很粗", "very thick"),
  s("ultra thick  极粗", "ultra thick"),
  s("solid  实线", "solid"), s("dashed  虚线", "dashed"),
  s("dotted  点线", "dotted"), s("dashdotted  点划线", "dashdotted"),
  s("densely dashed  密虚线", "densely dashed"),
  s("loosely dashed  疏虚线", "loosely dashed"),
  s("densely dotted  密点线", "densely dotted"),
  s("loosely dotted  疏点线", "loosely dotted"),
  s("densely dashdotted  密点划线", "densely dashdotted"),
  s("loosely dashdotted  疏点划线", "loosely dashdotted"),
  s("rounded corners  圆角", "rounded corners"),
  s("sharp corners  尖角", "sharp corners"),
  s("line cap=  线端样式", "line cap="),
  s("line join=  线接样式", "line join="),
  s("miter limit=  斜接限制", "miter limit="),
  s("double  双线", "double"),
  s("double distance=  双线间距", "double distance="),

  // 箭头 (基本)
  s("->  正向箭头", "->"), s("<-  反向箭头", "<-"),
  s("<->  双向箭头", "<->"), s("->>  双正向", "->>"),
  s("<<->  双反问双向", "<<->>"), s("o->  空心起点", "o->"),
  s("-stealth  stealth", "-stealth"), s("-latex  latex", "-latex"),
  s("-to  to", "-to"), s("-|>  |箭头", "-|>"),
  s("-Straight Barb", "-Straight Barb"),
  s("-Circle", "-Circle"), s("-Diamond", "-Diamond"),
  s("stealth-stealth  双stealth", "stealth-stealth"),
  s("latex-latex  双latex", "latex-latex"),

  // 箭头提示选项
  s(">=stealth  stealth", ">=stealth"),
  s(">=latex  latex", ">=latex"),
  s(">=triangle 45  三角45", ">=triangle 45"),
  s(">=triangle 60  三角60", ">=triangle 60"),
  s(">=angle 90  直角", ">=angle 90"),
  s(">=Straight Barb  Barb", ">=Straight Barb"),
  s(">=Circle  圆形", ">=Circle"),
  s(">=Diamond  菱形", ">=Diamond"),
  s(">=to  to", ">=to"),
  s(">=|  竖线", ">=|"),
  s("shorten >=  缩短起点", "shorten >="),
  s("shorten <=  缩短终点", "shorten <="),

  // 颜色
  s("red  红", "red"), s("blue  蓝", "blue"),
  s("green  绿", "green"), s("yellow  黄", "yellow"),
  s("orange  橙", "orange"), s("purple  紫", "purple"),
  s("pink  粉", "pink"), s("brown  棕", "brown"),
  s("black  黑", "black"), s("white  白", "white"),
  s("gray  灰", "gray"), s("darkgray  深灰", "darkgray"),
  s("lightgray  浅灰", "lightgray"),
  s("cyan  青", "cyan"), s("magenta  品红", "magenta"),
  s("lime  柠檬绿", "lime"), s("olive  橄榄绿", "olive"),
  s("teal  蓝绿", "teal"), s("violet  紫罗兰", "violet"),
  s("color=  颜色", "color="), s("draw=  描边色", "draw="),
  s("fill=  填充色", "fill="), s("text=  文字色", "text="),
  s("pattern color=  图案色", "pattern color="),

  // 透明度
  s("opacity=  透明度", "opacity="),
  s("fill opacity=  填充透明度", "fill opacity="),
  s("draw opacity=  描边透明度", "draw opacity="),
  s("text opacity=  文字透明度", "text opacity="),

  // 线宽
  s("line width=  线宽", "line width="),
  s("ultra thin  极细(重复)", "ultra thin"),

  // 缩放/旋转/变换
  s("scale=  缩放", "scale="), s("xscale=  x缩放", "xscale="),
  s("yscale=  y缩放", "yscale="), s("rotate=  旋转", "rotate="),
  s("xshift=  x位移", "xshift="), s("yshift=  y位移", "yshift="),
  s("shift=  位移", "shift="),
  s("transform shape  变换节点形状", "transform shape"),
  s("transform canvas  变换画布", "transform canvas={}"),

  // 锚点/位置
  s("below  下方", "below"), s("above  上方", "above"),
  s("left  左方", "left"), s("right  右方", "right"),
  s("below left  左下", "below left"), s("below right  右下", "below right"),
  s("above left  左上", "above left"), s("above right  右上", "above right"),
  s("anchor=  锚点", "anchor="), s("align=  对齐", "align="),
  s("text width=  文本宽度", "text width="),
  s("text height=  文本高度", "text height="),
  s("text depth=  文本深度", "text depth="),
  s("minimum width=  最小宽度", "minimum width="),
  s("minimum height=  最小高度", "minimum height="),
  s("minimum size=  最小尺寸", "minimum size="),
  s("inner sep=  内边距", "inner sep="),
  s("outer sep=  外边距", "outer sep="),
  s("node distance=  节点间距", "node distance="),

  // 形状
  s("rectangle  矩形", "rectangle"), s("circle  圆形", "circle"),
  s("ellipse  椭圆", "ellipse"), s("diamond  菱形", "diamond"),
  s("regular polygon  正多边形", "regular polygon"),
  s("regular polygon sides=  边数", "regular polygon sides="),
  s("star  星形", "star"), s("star points=  星形角数", "star points="),
  s("trapezium  梯形", "trapezium"), s("semicircle  半圆", "semicircle"),
  s("isosceles triangle  等腰三角形", "isosceles triangle"),
  s("kite  风筝形", "kite"), s("dart  镖形", "dart"),
  s("rounded rectangle  圆角矩形", "rounded rectangle"),
  s("chamfered rectangle  切角矩形", "chamfered rectangle"),
  s("cloud  云形", "cloud"), s("cylinder  圆柱", "cylinder"),
  s("forbidden sign  禁止符号", "forbidden sign"),
  s("cross out  叉号", "cross out"), s("strike out  删除线", "strike out"),
  s("single arrow  单箭头", "single arrow"), s("double arrow  双箭头", "double arrow"),
  s("arrow box  箭头盒", "arrow box"),
  s("signal  信号", "signal"), s("tape  磁带", "tape"),

  // 记忆/浮层
  s("remember picture  跨图坐标记忆", "remember picture"),
  s("overlay  不占空间浮层", "overlay"),

  // 填充规则
  s("even odd rule  奇偶填充", "even odd rule"),
  s("nonzero rule  非零填充", "nonzero rule"),
  s("clip  裁剪", "clip"),

  // pgfplots 轴
  s("axis lines=middle  轴居中", "axis lines=middle"),
  s("axis lines=center  轴居中", "axis lines=center"),
  s("axis lines=left  轴在左", "axis lines=left"),
  s("axis lines=box  轴为框", "axis lines=box"),
  s("axis lines=none  无轴", "axis lines=none"),
  s("axis x line=  x轴位置", "axis x line="),
  s("axis y line=  y轴位置", "axis y line="),
  s("axis equal  等比例轴", "axis equal"),
  s("axis equal image  等比例图像", "axis equal image"),
  s("scale only axis  仅缩放轴", "scale only axis"),
  s("hide axis  隐藏轴", "hide axis"),
  s("hide x axis  隐藏x轴", "hide x axis"),
  s("hide y axis  隐藏y轴", "hide y axis"),

  // pgfplots 范围
  s("xmin=  x最小值", "xmin="), s("xmax=  x最大值", "xmax="),
  s("ymin=  y最小值", "ymin="), s("ymax=  y最大值", "ymax="),
  s("zmin=  z最小值", "zmin="), s("zmax=  z最大值", "zmax="),
  s("restrict x to domain=  限制x域", "restrict x to domain="),
  s("restrict y to domain=  限制y域", "restrict y to domain="),
  s("enlarge x limits=  扩展x限", "enlarge x limits="),
  s("enlarge y limits=  扩展y限", "enlarge y limits="),
  s("enlargelimits=  扩展范围", "enlargelimits="),

  // pgfplots 刻度/标签
  s("xtick=  x刻度", "xtick="), s("ytick=  y刻度", "ytick="),
  s("ztick=  z刻度", "ztick="),
  s("xticklabels=  x刻度标签", "xticklabels="),
  s("yticklabels=  y刻度标签", "yticklabels="),
  s("xtick distance=  x刻度间距", "xtick distance="),
  s("minor xtick=  小x刻度", "minor xtick="),
  s("minor ytick=  小y刻度", "minor ytick="),
  s("xlabel=  x标签", "xlabel="), s("ylabel=  y标签", "ylabel="),
  s("zlabel=  z标签", "zlabel="),
  s("title=  标题", "title="),
  s("xlabel style=  x标签样式", "xlabel style={}"),
  s("ylabel style=  y标签样式", "ylabel style={}"),

  // pgfplots 网格/图例
  s("grid=both  双方向网格", "grid=both"),
  s("grid=major  主网格", "grid=major"),
  s("grid=minor  次网格", "grid=minor"),
  s("grid=none  无网格", "grid=none"),
  s("xmajorgrids  x主网格", "xmajorgrids"),
  s("ymajorgrids  y主网格", "ymajorgrids"),
  s("xminorgrids  x次网格", "xminorgrids"),
  s("yminorgrids  y次网格", "yminorgrids"),
  s("legend pos=  图例位置", "legend pos="),
  s("legend style=  图例样式", "legend style={}"),
  s("legend entries=  图例条目", "legend entries={}"),
  s("legend to name=  图例外置名", "legend to name="),
  s("colorbar  颜色条", "colorbar"),
  s("colorbar style=  颜色条样式", "colorbar style={}"),

  // pgfplots 绘图选项
  s("domain=  定义域", "domain="), s("samples=  采样数", "samples="),
  s("samples y=  y采样数", "samples y="),
  s("variable=  变量名", "variable="),
  s("smooth  平滑曲线", "smooth"),
  s("only marks  仅标记", "only marks"),
  s("sharp plot  尖折线", "sharp plot"),
  s("const plot  阶梯图", "const plot"),
  s("const plot mark left  阶梯图(左)", "const plot mark left"),
  s("const plot mark right  阶梯图(右)", "const plot mark right"),
  s("jump mark left  跳变左标", "jump mark left"),
  s("ybar  竖柱", "ybar"), s("xbar  横柱", "xbar"),
  s("ybar interval  区间竖柱", "ybar interval"),
  s("bar width=  柱宽", "bar width="),
  s("bar shift=  柱偏移", "bar shift="),
  s("mark=  标记样式", "mark="),
  s("mark size=  标记大小", "mark size="),
  s("mark repeat=  标记重复", "mark repeat="),
  s("mark phase=  标记相位", "mark phase="),
  s("error bars/  误差棒", "error bars/"),
  s("forget plot  遗忘曲线", "forget plot"),
  s("name path=  命名路径", "name path="),
  s("fill between  区域填充", "fill between"),
  s("stack plots=  堆叠图", "stack plots="),
  s("area style  面积图样式", "area style"),
  s("no markers  无标记", "no markers"),

  // pgfplots 3D
  s("view=  3D视角", "view={}{}"),
  s("surf  曲面", "surf"), s("mesh  网格线", "mesh"),
  s("surf 曲面", "surf"), s("shader=  着色器", "shader="),
  s("faceted color  面着色", "faceted color"),
  s("colormap=  颜色映射", "colormap="),
  s("point meta=  元数据", "point meta="),
  s("contour  等高线", "contour"),
  s("patch  补丁", "patch"),
  s("patch type=  补丁类型", "patch type="),
  s("quiver  向量场", "quiver"),
];

// ═══════════════════════════════════════════════
// () 坐标/路径操作符
// ═══════════════════════════════════════════════
const coordItems: Suggestion[] = [
  s("0,0  原点", "0,0"), s("1,0  单位x", "1,0"), s("0,1  单位y", "0,1"),
  s("x,y  笛卡尔", "x,y"),
  s("30:1  极坐标", "30:1"), s("++1,0  相对偏移", "++1,0"),
  s("+1,0  临时偏移", "+1,0"), s("(A)  节点名", "A"),
  s("A.north  锚点北", "A.north"), s("A.south  锚点南", "A.south"),
  s("A.east  锚点东", "A.east"), s("A.west  锚点西", "A.west"),
  s("A.center  锚点中", "A.center"),
  s("A.north west  锚点西北", "A.north west"),
  s("A.north east  锚点东北", "A.north east"),
  s("A.south west  锚点西南", "A.south west"),
  s("A.south east  锚点东南", "A.south east"),
  // 路径操作
  s("--  直线", "-- "), s("|-  直角(先竖)", "|- "), s("-|  直角(先横)", "-| "),
  s("circle  圆", "circle "), s("ellipse  椭圆", "ellipse "),
  s("rectangle  矩形", "rectangle "), s("grid  网格", "grid "),
  s("arc  圆弧", "arc ()"), s("parabola  抛物线", "parabola "),
  s("sin  正弦段", "sin "), s("cos  余弦段", "cos "),
  s("controls  贝塞尔控制", ".. controls () and () .. "),
  s("edge  边连接", "edge[] ()"), s("to  路径连接", "to[] ()"),
  s("node  路径上节点", "node[] {}"),
  s("coordinate  路径上坐标", "coordinate ()"),
  s("cycle  闭合回原点", "cycle"),
  s("plot  函数绘图", "plot ({\\x},{\\y})"),
  s("..  曲线连接", ".. "),
  s("tension=  曲线张力", "tension="),
  s("out=  出角度", "out="), s("in=  入角度", "in="),
  s("looseness=  松散度", "looseness="),
  s("bend left  左弯", "bend left"), s("bend right  右弯", "bend right"),
  s("bend angle=  弯角", "bend angle="),
  s("distance=  距离", "distance="),
];

// ═══════════════════════════════════════════════
// 结构模板
// ═══════════════════════════════════════════════
const templates: Suggestion[] = [
  s("tikzpicture  空绘图", "\\begin{tikzpicture}[]\n  \n\\end{tikzpicture}"),
  s("axis  坐标轴+数据", "\\begin{tikzpicture}\n\\begin{axis}[]\n  \\addplot[] coordinates {};\n\\end{axis}\n\\end{tikzpicture}"),
  s("f(x)  函数曲线", "\\begin{tikzpicture}\n\\begin{axis}[\n  axis lines=middle,\n  xmin=-5,xmax=5,\n  ymin=-5,ymax=5,\n  grid=both,\n]\n  \\addplot[thick,blue] {x^2};\n\\end{axis}\n\\end{tikzpicture}"),
  s("3D  三维曲面", "\\begin{tikzpicture}\n\\begin{axis}[view={30}{20},colormap/viridis]\n  \\addplot3[surf,domain=-3:3,samples=30] {x^2-y^2};\n\\end{axis}\n\\end{tikzpicture}"),
  s("scatter  散点图", "\\begin{tikzpicture}\n\\begin{axis}[only marks,mark=*]\n  \\addplot coordinates {};\n\\end{axis}\n\\end{tikzpicture}"),
  s("bar  柱状图", "\\begin{tikzpicture}\n\\begin{axis}[ybar,bar width=0.5cm]\n  \\addplot coordinates {};\n\\end{axis}\n\\end{tikzpicture}"),
  s("multi  多曲线+图例", "\\begin{tikzpicture}\n\\begin{axis}[legend pos=north west]\n  \\addplot[blue] {}; \\addlegendentry{}\n  \\addplot[red,dashed] {}; \\addlegendentry{}\n\\end{axis}\n\\end{tikzpicture}"),
  s("fill between  曲线间填充", "\\begin{tikzpicture}\n\\begin{axis}\n  \\addplot[name path=A,blue] {};\n  \\addplot[name path=B,red] {};\n  \\addplot[gray,opacity=0.3] fill between[of=A and B];\n\\end{axis}\n\\end{tikzpicture}"),
  s("parametric  参数方程", "\\begin{tikzpicture}\n\\begin{axis}[axis lines=middle]\n  \\addplot[thick,blue,domain=0:360,samples=100] ({cos(x)},{sin(x)});\n\\end{axis}\n\\end{tikzpicture}"),
  s("polar  极坐标", "\\begin{tikzpicture}\n\\begin{polaraxis}[grid=both]\n  \\addplot[thick,blue,domain=0:360,samples=100] {1+cos(x)};\n\\end{polaraxis}\n\\end{tikzpicture}"),
  s("groupplot  2x2子图", "\\begin{tikzpicture}\n\\begin{groupplot}[group style={group size=2 by 2}]\n  \\nextgroupplot \\addplot {};\n  \\nextgroupplot \\addplot {};\n  \\nextgroupplot \\addplot {};\n  \\nextgroupplot \\addplot {};\n\\end{groupplot}\n\\end{tikzpicture}"),
  s("quiver  向量场", "\\begin{tikzpicture}\n\\begin{axis}\n  \\addplot3[quiver] coordinates {};\n\\end{axis}\n\\end{tikzpicture}"),
  s("contour  等高线", "\\begin{tikzpicture}\n\\begin{axis}[view={0}{90}]\n  \\addplot3[contour gnuplot] {x^2+y^2};\n\\end{axis}\n\\end{tikzpicture}"),
  s("tree  树形图", "\\begin{tikzpicture}[level 1/.style={sibling distance=3cm},every node/.style={draw,rounded corners}]\n  \\node {根} child { node {} } child { node {} };\n\\end{tikzpicture}"),
  s("flow  流程图", "\\begin{tikzpicture}[node distance=2cm,block/.style={draw,minimum width=2cm,minimum height=1cm},arrow/.style={->,thick}]\n  \\node[block] (A) {};\n  \\node[block,below of=A] (B) {};\n  \\draw[arrow] (A) -- (B);\n\\end{tikzpicture}"),
  s("mindmap  思维导图", "\\begin{tikzpicture}[mindmap,concept color=blue!50,every node/.style={concept}]\n  \\node {主题} child[grow=30] { node {} } child[grow=150] { node {} } child[grow=270] { node {} };\n\\end{tikzpicture}"),
  s("automaton  自动机", "\\begin{tikzpicture}[shorten >=1pt,node distance=2cm,on grid,auto]\n  \\node[state,initial]   (A) {};\n  \\node[state,accepting] (B) [right of=A] {};\n  \\path[->] (A) edge node {} (B);\n\\end{tikzpicture}"),
  s("circuit  电路图", "\\begin{tikzpicture}[circuit ee IEC]\n  \\node[contact] (A) {};\n  \\node[contact] (B) [right of=A] {};\n  \\draw (A) to [resistor] (B);\n\\end{tikzpicture}"),
  s("beamer  逐帧", "\\begin{tikzpicture}\n  \\onslide<1->{ \\draw (0,0) circle (1); }\n  \\onslide<2->{ \\draw (2,0) circle (1); }\n  \\onslide<3->{ \\draw (4,0) circle (1); }\n\\end{tikzpicture}"),
];

// ═══════════════════════════════════════════════
// 辅助函数
// ═══════════════════════════════════════════════

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
  limit = 30;

  inTkBlock(editor: any, cursor: EditorPosition): boolean {
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
    if (bm) return trigger(cursor, cursor.ch - bm[0].length, bm[0]);

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
        if (/\\legend$/.test(pre))      return trigger(cursor, br + 1, partial);
      }
    }

    // 3. [] 方括号内（同一行）
    {
      const br = nearestOpen(toCursor, "[", "]");
      if (br >= 0 && !toCursor.slice(br).includes("\n"))
        return trigger(cursor, br + 1, toCursor.slice(br + 1).trim());
    }

    // 4. () 圆括号内（同一行）
    {
      const br = nearestOpen(toCursor, "(", ")");
      if (br >= 0 && !toCursor.slice(br).includes("\n"))
        return trigger(cursor, br + 1, toCursor.slice(br + 1).trim());
    }

    // 5. 行首/空块 → 模板
    {
      const wm = toCursor.match(/([a-zA-Z][a-zA-Z0-9_]*)$/);
      if (wm) {
        if (toCursor.slice(0, wm.index!).trim() === "")
          return trigger(cursor, cursor.ch - wm[0].length, wm[0]);
      } else if (toCursor.trim() === "") {
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
    if (q.startsWith("\\"))
      return allCmds.filter(c => c.label.toLowerCase().startsWith(q.slice(1)));

    // 花括号内
    if (/\\begin$/.test(before))       return braceEnvs.filter(n => n.startsWith(q)).map(n => s(n, n));
    if (/\\usetikzlibrary$/.test(before)) return braceLibs.filter(n => n.startsWith(q)).map(n => s(n, n));
    if (/\\usepackage$/.test(before))  return bracePkgs.filter(n => n.startsWith(q)).map(n => s(n, n));
    if (/\\addlegendentry$/.test(before)) return braceLegends.filter(n => n.startsWith(q)).map(n => s(n, n));
    if (/\\legend$/.test(before))      return braceLegends.filter(n => n.startsWith(q)).map(n => s(n, n));

    // 方括号内
    if (nearestOpen(before, "[", "]") >= 0)
      return opts.filter(o => o.label.toLowerCase().startsWith(q));

    // 圆括号内
    if (nearestOpen(before, "(", ")") >= 0)
      return coordItems.filter(o => o.label.toLowerCase().startsWith(q));

    // 模板（仅行首）
    const fullLine = ctx.editor.getLine(ctx.start.line);
    const bfr = fullLine.slice(0, ctx.start.ch);
    if (bfr.trim() === "")
      return templates.filter(t => t.label.toLowerCase().startsWith(q));

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
