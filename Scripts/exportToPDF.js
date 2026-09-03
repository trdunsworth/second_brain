/**
 * Export current Obsidian note to PDF via Quarto + Typst.
 *
 * Usage from Templater:
 *   <% tp.user.exportToPDF(tp.file.title, tp.file.path(true)) %>
 *
 * Usage from console:
 *   tp.user.exportToPDF("My Note", "folder/My Note.md")
 */
async function exportToPDF(title, filePath) {
    const file = app.vault.getAbstractFileByPath(filePath || (title + '.md'));
    if (!file) {
        new Notice('File not found: ' + (filePath || title + '.md'));
        return;
    }

    const content = await app.vault.read(file);
    const vaultPath = app.vault.adapter.basePath;
    const fs = require('fs');
    const path = require('path');

    // Strip YAML frontmatter
    let clean = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

    // Convert [[wikilinks]] to plain text
    clean = clean.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2');
    clean = clean.replace(/\[\[([^\]]+)\]\]/g, '$1');

    const dateStr = new Date().toISOString().slice(0, 10);
    const safeName = title.replace(/[<>:"/\\|?*]/g, '_');

    // Build Quarto wrapper
    const qmd = `---
title: "${safeName}"
author: "Tony Dunsworth"
date: "${dateStr}"
format:
  typst:
    columns: 1
    margin:
      top: 2cm
      bottom: 2cm
      left: 2.5cm
      right: 2.5cm
    fontsize: 11pt
---

${clean}`;

    const tempQmd = path.join(vaultPath, '.temp-export.qmd');
    const outputDir = path.dirname(file.path);
    const pdfPath = path.join(vaultPath, outputDir, safeName + '.pdf');

    fs.writeFileSync(tempQmd, qmd, 'utf8');

    const { exec } = require('child_process');

    return new Promise((resolve) => {
        const cmd = `quarto render "${tempQmd}" --to typst --output "${safeName}.pdf" --output-dir "${path.dirname(tempQmd)}"`;
        exec(cmd, { cwd: vaultPath }, (err, stdout, stderr) => {
            if (err) {
                new Notice('PDF export failed: ' + err.message);
                console.error('PDF export error:', stderr || err);
                resolve(false);
                return;
            }

            const renderedPdf = path.join(path.dirname(tempQmd), safeName + '.pdf');
            if (fs.existsSync(renderedPdf)) {
                fs.copyFileSync(renderedPdf, pdfPath);
                fs.unlinkSync(renderedPdf);
                new Notice('PDF exported: ' + safeName + '.pdf');
                resolve(true);
            } else {
                new Notice('PDF not found after render.');
                resolve(false);
            }

            // Cleanup temp
            if (fs.existsSync(tempQmd)) fs.unlinkSync(tempQmd);
        });
    });
}

module.exports = { exportToPDF };
