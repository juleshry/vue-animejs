import { $ } from "bun"
import * as p from "@clack/prompts"

const LOGO = `
--------********        *****@@@@@@@@#-
 --------********      **@@@@@@@@@@@@@@@@@
   -------********    @@@@@@@@@@@@@@@@@@@@@@@
    -------+******* @@@@@@@@@@@@@@@@@@@@@@========
     -------=******@@@@@@#*--------      @========
      --------****@@@@@%**--------      @@=======@
       --------**@@@@@@**-----@@@@@@@@@ @@@@@@@@@
        --------*@@@@@@@@@@@@@@@@@@@@@@       @@@@
         -------=@@@@@@+-------      @@       @@@@
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

export function intro(title: string): void {
  console.log(LOGO)
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