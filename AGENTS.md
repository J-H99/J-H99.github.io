# AGENTS.md

## Project Overview

This repository is a personal GitHub Pages study archive.

It is a static HTML/CSS/JS site, not a framework app. Prefer small, direct edits to existing HTML, CSS, Markdown, and asset files.

The site is maintained with Codex/AI assistance, so changes should be easy for future agents to understand, verify, and continue.

## Repository Structure

- `index.html`: home page
- `assets/`: shared CSS and JavaScript
- `notes/`: study notes and yearly indexes
- `materials/`: lecture materials, presentation files, and related pages
- `labs/`: small HTML demos and experiments
- `tools/`: local generation or maintenance scripts
- `README.md`: public repository overview

## General Rules

- Preserve the existing static-site structure unless the user explicitly asks for a framework or build system.
- Use relative links that work on GitHub Pages.
- Keep Korean writing natural, clear, and consistent with nearby content.
- Prefer semantic HTML and simple CSS over unnecessary JavaScript.
- Reuse existing styles from `assets/styles.css` before adding new patterns.
- Do not add secrets, API keys, credentials, private URLs, or sensitive personal data.
- Do not overwrite unrelated user changes.
- Run `git status --short --branch` before major edits, staging, or committing.

## Content Rules

- When adding a new note, material, or lab, update the relevant index page.
- Update `README.md` when the new content is important enough to be discoverable from the repository front page.
- If both Markdown and HTML versions exist for the same note, keep them in sync.
- Use Asia/Seoul time when adding upload or update metadata.
- Keep headings, titles, and navigation labels consistent across related pages.
- Check links after adding or moving files.

## Design Rules

- Keep layouts readable on both desktop and mobile.
- Avoid text overlap, horizontal scrolling, tiny text, and cramped buttons.
- Keep visual changes restrained and consistent with the existing study archive style.
- Do not introduce large dependencies for simple static pages.
- Prefer accessible color contrast and readable spacing.
- Use meaningful `alt` text for images unless the image is decorative.

## Accessibility Rules

- Use one clear `h1` per page.
- Keep heading order logical.
- Use descriptive link text instead of vague labels like `click here`.
- Add `aria-label` where navigation or controls need clarification.
- Ensure interactive elements are keyboard-usable where practical.
- Avoid relying on color alone to communicate meaning.

## Code Quality

This repository has npm-based quality tooling installed. Use the scripts in `package.json`; do not assume checks are optional.

Installed tools:

- Prettier for formatting HTML, CSS, JavaScript, Markdown, and JSON.
- html-validate for HTML validation.
- Stylelint for CSS validation and automatic fixes.
- ESLint for JavaScript and MJS validation and automatic fixes.

Before finishing any code or content-structure change, run:

```bash
npm run check
```

If formatting or linting fails and the failure is related to the current task, run:

```bash
npm run fix
npm run check
```

Use the more targeted scripts when useful:

```bash
npm run format
npm run format:check
npm run lint
npm run lint:fix
```

Only format or auto-fix files related to the current task unless the user explicitly asks for a repository-wide cleanup.

Do not add, remove, or replace linting, formatting, build, or test dependencies unless the user asks for tooling changes.

## Fix Policy

When a quality check fails:

- Fix the underlying issue when it is related to the current task.
- Re-run the failing command after the fix.
- Do not rewrite unrelated files just to satisfy formatting.
- Do not suppress lint rules unless there is a clear reason.
- If a pre-existing unrelated issue blocks the check, report it clearly and leave unrelated code untouched.

## New Content Checklist

When adding a new note, material, or lab:

- Add the content file in the appropriate directory.
- Add a link from the relevant index page.
- Add or update `README.md` when appropriate.
- Verify relative links from the home page to the new page.
- Run `npm run check`.
- Check desktop and mobile rendering.
- Check browser console errors.
- Confirm the final page is readable without local-only dependencies.

## Verification

Before finishing frontend or content layout changes, verify the changed pages visually.

Start a local static server if needed:

```bash
python3 -m http.server 8000
```

Use `agent-browser` to inspect the changed pages:

```bash
agent-browser open http://localhost:8000
agent-browser wait --load networkidle
agent-browser snapshot -i
agent-browser screenshot --full
```

Check desktop size:

```bash
agent-browser set viewport 1440 1000
agent-browser screenshot desktop-check.png --full
```

Check mobile size:

```bash
agent-browser set viewport 390 844
agent-browser screenshot mobile-check.png --full
```

Check console and page errors:

```bash
agent-browser errors
agent-browser console
```

