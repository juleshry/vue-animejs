import { $ } from "bun"
import semver from "semver"
import { assertAdmin, intro, p, runVisible } from "./cli"

// ── version bump ──────────────────────────────────────────────────────────────

intro("vue-animejs release")

if (!Bun.which("gh")) {
  p.log.info("Install it with: brew install gh")
  p.cancel("GitHub CLI (gh) is not installed.")
  process.exit(1)
}

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

pkg.version = input_version
await Bun.write("package.json", JSON.stringify(pkg, null, 2) + "\n")

const notes = changelog || `Release ${tag}`

// ── rollback helpers ──────────────────────────────────────────────────────────

let committed = false
let tagged = false
let pushed = false

// Must be synchronous — async functions are not awaited in exit handlers
function rollback(): void {
  if (pushed) return
  if (tagged) Bun.spawnSync(["git", "tag", "-d", tag])
  if (committed) {
    Bun.spawnSync(["git", "reset", "HEAD~1"])
    Bun.spawnSync(["git", "restore", "package.json"])
  }
}

// Fires synchronously before the process dies, including on Ctrl+C via clack
process.on("exit", rollback)

// ── steps ─────────────────────────────────────────────────────────────────────

try {
  await p.tasks([
    {
      title: "Stage changes",
      task: async () => {
        await $`git add package.json`.quiet()
      },
    },
    {
      title: "Commit",
      task: async () => {
        await runVisible($`git commit -m "chore: release ${tag}"`)
        committed = true
      },
    },
    {
      title: "Tag",
      task: async () => {
        await $`git tag ${tag}`.quiet()
        tagged = true
      },
    },
    {
      title: "Push branch",
      task: async () => {
        await $`git push origin main`
        pushed = true
      },
    },
    {
      title: "Push tag",
      task: async () => {
        await $`git push origin ${tag}`
      },
    },
    {
      title: "Create GitHub release",
      task: async () => {
        await $`gh release create ${tag} --title ${tag} --notes ${notes}`
      },
    },
  ])
} catch (err) {
  p.cancel(`Release failed: ${err}`)
  process.exit(1)
}

process.removeListener("exit", rollback)

// ── optional netlify deploy ───────────────────────────────────────────────────

const deploy = await p.confirm({ message: "Deploy docs to Netlify?", initialValue: false })

if (!p.isCancel(deploy) && deploy) {
  await p.tasks([
    {
      title: "Deploy docs to Netlify",
      task: async () => {
        await $`bun run deploy:docs`
      },
    },
  ])
}

p.outro("Done.")