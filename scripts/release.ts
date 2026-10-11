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

const PRERELEASE_ID = "beta"

const channel = await p.select({
  message: `Current version is v${current_version}. Select release type:`,
  options: [
    { value: "beta", label: "beta", hint: "prerelease, published under the beta npm tag" },
    ...versionOptions(["patch", "minor", "major"]),
  ],
})

if (p.isCancel(channel)) {
  p.cancel("Cancelled.")
  process.exit(0)
}

const bump = channel === "beta" ? await selectBetaBump() : channel

const input_version = semver.inc(current_version, bump, PRERELEASE_ID)!
const tag = `v${input_version}`
const is_prerelease = semver.prerelease(input_version) !== null

const branch = (await $`git rev-parse --abbrev-ref HEAD`.text()).trim()

// The publish workflow builds the tagged commit, so a stable release from another branch would ship unmerged code
if (!is_prerelease && branch !== "main") {
  p.cancel(`Stable releases must be cut from main (current branch: ${branch}).`)
  process.exit(1)
}

// ── changelog ─────────────────────────────────────────────────────────────────

// A stable release lists everything since the previous stable one, skipping intermediate beta tags
const describe_flags = is_prerelease ? [] : ["--exclude", "*-*"]
const last_tag = (await $`git describe --tags --abbrev=0 ${describe_flags}`.text().catch(() => "")).trim()

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
        await $`git tag -s ${tag} -m ${tag}`.quiet()
        tagged = true
      },
    },
    {
      title: "Push branch",
      task: async () => {
        await $`git push origin ${branch}`
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
        const release_flags = is_prerelease ? ["--prerelease"] : []
        await $`gh release create ${tag} --title ${tag} --notes ${notes} ${release_flags}`
      },
    },
  ])
} catch (err) {
  p.cancel(`Release failed: ${err}`)
  process.exit(1)
}

process.removeListener("exit", rollback)

// ── optional netlify deploy ───────────────────────────────────────────────────

// The docs site documents the latest stable version, so betas never deploy it
if (is_prerelease) {
  p.log.info("Beta release: skipping docs deploy.")
} else {
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
}

p.outro("Done.")

// ── helpers ───────────────────────────────────────────────────────────────────

function versionOptions(types: semver.ReleaseType[]): { value: semver.ReleaseType; label: string; hint: string }[] {
  return types.map(type => ({
    value: type,
    label: type,
    hint: `→ v${semver.inc(current_version, type, PRERELEASE_ID)}`,
  }))
}

async function selectBetaBump(): Promise<semver.ReleaseType> {
  const beta_types: semver.ReleaseType[] = ["prepatch", "preminor", "premajor"]
  // Only offered from a prerelease: from a stable version it would behave like prepatch
  if (semver.prerelease(current_version)) beta_types.unshift("prerelease")

  const beta_bump = await p.select({
    message: "Select beta bump type:",
    options: versionOptions(beta_types),
  })

  if (p.isCancel(beta_bump)) {
    p.cancel("Cancelled.")
    process.exit(0)
  }

  return beta_bump
}