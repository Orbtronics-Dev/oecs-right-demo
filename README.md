# OECS RIGHT — Consumer Protection Enhancement

**Orbtronics Ltd** is providing technical advisory and quality assurance services to the **Organisation of Eastern Caribbean States (OECS) Commission** under the 11th EDF Regional Integration, Growth and Human Development (RIGHT) Programme.

The assignment supports the enhancement of national consumer protection websites across four Member States: Antigua and Barbuda, Grenada, Saint Lucia, and Saint Vincent and the Grenadines.

- **Contract Reference:** OECS/RIGHT/2026/Ser_75
- **Duration:** August 2026 – April 2027
- **Repository:** [github.com/Orbtronics-Dev/oecs-right](https://github.com/Orbtronics-Dev/oecs-right)

---

## Repository Structure

```
oecs-right/
├── app/                       # Next.js app router (pages + API routes)
│   └── api/                   # Backend API routes (complaints, prices, officer)
├── components/                # Shared React components
├── lib/                       # DB schema, Drizzle client, utilities
├── public/                    # Static assets served by Next.js
├── infra/                     # Terraform / OpenTofu infrastructure (AWS)
├── docs/
│   ├── inception-report.qmd        # Phase 1 inception report
│   ├── technical-architecture.qmd  # Engineering reference document
│   ├── _orbtronics.typ             # Custom Typst template (branded PDF cover)
│   └── Resource Documents_*/       # Source reference documents
├── assets/
│   ├── logos/                 # Orbtronics SVG logos
│   └── fonts/helvetica-neue-5/ # Brand font files
├── _quarto.yml                # Quarto website config
├── _brand.yaml                # Orbtronics brand colours and typography
├── index.qmd                  # Quarto site landing page
├── package.json               # Node.js dependencies
├── next.config.ts             # Next.js configuration
├── flake.nix                  # Nix dev environment
└── justfile                   # Task runner
```

---

## Documentation (Quarto)

Project documentation is built with [Quarto](https://quarto.org), producing both a web site and PDF from the same `.qmd` source files.

### Setup

The dev environment is managed with Nix flakes. Enter the shell:

```sh
nix develop
```

This provides Quarto 1.8.26 (pinned — see note below), Typst, Node.js, and pnpm.

### Tasks

```sh
just docs-preview   # Live HTML preview at localhost:4200
just docs           # Build the full site to _output/
just docs-pdf       # Render inception-report.pdf via Typst
```

### Document layout

Each document is a single `.qmd` file in `docs/`. The YAML front matter controls
the document title, authors, date, and output format options. For PDF output, the
`_orbtronics.typ` Typst template provides a branded cover page, running headers,
and styled headings and tables.

To add a new report:
1. Create `docs/your-report.qmd`
2. Add it to `_quarto.yml` under both `render:` and `website.sidebar.contents`
3. Add `format: typst: template: _orbtronics.typ` to use the branded PDF template

### Quarto version note

Quarto 1.9.37 and later have a pandoc option regression that prevents rendering.
The flake pins to 1.8.26 via `builtins.storePath` (requires `--impure`).

### Brand assets

`_brand.yaml` references logo SVGs in `assets/logos/` and Helvetica Neue font
files in `assets/fonts/helvetica-neue-5/`. Both are committed and active.
The `logo:` and `fonts:` sections in `_brand.yaml` are enabled.

---

## Deployment

### Rendering PDFs

Each report is rendered to PDF individually using the branded Typst template:

```sh
just docs-pdf
```

This runs:

```sh
quarto render docs/inception-report.qmd --to typst -M template:_orbtronics.typ -M papersize:a4
```

The output lands at `docs/inception-report.pdf`. To render a different document, replace the path:

```sh
quarto render docs/technical-architecture.qmd --to typst -M template:_orbtronics.typ -M papersize:a4
```

PDFs are not committed to the repository. Render them locally when needed for submission or distribution.

### Publishing the site

The site is deployed via **[Ploi](https://ploi.io)**. Build the site locally first:

```sh
just docs
```

This renders all documents to `_output/`. The `_output/` directory contains the deployable static site. Ploi is configured to serve from this directory.

---

## Application (Next.js)

The consumer protection portal is built with Next.js 16, React 19, Tailwind CSS 4, and a SQLite database (Drizzle ORM). The backend API routes are co-located in `app/api/`.

```sh
just dev   # Dev server at localhost:3000
```

The database is created automatically on first run at `consumer-protection.db`. Demo credentials for the officer portal: `kwilliams` / `demo1234`.

---

## Contact

**Orbtronics Ltd** — Gros Islet, Saint Lucia
[info@orbtronicsltd.com](mailto:info@orbtronicsltd.com) · +1 758 486 0469 · [orbtronics.co](https://orbtronics.co)
