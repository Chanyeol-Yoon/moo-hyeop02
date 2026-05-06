import { cp, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const backendRoot = resolve(__dirname, '..')
const backendStandaloneServer = resolve(backendRoot, 'dist', 'standalone', 'server.js')
const frontendRootCandidates = [
  resolve(backendRoot, 'frontend'),
  resolve(backendRoot, '..', 'frontend'),
  resolve(backendRoot, '..', '..', 'frontend'),
]

const frontendRoot = frontendRootCandidates.find((candidate) =>
  existsSync(resolve(candidate, 'package.json')),
)

if (!frontendRoot) {
  if (existsSync(backendStandaloneServer)) {
    console.log(
      'Frontend source not found. Using committed backend/dist/standalone bundle instead.',
    )
    process.exit(0)
  }

  throw new Error(
    `Could not locate frontend package.json. Tried: ${frontendRootCandidates.join(', ')}. Also could not find ${backendStandaloneServer}.`,
  )
}

const frontendDist = resolve(frontendRoot, 'dist')
const backendDist = resolve(backendRoot, 'dist')

dotenv.config({ path: resolve(backendRoot, '.env') })

execSync('npm install', {
  cwd: frontendRoot,
  env: process.env,
  stdio: 'inherit',
  shell: true,
})

execSync('npm run build', {
  cwd: frontendRoot,
  env: process.env,
  stdio: 'inherit',
  shell: true,
})

await rm(backendDist, { recursive: true, force: true })
await cp(resolve(frontendDist), backendDist, { recursive: true })
await mkdir(resolve(backendDist, 'standalone', '.next'), { recursive: true })
await mkdir(resolve(backendDist, 'standalone', 'dist', 'static'), { recursive: true })

await cp(resolve(frontendDist, 'standalone'), resolve(backendDist, 'standalone'), {
  recursive: true,
})

await cp(resolve(frontendDist, 'static'), resolve(backendDist, 'standalone', '.next', 'static'), {
  recursive: true,
})

await cp(resolve(frontendDist, 'static'), resolve(backendDist, 'standalone', 'dist', 'static'), {
  recursive: true,
})

await cp(resolve(frontendRoot, 'public'), resolve(backendDist, 'standalone', 'public'), {
  recursive: true,
})