If a page was visually changed, do not finish until desktop and mobile screenshots look correct.

## Agent Browser Rule

Use `agent-browser` whenever a dev server is running or when visual verification is needed.

The local skill is available at:

```text
/Users/jaehyeok/.codex/skills/agent-browser/SKILL.md
```

Preferred workflow:

```bash
agent-browser open http://localhost:8000
agent-browser wait --load networkidle
agent-browser snapshot -i
agent-browser screenshot --full
agent-browser set viewport 390 844
agent-browser screenshot mobile-check.png --full
```

After navigation, form submission, modal opening, or dynamic content changes, run a fresh snapshot before interacting again.

## Subagent Workflow

Use subagents for work that benefits from parallel context gathering, independent review, or multiple specialties. Do not use them mechanically for every tiny edit.

Good reasons to use subagents:

- A change touches multiple areas such as content, layout, scripts, and navigation.
- The task needs research before implementation, such as comparing existing page patterns or checking generated material.
- Visual changes need independent desktop/mobile review.
- A large generated page, lecture material, or long note needs consistency checks.
- You want a second pass for accessibility, links, or code quality before committing.

Scale the number of subagents to the work. A small focused task may need none or one. A broad redesign, content migration, or cross-section update may use several. Do not hard-code a fixed number of subagents.

Prefer splitting subagents by responsibility, not by arbitrary file count:

- Context scout: map relevant files, conventions, and existing patterns.
- Content reviewer: check Korean wording, headings, dates, links, and index coverage.
- UI reviewer: inspect layout risks, mobile behavior, visual consistency, and accessibility.
- Code reviewer: inspect JavaScript, CSS structure, generated files, and tooling impact.
- Verification runner: run or describe checks such as `npm run check`, link checks, and browser verification.

Give each subagent a narrow prompt with:

- The exact question to answer.
- The files or directories to inspect.
- Whether the subagent should only report findings or may suggest patches.
- The expected output format, such as findings ordered by severity.

The main agent remains responsible for synthesis and final edits:

- Decide which subagent findings are relevant.
- Avoid applying conflicting suggestions blindly.
- Keep ownership of final file edits, verification, staging, and commits.
- Do not let multiple agents rewrite the same files without a clear merge plan.
- Report any important subagent disagreement or unresolved risk to the user.

For this repository, subagents are especially useful before finishing large changes to `materials/`, generated HTML pages, shared CSS, navigation, or anything that affects mobile layout.

## Commit Rules

Every commit message must include an emoji.

Every commit message must include:

- A short subject line
- `Summary`
- `Description`
- `Verification`

Use this format:

```text
<emoji> <short summary>

Summary:
- Briefly list what changed.

Description:
- Explain why the change was made.
- Mention important implementation details.

Verification:
- List commands, browser checks, or manual checks performed.
```

Example:

```text
✨ Add cloud storage lecture index

Summary:
- Added a landing page for cloud storage lecture materials.
- Linked speaker notes and interactive tabs.

Description:
- Updated the materials index so visitors can find the lecture package from GitHub Pages.
- Reused existing static styling patterns.

Verification:
- Ran `python3 -m http.server 8000`.
- Ran configured formatting, linting, build, and test checks where available.
- Checked desktop and mobile layouts with `agent-browser`.
- Checked browser console errors.
```

## Git Safety

- Run `git status --short --branch` before staging or committing.
- Stage only files related to the current task.
- Do not commit generated screenshots unless the user asks for them.
- Do not use `git reset --hard`.
- Do not force push.
- Do not delete files or directories unless the task clearly requires it.
- If unrelated user changes exist, leave them untouched.

## Preferred Workflow

For normal site edits:

1. Inspect the relevant files.
2. Use subagents when parallel context, independent review, or specialized verification would improve the result.
3. Make the smallest clear change.
4. Update indexes and README if needed.
5. Run `npm run check`.
6. Run `npm run fix` when format or lint failures are related to the current task.
7. Run a local static server.
8. Verify desktop and mobile with `agent-browser`.
9. Check console errors.
10. Review `git diff`.
11. Commit only when the user asks.

## Notes For Future Agents

This is a personal study archive. Prioritize clarity, continuity, and maintainability over clever implementation.

The most common mistakes to avoid are:

- Adding a page but forgetting to link it from an index.
- Breaking GitHub Pages relative paths.
- Updating HTML but forgetting the matching Markdown source.
- Finishing visual changes without checking mobile.
- Claiming format, lint, build, or test checks passed when no such commands are configured.
- Mixing unrelated cleanup into a focused content change.
