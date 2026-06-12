# Emacs Data Science Quick Reference

## Essential Keybindings

### File & Buffer Management
| Action | Keybinding |
|--------|-----------|
| Find file | `C-x C-f` |
| Save file | `C-x C-s` |
| Save all | `C-x s` |
| Switch buffer | `C-x b` |
| Kill buffer | `C-x k` |
| Recent files | `M-x recentf-open-files` |

### Navigation
| Action | Keybinding |
|--------|-----------|
| Search in buffer | `C-s` |
| Go to line | `M-g g` |
| Jump to char | `C-:` |
| Beginning of line | `C-a` |
| End of line | `C-e` |
| Beginning of buffer | `M-<` |
| End of buffer | `M->` |

### Editing
| Action | Keybinding |
|--------|-----------|
| Undo | `C-/` or `C-_` |
| Redo | `C-g C-/` |
| Cut line | `C-k` |
| Copy region | `M-w` |
| Paste | `C-y` |
| Comment/uncomment | `M-;` |
| Expand region | `C-=` |

### Windows & Frames
| Action | Keybinding |
|--------|-----------|
| Split horizontally | `C-x 2` |
| Split vertically | `C-x 3` |
| Close other windows | `C-x 1` |
| Close this window | `C-x 0` |
| Other window | `C-x o` |

## Language-Specific Commands

### Python
| Action | Keybinding |
|--------|-----------|
| Send buffer to Python | `C-c C-c` |
| Send region to Python | `C-c C-r` |
| Start Python shell | `M-x run-python` |
| Activate virtualenv | `M-x pyvenv-workon` |
| Format with Black | `M-x python-black-buffer` |
| Run pytest | `C-c t t` |

### R (ESS)
| Action | Keybinding |
|--------|-----------|
| Start R | `M-x R` |
| Eval line and step | `C-c C-n` |
| Eval region/function | `C-c C-c` |
| Eval buffer | `C-c C-b` |
| Switch to R console | `C-c C-z` |
| Help on object | `C-c C-v` |
| View data | `C-c v` |

### Julia
| Action | Keybinding |
|--------|-----------|
| Start Julia REPL | `M-x julia-repl` |
| Send region | `C-c C-r` |
| Send buffer | `C-c C-b` |
| Switch to REPL | `C-c C-z` |
| Format buffer | `C-c C-f` |

### JavaScript/TypeScript
| Action | Keybinding |
|--------|-----------|
| Start Node REPL | `M-x nodejs-repl` |
| Send region | `C-c C-r` |
| Send buffer | `C-c C-l` |
| Switch to REPL | `C-c C-z` |
| Format with Prettier | Auto on save |

## Code Cells (Jupyter-style)
| Action | Keybinding |
|--------|-----------|
| Next cell | `M-n` |
| Previous cell | `M-p` |
| Eval cell | `C-c C-c` |
| Eval all above | `C-c C-b` |

## Org Mode
| Action | Keybinding |
|--------|-----------|
| New heading | `M-RET` |
| TODO cycle | `C-c C-t` |
| Toggle visibility | `TAB` |
| Toggle all visibility | `S-TAB` |
| Execute code block | `C-c C-c` |
| Edit code block | `C-c '` |
| Insert code block | `C-c i c` |
| Capture | `C-c c` |
| Agenda | `C-c a` |
| Store link | `C-c l` |

## Magit (Git)
| Action | Keybinding |
|--------|-----------|
| Magit status | `C-x g` |
| Stage file | `s` (in Magit) |
| Unstage file | `u` (in Magit) |
| Commit | `c c` (in Magit) |
| Push | `P p` (in Magit) |
| Pull | `F p` (in Magit) |
| Diff | `d d` (in Magit) |

## Project Management (Projectile)
| Action | Keybinding |
|--------|-----------|
| Switch project | `C-c p p` |
| Find file in project | `C-c p f` |
| Search in project | `C-c p s r` |
| Run shell in project | `C-c p s` |
| Compile project | `C-c p c` |

