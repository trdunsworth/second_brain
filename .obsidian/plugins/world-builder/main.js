var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => WorldBuilderPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = { worldFolder: "World" };
function slugify(s) {
  return s.replace(/[/\\:*?"<>|#^[\]]/g, "-").trim();
}
async function ensureFolder(app, path) {
  if (!app.vault.getAbstractFileByPath(path)) {
    await app.vault.createFolder(path);
  }
}
async function createNote(app, folder, filename, content) {
  await ensureFolder(app, folder);
  const path = `${folder}/${slugify(filename)}.md`;
  const existing = app.vault.getAbstractFileByPath(path);
  if (existing instanceof import_obsidian.TFile) {
    await app.vault.modify(existing, content);
    return existing;
  }
  return await app.vault.create(path, content);
}
function readFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match)
    return {};
  const result = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1)
      continue;
    result[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return result;
}
var VIEW_TYPE = "world-builder-sidebar";
var WorldBuilderView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.activeTab = "characters";
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "World Builder";
  }
  getIcon() {
    return "globe";
  }
  async onOpen() {
    await this.render();
  }
  async onClose() {
  }
  async render() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("wb-sidebar");
    const header = containerEl.createDiv("wb-header");
    header.createEl("h2", { text: "World Builder" });
    const tabBar = containerEl.createDiv("wb-tabs");
    const tabs = [
      { id: "characters", label: "Characters" },
      { id: "locations", label: "Locations" },
      { id: "factions", label: "Factions" },
      { id: "lore", label: "Lore" },
      { id: "timeline", label: "Timeline" }
    ];
    const contents = {};
    tabs.forEach(({ id, label }) => {
      const btn = tabBar.createEl("button", { text: label, cls: "wb-tab" });
      if (id === this.activeTab)
        btn.addClass("active");
      btn.onclick = () => {
        var _a;
        this.activeTab = id;
        tabBar.querySelectorAll(".wb-tab").forEach((b) => b.removeClass("active"));
        btn.addClass("active");
        Object.values(contents).forEach((c) => c == null ? void 0 : c.removeClass("active"));
        (_a = contents[id]) == null ? void 0 : _a.addClass("active");
      };
      const pane = containerEl.createDiv("wb-tab-content");
      if (id === this.activeTab)
        pane.addClass("active");
      contents[id] = pane;
    });
    const folder = this.plugin.settings.worldFolder;
    await this.renderSection(
      contents.characters,
      `${folder}/Characters`,
      "Characters",
      () => new CharacterModal(this.app, this.plugin, () => this.render()).open(),
      (fm) => {
        var _a, _b, _c;
        return {
          title: (_a = fm.name) != null ? _a : "Unnamed",
          meta: `${(_b = fm.role) != null ? _b : ""} ${fm.faction ? `\xB7 ${fm.faction}` : ""}`.trim(),
          badge: (_c = fm.role) != null ? _c : ""
        };
      }
    );
    await this.renderSection(
      contents.locations,
      `${folder}/Locations`,
      "Locations",
      () => new LocationModal(this.app, this.plugin, () => this.render()).open(),
      (fm) => {
        var _a, _b, _c;
        return {
          title: (_a = fm.name) != null ? _a : "Unnamed",
          meta: `${(_b = fm.type) != null ? _b : ""} ${fm.parent ? `\xB7 in ${fm.parent}` : ""}`.trim(),
          badge: (_c = fm.type) != null ? _c : ""
        };
      }
    );
    await this.renderSection(
      contents.factions,
      `${folder}/Factions`,
      "Factions",
      () => new FactionModal(this.app, this.plugin, () => this.render()).open(),
      (fm) => {
        var _a, _b, _c;
        return {
          title: (_a = fm.name) != null ? _a : "Unnamed",
          meta: (_b = fm.goals) != null ? _b : "",
          badge: (_c = fm.alignment) != null ? _c : ""
        };
      }
    );
    await this.renderSection(
      contents.lore,
      `${folder}/Lore`,
      "Lore Entries",
      () => new LoreModal(this.app, this.plugin, () => this.render()).open(),
      (fm) => {
        var _a, _b, _c;
        return {
          title: (_a = fm.title) != null ? _a : "Untitled",
          meta: (_b = fm.category) != null ? _b : "",
          badge: (_c = fm.category) != null ? _c : ""
        };
      }
    );
    await this.renderSection(
      contents.timeline,
      `${folder}/Timeline`,
      "Timeline Events",
      () => new TimelineModal(this.app, this.plugin, () => this.render()).open(),
      (fm) => {
        var _a, _b;
        return {
          title: (_a = fm.title) != null ? _a : "Untitled",
          meta: (_b = fm.date) != null ? _b : "",
          badge: ""
        };
      }
    );
  }
  async renderSection(container, folderPath, label, onCreate, getCard) {
    const hdr = container.createDiv("wb-section-header");
    hdr.createEl("span", { text: label });
    const btn = hdr.createEl("button", { text: "+ New", cls: "wb-btn-primary" });
    btn.onclick = onCreate;
    const files = this.app.vault.getMarkdownFiles().filter(
      (f) => f.path.startsWith(folderPath + "/")
    );
    const list = container.createDiv("wb-list");
    if (files.length === 0) {
      list.createDiv({ cls: "wb-empty", text: `No ${label.toLowerCase()} yet.` });
      return;
    }
    for (const file of files) {
      const content = await this.app.vault.cachedRead(file);
      const fm = readFrontmatter(content);
      const { title, meta, badge } = getCard(fm);
      const card = list.createDiv("wb-card");
      const titleEl = card.createDiv("wb-card-title");
      titleEl.setText(title);
      if (badge) {
        const b = titleEl.createSpan({ cls: `wb-badge wb-badge-${badge.toLowerCase()}` });
        b.setText(badge);
      }
      if (meta)
        card.createDiv({ cls: "wb-card-meta", text: meta });
      card.onclick = () => this.app.workspace.getLeaf().openFile(file);
    }
  }
};
var CharacterModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onDone) {
    super(app);
    this.data = {
      name: "",
      role: "protagonist",
      age: "",
      faction: "",
      physicalDesc: "",
      personality: "",
      goals: "",
      secrets: ""
    };
    this.plugin = plugin;
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("wb-modal");
    contentEl.createEl("h2", { text: "New Character" });
    new import_obsidian.Setting(contentEl).setName("Name").addText((t) => {
      t.setPlaceholder("Character name").onChange((v) => this.data.name = v);
    });
    new import_obsidian.Setting(contentEl).setName("Role").addDropdown((d) => {
      ["protagonist", "antagonist", "supporting", "minor"].forEach(
        (o) => d.addOption(o, o.charAt(0).toUpperCase() + o.slice(1))
      );
      d.onChange((v) => this.data.role = v);
    });
    new import_obsidian.Setting(contentEl).setName("Age").addText((t) => {
      t.setPlaceholder("e.g. 34").onChange((v) => this.data.age = v);
    });
    new import_obsidian.Setting(contentEl).setName("Faction").addText((t) => {
      t.setPlaceholder("Faction name").onChange((v) => this.data.faction = v);
    });
    new import_obsidian.Setting(contentEl).setName("Physical Description").addTextArea((t) => {
      t.inputEl.addClass("wb-textarea");
      t.onChange((v) => this.data.physicalDesc = v);
    });
    new import_obsidian.Setting(contentEl).setName("Personality").addTextArea((t) => {
      t.inputEl.addClass("wb-textarea");
      t.onChange((v) => this.data.personality = v);
    });
    new import_obsidian.Setting(contentEl).setName("Goals").addTextArea((t) => {
      t.inputEl.addClass("wb-textarea");
      t.onChange((v) => this.data.goals = v);
    });
    new import_obsidian.Setting(contentEl).setName("Secrets").addTextArea((t) => {
      t.inputEl.addClass("wb-textarea");
      t.onChange((v) => this.data.secrets = v);
    });
    new import_obsidian.Setting(contentEl).addButton(
      (b) => b.setButtonText("Create").setCta().onClick(() => this.submit())
    );
  }
  async submit() {
    if (!this.data.name.trim()) {
      new import_obsidian.Notice("Name is required.");
      return;
    }
    const folder = `${this.plugin.settings.worldFolder}/Characters`;
    const content = [
      "---",
      `name: "${this.data.name}"`,
      `role: ${this.data.role}`,
      `age: "${this.data.age}"`,
      `faction: "${this.data.faction}"`,
      `type: character`,
      "---",
      "",
      `# ${this.data.name}`,
      "",
      "## Physical Description",
      this.data.physicalDesc || "_None provided._",
      "",
      "## Personality",
      this.data.personality || "_None provided._",
      "",
      "## Goals",
      this.data.goals || "_None provided._",
      "",
      "## Secrets",
      this.data.secrets || "_None provided._"
    ].join("\n");
    const file = await createNote(this.app, folder, this.data.name, content);
    new import_obsidian.Notice(`Character "${this.data.name}" created.`);
    this.close();
    this.onDone();
    await this.app.workspace.getLeaf().openFile(file);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var LocationModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onDone) {
    super(app);
    this.data = {
      name: "",
      type: "city",
      parent: "",
      description: "",
      inhabitants: "",
      secrets: ""
    };
    this.plugin = plugin;
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("wb-modal");
    contentEl.createEl("h2", { text: "New Location" });
    new import_obsidian.Setting(contentEl).setName("Name").addText((t) => {
      t.setPlaceholder("Location name").onChange((v) => this.data.name = v);
    });
    new import_obsidian.Setting(contentEl).setName("Type").addDropdown((d) => {
      ["city", "region", "building", "landmark", "other"].forEach(
        (o) => d.addOption(o, o.charAt(0).toUpperCase() + o.slice(1))
      );
      d.onChange((v) => this.data.type = v);
    });
    new import_obsidian.Setting(contentEl).setName("Parent Location").addText((t) => {
      t.setPlaceholder("e.g. The Northern Kingdom").onChange((v) => this.data.parent = v);
    });
    new import_obsidian.Setting(contentEl).setName("Description").addTextArea((t) => {
      t.inputEl.addClass("wb-textarea");
      t.onChange((v) => this.data.description = v);
    });
    new import_obsidian.Setting(contentEl).setName("Who Lives Here").addTextArea((t) => {
      t.inputEl.addClass("wb-textarea");
      t.onChange((v) => this.data.inhabitants = v);
    });
    new import_obsidian.Setting(contentEl).setName("Secrets").addTextArea((t) => {
      t.inputEl.addClass("wb-textarea");
      t.onChange((v) => this.data.secrets = v);
    });
    new import_obsidian.Setting(contentEl).addButton(
      (b) => b.setButtonText("Create").setCta().onClick(() => this.submit())
    );
  }
  async submit() {
    if (!this.data.name.trim()) {
      new import_obsidian.Notice("Name is required.");
      return;
    }
    const folder = `${this.plugin.settings.worldFolder}/Locations`;
    const parentLink = this.data.parent ? `[[${this.data.parent}]]` : "";
    const content = [
      "---",
      `name: "${this.data.name}"`,
      `type: ${this.data.type}`,
      `parent: "${this.data.parent}"`,
      `entry_type: location`,
      "---",
      "",
      `# ${this.data.name}`,
      "",
      ...parentLink ? [`**Part of:** ${parentLink}`, ""] : [],
      "## Description",
      this.data.description || "_None provided._",
      "",
      "## Who Lives Here",
      this.data.inhabitants || "_None provided._",
      "",
      "## Secrets",
      this.data.secrets || "_None provided._"
    ].join("\n");
    const file = await createNote(this.app, folder, this.data.name, content);
    new import_obsidian.Notice(`Location "${this.data.name}" created.`);
    this.close();
    this.onDone();
    await this.app.workspace.getLeaf().openFile(file);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var FactionModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onDone) {
    super(app);
    this.data = {
      name: "",
      alignment: "neutral",
      goals: "",
      enemies: "",
      allies: "",
      description: ""
    };
    this.plugin = plugin;
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("wb-modal");
    contentEl.createEl("h2", { text: "New Faction" });
    new import_obsidian.Setting(contentEl).setName("Name").addText((t) => {
      t.setPlaceholder("Faction name").onChange((v) => this.data.name = v);
    });
    new import_obsidian.Setting(contentEl).setName("Alignment").addDropdown((d) => {
      ["lawful", "neutral", "chaotic"].forEach(
        (o) => d.addOption(o, o.charAt(0).toUpperCase() + o.slice(1))
      );
      d.onChange((v) => this.data.alignment = v);
    });
    new import_obsidian.Setting(contentEl).setName("Goals").addTextArea((t) => {
      t.inputEl.addClass("wb-textarea");
      t.onChange((v) => this.data.goals = v);
    });
    new import_obsidian.Setting(contentEl).setName("Enemies").addText((t) => {
      t.setPlaceholder("Comma-separated").onChange((v) => this.data.enemies = v);
    });
    new import_obsidian.Setting(contentEl).setName("Allies").addText((t) => {
      t.setPlaceholder("Comma-separated").onChange((v) => this.data.allies = v);
    });
    new import_obsidian.Setting(contentEl).setName("Description").addTextArea((t) => {
      t.inputEl.addClass("wb-textarea");
      t.onChange((v) => this.data.description = v);
    });
    new import_obsidian.Setting(contentEl).addButton(
      (b) => b.setButtonText("Create").setCta().onClick(() => this.submit())
    );
  }
  async submit() {
    if (!this.data.name.trim()) {
      new import_obsidian.Notice("Name is required.");
      return;
    }
    const folder = `${this.plugin.settings.worldFolder}/Factions`;
    const enemyLinks = this.data.enemies.split(",").filter(Boolean).map((e) => `[[${e.trim()}]]`).join(", ");
    const allyLinks = this.data.allies.split(",").filter(Boolean).map((a) => `[[${a.trim()}]]`).join(", ");
    const lines = [
      "---",
      `name: "${this.data.name}"`,
      `alignment: ${this.data.alignment}`,
      `goals: "${this.data.goals.replace(/"/g, "'")}"`,
      `entry_type: faction`,
      "---",
      "",
      `# ${this.data.name}`,
      "",
      `**Alignment:** ${this.data.alignment}`
    ];
    if (enemyLinks)
      lines.push(`**Enemies:** ${enemyLinks}`);
    if (allyLinks)
      lines.push(`**Allies:** ${allyLinks}`);
    lines.push("", "## Goals", this.data.goals || "_None provided._", "", "## Description", this.data.description || "_None provided._");
    const file = await createNote(this.app, folder, this.data.name, lines.join("\n"));
    new import_obsidian.Notice(`Faction "${this.data.name}" created.`);
    this.close();
    this.onDone();
    await this.app.workspace.getLeaf().openFile(file);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var LoreModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onDone) {
    super(app);
    this.data = { title: "", category: "history", content: "" };
    this.plugin = plugin;
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("wb-modal");
    contentEl.createEl("h2", { text: "New Lore Entry" });
    new import_obsidian.Setting(contentEl).setName("Title").addText((t) => {
      t.setPlaceholder("Entry title").onChange((v) => this.data.title = v);
    });
    new import_obsidian.Setting(contentEl).setName("Category").addDropdown((d) => {
      ["history", "magic", "religion", "culture", "other"].forEach(
        (o) => d.addOption(o, o.charAt(0).toUpperCase() + o.slice(1))
      );
      d.onChange((v) => this.data.category = v);
    });
    new import_obsidian.Setting(contentEl).setName("Content").addTextArea((t) => {
      t.inputEl.addClass("wb-textarea");
      t.inputEl.style.minHeight = "120px";
      t.onChange((v) => this.data.content = v);
    });
    new import_obsidian.Setting(contentEl).addButton(
      (b) => b.setButtonText("Create").setCta().onClick(() => this.submit())
    );
  }
  async submit() {
    if (!this.data.title.trim()) {
      new import_obsidian.Notice("Title is required.");
      return;
    }
    const folder = `${this.plugin.settings.worldFolder}/Lore`;
    const content = [
      "---",
      `title: "${this.data.title}"`,
      `category: ${this.data.category}`,
      `entry_type: lore`,
      "---",
      "",
      `# ${this.data.title}`,
      "",
      `*Category: ${this.data.category}*`,
      "",
      this.data.content || "_No content yet._"
    ].join("\n");
    const file = await createNote(this.app, folder, this.data.title, content);
    new import_obsidian.Notice(`Lore entry "${this.data.title}" created.`);
    this.close();
    this.onDone();
    await this.app.workspace.getLeaf().openFile(file);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var TimelineModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onDone) {
    super(app);
    this.data = { date: "", title: "", description: "", characters: "", locations: "" };
    this.plugin = plugin;
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("wb-modal");
    contentEl.createEl("h2", { text: "New Timeline Event" });
    new import_obsidian.Setting(contentEl).setName("Date / Era").addText((t) => {
      t.setPlaceholder("e.g. Year 342 AE").onChange((v) => this.data.date = v);
    });
    new import_obsidian.Setting(contentEl).setName("Title").addText((t) => {
      t.setPlaceholder("Event title").onChange((v) => this.data.title = v);
    });
    new import_obsidian.Setting(contentEl).setName("Description").addTextArea((t) => {
      t.inputEl.addClass("wb-textarea");
      t.onChange((v) => this.data.description = v);
    });
    new import_obsidian.Setting(contentEl).setName("Linked Characters").addText((t) => {
      t.setPlaceholder("Comma-separated names").onChange((v) => this.data.characters = v);
    });
    new import_obsidian.Setting(contentEl).setName("Linked Locations").addText((t) => {
      t.setPlaceholder("Comma-separated names").onChange((v) => this.data.locations = v);
    });
    new import_obsidian.Setting(contentEl).addButton(
      (b) => b.setButtonText("Create").setCta().onClick(() => this.submit())
    );
  }
  async submit() {
    if (!this.data.title.trim()) {
      new import_obsidian.Notice("Title is required.");
      return;
    }
    const folder = `${this.plugin.settings.worldFolder}/Timeline`;
    const charLinks = this.data.characters.split(",").filter(Boolean).map((c) => `[[${c.trim()}]]`).join(", ");
    const locLinks = this.data.locations.split(",").filter(Boolean).map((l) => `[[${l.trim()}]]`).join(", ");
    const filename = this.data.date ? `${this.data.date} - ${this.data.title}` : this.data.title;
    const lines = [
      "---",
      `title: "${this.data.title}"`,
      `date: "${this.data.date}"`,
      `entry_type: timeline`,
      "---",
      "",
      `# ${this.data.title}`,
      "",
      `**Date/Era:** ${this.data.date || "_Unknown_"}`
    ];
    if (charLinks)
      lines.push(`**Characters:** ${charLinks}`);
    if (locLinks)
      lines.push(`**Locations:** ${locLinks}`);
    lines.push("", "## Description", this.data.description || "_None provided._");
    const file = await createNote(this.app, folder, filename, lines.join("\n"));
    new import_obsidian.Notice(`Timeline event "${this.data.title}" created.`);
    this.close();
    this.onDone();
    await this.app.workspace.getLeaf().openFile(file);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var WorldBuilderSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "World Builder Settings" });
    new import_obsidian.Setting(containerEl).setName("World Folder").setDesc("Root folder for all world-building notes.").addText(
      (t) => t.setPlaceholder("World").setValue(this.plugin.settings.worldFolder).onChange(async (v) => {
        this.plugin.settings.worldFolder = v || "World";
        await this.plugin.saveSettings();
      })
    );
  }
};
var WorldBuilderPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.registerView(VIEW_TYPE, (leaf) => new WorldBuilderView(leaf, this));
    this.addRibbonIcon("globe", "World Builder", () => this.activateSidebar());
    this.addCommand({
      id: "open-sidebar",
      name: "Open World Builder sidebar",
      callback: () => this.activateSidebar()
    });
    this.addCommand({
      id: "new-character",
      name: "New Character",
      callback: () => new CharacterModal(this.app, this, () => this.refreshSidebar()).open()
    });
    this.addCommand({
      id: "new-location",
      name: "New Location",
      callback: () => new LocationModal(this.app, this, () => this.refreshSidebar()).open()
    });
    this.addCommand({
      id: "new-faction",
      name: "New Faction",
      callback: () => new FactionModal(this.app, this, () => this.refreshSidebar()).open()
    });
    this.addCommand({
      id: "new-lore",
      name: "New Lore Entry",
      callback: () => new LoreModal(this.app, this, () => this.refreshSidebar()).open()
    });
    this.addCommand({
      id: "new-timeline-event",
      name: "New Timeline Event",
      callback: () => new TimelineModal(this.app, this, () => this.refreshSidebar()).open()
    });
    this.addSettingTab(new WorldBuilderSettingTab(this.app, this));
  }
  async activateSidebar() {
    var _a;
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = (_a = workspace.getRightLeaf(false)) != null ? _a : workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }
  refreshSidebar() {
    const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
    if ((leaf == null ? void 0 : leaf.view) instanceof WorldBuilderView) {
      leaf.view.render();
    }
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};

/* nosourcemap */