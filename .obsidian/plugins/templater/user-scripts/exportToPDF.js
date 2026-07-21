/**
 * Export current note to PDF using obsidian-pandoc
 * Usage: tp.user.exportToPDF(tp.file.title)
 */
async function exportToPDF(title) {
    const file = app.vault.getAbstractFileByPath(title + '.md');
    if (!file) {
        new Notice('File not found: ' + title);
        return;
    }

    const content = await app.vault.read(file);
    const vaultPath = app.vault.adapter.basePath;
    const tempMd = require('path').join(vaultPath, '.temp-export.md');
    const outputPdf = require('path').join(vaultPath, title + '.pdf');

    const fs = require('fs');
    fs.writeFileSync(tempMd, content);

    const { exec } = require('child_process');
    
    exec(`pandoc "${tempMd}" -o "${outputPdf}" --pdf-engine=weasyprint`, (err) => {
        if (err) {
            new Notice('PDF export failed: ' + err.message);
        } else {
            new Notice('PDF exported: ' + title + '.pdf');
        }
        if (fs.existsSync(tempMd)) {
            fs.unlinkSync(tempMd);
        }
    });
}

module.exports = { exportToPDF };