## LSP (Eglot)
| Action | Keybinding |
|--------|-----------|
| Go to definition | `M-.` |
| Go back | `M-,` |
| Find references | `M-?` |
| Rename symbol | `M-x eglot-rename` |
| Format buffer | `M-x eglot-format-buffer` |
| Code actions | `M-x eglot-code-actions` |
| Show documentation | `M-x eldoc-doc-buffer` |

## AI Assistants

### GitHub Copilot
| Action | Keybinding |
|--------|-----------|
| Accept suggestion | `TAB` |
| Accept word | `C-TAB` |
| Next suggestion | `M-]` |
| Previous suggestion | `M-[` |

### Ellama (Ollama)
| Action | Keybinding |
|--------|-----------|
| Chat | `C-c e c` |
| Ask about selection | `C-c e s` |
| Ask about code | `C-c e a` |
| Rewrite | `C-c e r` |
| Improve wording | `C-c e i` |
| Code review | `C-c e k` |
| Enhance code | `C-c e e` |

### GPTel
| Action | Keybinding |
|--------|-----------|
| Open chat | `C-c C-g` |
| Send | `C-c g s` |
| Rewrite with AI | `C-c g r` |

## Help System
| Action | Keybinding |
|--------|-----------|
| Describe function | `C-h f` |
| Describe variable | `C-h v` |
| Describe key | `C-h k` |
| Search commands | `C-h a` |
| Emacs manual | `C-h r` |
| Mode info | `C-h m` |

## Custom Shortcuts
| Action | Keybinding |
|--------|-----------|
| Insert date | `C-c d` |
| Open config | `C-c C-,` |
| Reload config | `C-c C-.` |
| Terminal (vterm) | `C-c t` |
| Multi-vterm | `C-c T` |
| Pomodoro | `F12` |

## Common Workflows

### Data Analysis in Python
```
1. C-x C-f project/analysis.py    ; Open file
2. M-x pyvenv-workon data-sci     ; Activate venv
3. M-x run-python                 ; Start Python
4. C-c C-c                        ; Send code to Python
5. C-x g                          ; Commit with Magit
```

### R Statistical Analysis
```
1. C-x C-f analysis.R             ; Open R file
2. M-x R                          ; Start R session
3. C-c C-c                        ; Eval region
4. C-c v                          ; View data frame
5. C-c C-z                        ; Switch to R console
```

### Literate Programming with Org
```
1. C-x C-f analysis.org           ; Create org file
2. C-c i c python                 ; Insert Python block
3. [Write code]
4. C-c C-c                        ; Execute block
5. C-c C-e h o                    ; Export to HTML
```

### Multi-language Notebook
```
1. C-x C-f notebook.org           ; Create notebook
2. C-c i c python                 ; Python block
3. C-c C-c                        ; Run Python
4. C-c i c R                      ; R block
5. C-c C-c                        ; Run R
6. Results appear inline
```

## Tips & Tricks

### Productivity
- Use `M-x` with fuzzy matching to find any command
- `C-h k` followed by any key shows what it does
- `C-g` cancels any command
- `which-key` pops up after `C-x` or `C-c` to show options

### Search & Replace
- `M-%` - Query replace
- `C-M-%` - Regexp query replace
- During replace: `y` (yes), `n` (no), `!` (all), `q` (quit)

### Multiple Cursors
- `C->` repeatedly to mark more occurrences
- Type to edit all at once
- `C-g` to exit

### Project-wide Search
- `C-c p s r` - Ripgrep search in project
- `M-s r` - Ripgrep from current directory
- `M-s g` - Grep

### Working with REPLs
- Send code with language-specific keys
- `C-c C-z` typically switches to REPL
- Results show in REPL buffer
- History navigation with `M-p` / `M-n` in REPL

## Emergency Commands

| Action | Keybinding |
|--------|-----------|
| Quit command | `C-g` |
| Emergency quit | `C-x C-c` |
| Recover file | `M-x recover-file` |
| Recover session | `M-x recover-session` |

---

**Print this and keep it handy while learning!**
