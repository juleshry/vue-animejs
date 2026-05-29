import { $ } from "bun"
import semver from "semver"
import { assertAdmin, intro, p } from "./cli"

// ── version bump ──────────────────────────────────────────────────────────────

intro("vue-animejs release")
await assertAdmin(["juleshry"])

const pkg = await Bun.file("package.json").json()
const current_version = pkg.version as string

const bump = await p.select({
  message: `Current version is v${current_version}. Select bump type:`,
  options: (["patch", "minor", "major"] as const).map(type => ({
    value: type,
    label: type,
    hint: `→ v${semver.inc(current_version, type)}`,
  })),
})

if (p.isCancel(bump)) {
  p.cancel("Cancelled.")
  process.exit(0)
}

const input_version = semver.inc(current_version, bump)!
const tag = `v${input_version}`

// ── changelog ─────────────────────────────────────────────────────────────────

const last_tag = (await $`git describe --tags --abbrev=0`.text().catch(() => "")).trim()

const raw_log = last_tag
  ? await $`git log ${last_tag}..HEAD --pretty=format:"%s"`.text()
  : await $`git log --pretty=format:"%s"`.text()

const commits = raw_log
  .split("\n")
  .map(l => l.trim())
  .filter(Boolean)

const GROUPS: Record<string, string> = {
  feat: "Features",
  fix: "Bug Fixes",
  core: "Core",
  perf: "Performance",
  refactor: "Refactors",
  docs: "Documentation",
  doc: "Documentation",
  build: "Build",
  chore: "Chores",
  test: "Tests",
  ci: "CI",
}

const grouped: Record<string, string[]> = {}
const other: string[] = []

for (const msg of commits) {
  const m = msg.match(/^(\w+)(?:\(.+?\))?!?:\s*(.+)$/)
  if (m) {
    const key = GROUPS[m[1]] ?? "Other"
    ;(grouped[key] ??= []).push(m[2])
  } else {
    other.push(msg)
  }
}

const section_order = Object.values(GROUPS).filter((v, i, a) => a.indexOf(v) === i)
section_order.push("Other")

let changelog = ""
for (const section of section_order) {
  const items = grouped[section]
  if (items?.length) {
    changelog += `### ${section}\n\n`
    changelog += items.map(i => `- ${i}`).join("\n")
    changelog += "\n\n"
  }
}
if (other.length) {
  changelog += `### Other\n\n`
  changelog += other.map(i => `- ${i}`).join("\n")
  changelog += "\n"
}

changelog = changelog.trim()

p.note(changelog || "(no commits since last tag)", "Changelog")

// ── confirm ───────────────────────────────────────────────────────────────────

const proceed = await p.confirm({ message: `Release ${tag}?` })

if (p.isCancel(proceed) || !proceed) {
  p.cancel("Cancelled.")
  process.exit(0)
}

// ── update package.json ───────────────────────────────────────────────────────

const spinner = p.spinner()

pkg.version = input_version
await Bun.write("package.json", JSON.stringify(pkg, null, 2) + "\n")

// ── format, commit, tag ───────────────────────────────────────────────────────

spinner.start("Formatting and committing")
await $`bun run format`.quiet()
await $`git add package.json`.quiet()
await $`git commit -m "chore: release ${tag}"`.quiet()
await $`git tag ${tag}`.quiet()
spinner.stop("Committed and tagged")

// ── push (first gate — branch protection may reject this) ─────────────────────

spinner.start(`Pushing ${tag} to origin`)
try {
  await $`git push origin main`.quiet()
  await $`git push origin ${tag}`.quiet()
} catch (err) {
  spinner.stop("Push failed")
  p.cancel(`Could not push to origin. Check your permissions on main.\n${err}`)
  process.exit(1)
}
spinner.stop(`Pushed ${tag}`)

// ── github release ────────────────────────────────────────────────────────────

spinner.start("Creating GitHub release")
const notes = changelog || `Release ${tag}`
await $`gh release create ${tag} --title ${tag} --notes ${notes}`.quiet()
spinner.stop(`GitHub release ${tag} created`)

// ── optional netlify deploy ───────────────────────────────────────────────────

const deploy = await p.confirm({ message: "Deploy docs to Netlify?", initialValue: false })

if (!p.isCancel(deploy) && deploy) {
  spinner.start("Deploying docs")
  await $`bun run deploy:docs`
  spinner.stop("Docs deployed")
}

p.outro("Done.")