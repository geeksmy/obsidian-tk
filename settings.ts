import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import TkPlugin from "./main";
import * as localForage from "localforage";

export interface TkPluginSettings {
  compilerPath: string;
  dvisvgmPath: string;
  ghostscriptLibPath: string;
  invertColorsInDarkMode: boolean;
}

export const DEFAULT_SETTINGS: TkPluginSettings = {
  compilerPath: "",
  dvisvgmPath: "",
  ghostscriptLibPath: "",
  invertColorsInDarkMode: true,
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
      .setName("暗色模式颜色反转")
      .setDesc("在暗色模式下将 SVG 中的黑色切换为主题文字色，白色切换为背景色。")
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
      .setDesc("清除所有已缓存的 SVG，下次打开笔记将重新编译。")
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
