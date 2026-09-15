import { $ } from "bun"
import * as p from "@clack/prompts"

const LOGO = `
--------********        *****@@@@@@@@#-
 --------********      **@@@@@@@@@@@@@@@@@
   -------********    @@@@@@@@@@@@@@@@@@@@@@@
    -------******** @@@@@@@@@@@@@@@@@@@@@@@========
     --------******@@@@@@#*--------      @========
      --------****@@@@@%**--------      @========
       --------**@@@@@@**-----@@@@@@@@@ @@@@@@@@@
        --------*@@@@@@@@@@@@@@@@@@@@@@       @@@@
         -------@@@@@@@+-------      @@       @@@@
          ------%@@@@@--------               @@@@@
           -----+@@@@--------@@@@@@@@@       @@@@@
            -----@@@@-------@@@@@@@@@@       @@@@@
             ----@@@@------ @@@@@@@@@        @@@@@
              ----@@@@----           @      @@@@@
               ----@@@@@@         @@@%      @@@@
                ----+@@@@@@@@@@@@@@@@@@@@@@@@@@
                 -----@@@@@@@@@@@@@@@@@@@@@@@
                  ---   @@@@@@@@@@@@@@@@@@@
                   -       @@@@@@@@@@@@@
`

// Sampled from docs/src/public/icon.png: the Vue green + navy "V" behind the black "ai" mark, red accent square.
const GREEN = "65;184;131"
const NAVY = "53;73;94"
const RED = "251;71;73"

function paint(rgb: string, text: string): string {
  return `\x1b[38;2;${rgb}m${text}\x1b[0m`
}

const COLORED_LOGO = LOGO.replace(/-+/g, m => paint(GREEN, m))
  .replace(/\*+/g, m => paint(NAVY, m))
  .replace(/=+/g, m => paint(RED, m))

export function intro(title: string): void {
  console.log(COLORED_LOGO)
  p.intro(title)
}

export async function assertAdmin(allowed: string[]): Promise<void> {
  let gh_user: string
  try {
    gh_user = (await $`gh api user --jq .login`.quiet().text()).trim()
  } catch {
    p.log.warn("Not authenticated with GitHub CLI. Launching gh auth login…")
    await $`gh auth login`.quiet(false)
    gh_user = (await $`gh api user --jq .login`.quiet().text()).trim()
  }
  if (!allowed.includes(gh_user)) {
    p.cancel(`Unauthorized: ${gh_user} is not allowed to run this script.`)
    process.exit(1)
  }
}

/** Stream a command's output live in dim text, then erase it when done. */
export async function runVisible(cmd: { lines(): AsyncIterable<string> }): Promise<void> {
  let line_count = 0
  for await (const line of cmd.lines()) {
    if (line.trim()) {
      process.stdout.write(`  \x1b[2m${line}\x1b[0m\n`)
      line_count++
    }
  }
  if (line_count > 0) {
    process.stdout.write(`\x1b[${line_count}A\x1b[0J`)
  }
}

export { p }