# Claude Code — Istruzioni di Progetto

## Workflow di Consegna

**Non fare mai `git push` né tentativi di push via MCP GitHub.**

Il developer (Robertin) lavora esclusivamente via interfacce web e carica i file
manualmente tramite GitHub web UI. Claude Code deve:

1. Scrivere e committare il codice localmente (`git add` + `git commit`)
2. Generare uno ZIP con i soli file nuovi/modificati, con il percorso relativo dei file da caricare
3. Consegnare lo ZIP tramite `SendUserFile`
4. Spiegare nel messaggio quali file sono nello ZIP e come caricarli su GitHub

Non tentare `git push`, `mcp__github__push_files`, né `mcp__github__create_or_update_file`.
La sessione remota non ha permessi di scrittura verso GitHub — qualsiasi tentativo
di push restituirà 403 e spreca tempo.

## Contesto Prodotto

Vedi `CONTEXT.md` per architettura completa, stack tecnico e stato attuale del progetto.
