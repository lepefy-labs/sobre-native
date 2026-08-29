# Claude Code — Istruzioni di Progetto

## Workflow di Consegna

ChatGPT/Codex può scrivere e fare push direttamente su GitHub quando l'utente richiede o approva l'implementazione.

- Se l'utente indica o approva `main`, è consentito aggiornare direttamente `main`.
- Se l'utente richiede una PR, usare una branch/PR.
- Non richiedere ZIP o upload manuale quando è disponibile una connessione GitHub funzionante da ChatGPT/Codex.
- Dopo ogni push verificare commit risultante e CI/build rilevanti.
- Segnalare separatamente eventuali migrazioni o configurazioni manuali.

## Regole operative

Leggere sempre `AGENTS.md` prima di modificare il progetto, se presente.

## Contesto Prodotto

Vedi `PROJECT_CONTEXT.md` per architettura, stack tecnico, backend contracts, stato attuale e roadmap del progetto.
