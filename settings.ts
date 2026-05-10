import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import TkPlugin from "./main";
import * as localForage from "localforage";

export interface TkPluginSettings {
  compilerPath: string;
  dvisvgmPath: string;
  ghostscriptLibPath: string;
  mupdfPath: string;
  invertColorsInDarkMode: boolean;
  outputMode: "svg" | "pdf";
}

export const DEFAULT_SETTINGS: TkPluginSettings = {
  compilerPath: "",
  dvisvgmPath: "",
  ghostscriptLibPath: "",
  mupdfPath: "",
  invertColorsInDarkMode: true,
  outputMode: "svg",
};

export class TkSettingTab extends PluginSettingTab {
  plugin: TkPlugin;

  constructor(app: App, plugin: TkPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    try {
      localForage.config({ name: "TkRender", storeName: "svgCache" });
    } catch (_) {}
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Tk Render 设置" });

    new Setting(containerEl)
      .setName("LaTeX 编译器路径")
      .setDesc("latex 可执行文件的路径。留空则自动检测。")
      .addText((text) =>
        text
          .setPlaceholder("自动检测")
          .setValue(this.plugin.settings.compilerPath)
          .onChange(async (value) => {
            this.plugin.settings.compilerPath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("dvisvgm 路径")
      .setDesc("dvisvgm 可执行文件的路径。留空则自动检测。")
      .addText((text) =>
        text
          .setPlaceholder("自动检测")
          .setValue(this.plugin.settings.dvisvgmPath)
          .onChange(async (value) => {
            this.plugin.settings.dvisvgmPath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Ghostscript 库路径")
      .setDesc("Ghostscript 共享库路径（macOS: libgs.dylib, Linux: libgs.so, Windows: gsdll64.dll）。pgfplots 等包需要此库。留空则自动检测。")
      .addText((text) =>
        text
          .setPlaceholder("自动检测")
          .setValue(this.plugin.settings.ghostscriptLibPath)
          .onChange(async (value) => {
            this.plugin.settings.ghostscriptLibPath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("MuPDF 路径 (mutool)")
      .setDesc("mutool 可执行文件路径。PDF 模式下，若找到 mutool，则用其渲染 PDF 页为高清图后展示（brew install mupdf）。留空则自动检测。")
      .addText((text) =>
        text
          .setPlaceholder("自动检测")
          .setValue(this.plugin.settings.mupdfPath)
          .onChange(async (value) => {
            this.plugin.settings.mupdfPath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("输出模式")
      .setDesc("SVG：内联矢量图、动图支持、暗色模式适配；PDF：完整 LaTeX 功能、animate/OCG/表单/中文")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("svg", "SVG")
          .addOption("pdf", "PDF")
          .setValue(this.plugin.settings.outputMode)
          .onChange(async (value) => {
            this.plugin.settings.outputMode = value as "svg" | "pdf";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("暗色模式颜色反转")
      .setDesc("在暗色模式下将 SVG 中的黑色切换为主题文字色，白色切换为背景色。仅 SVG 模式有效。")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.invertColorsInDarkMode)
          .onChange(async (value) => {
            this.plugin.settings.invertColorsInDarkMode = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("清除缓存")
      .setDesc("清除所有已缓存的 SVG/PDF，下次打开笔记将重新编译。")
      .addButton((button) =>
        button
          .setIcon("trash")
          .setTooltip("清除缓存")
          .onClick(async () => {
            await localForage.clear();
            new Notice("Tk Render: 缓存已清除", 3000);
          })
      );
  }
}
