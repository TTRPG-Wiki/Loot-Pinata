# Contributing a Community Loot Table

Want to share a loot table with other GMs? You can PR one into the community catalog and it'll show up in every install of the extension — one click to add.

## How to submit

1. Fork this repo.
2. Add your JSON file to `public/community-tables/`. Pick a clear filename (kebab-case, e.g. `my-cool-table.json`).
3. Add an entry to `public/community-tables/index.json`:

   ```json
   {
     "file": "my-cool-table.json",
     "name": "Table Display Name",
     "description": "One-line pitch for what this table is for",
     "author": "your-github-username",
     "system": "What system this is for, e.g. D&D 5e / OSE / Generic",
     "tiers": 3
   }
   ```

4. Open a pull request.

## Table format

Tables use the same JSON schema as locally-uploaded tables. See [example-table.json](public/example-table.json) for a working example, or click "Example" in the extension's Custom tab to download one.

## What makes a good submission

- **Self-contained theme.** Treasure for a specific genre, campaign, or monster type (gothic horror, cyberpunk, dragon hoards) — not just "more 5e loot."
- **3–5 tiers.** Enough variety to be useful without being overwhelming.
- **Flavor over crunch.** Half the appeal of a custom table is the items feel different from the core books.
- **Test it.** Roll on every tier a few times in the extension before submitting — make sure the chances feel right.

