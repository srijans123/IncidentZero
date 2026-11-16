#!/usr/bin/env node
// scripts/deploy-pages.mjs — builds the frontend and publishes it to the `gh-pages` branch,
// which is the branch https://srijans123.github.io/IncidentZero/ is served from.
// Works the same on Windows, macOS and Linux (replaces upload/deploy_gh_pages.sh).
//
//   node scripts/deploy-pages.mjs            build + push
//   node scripts/deploy-pages.mjs --dry      build + lay out the site in .pages-build/, do not push
//
// Layout on gh-pages:  /            -> the landing page (landing.html, copied to index.html)
//                      /app.html    -> the React app
//                      /version.txt -> commit and time of this build, to check what is live
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FRONT = path.join(ROOT, 'frontend'), DIST = path.join(FRONT, 'dist'), SITE = path.join(ROOT, '.pages-build');
const dry = process.argv.includes('--dry');
const run = (cmd, args, cwd = ROOT) => execFileSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
const out = (cmd, args, cwd = ROOT) => execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim();

const sha = out('git', ['rev-parse', 'HEAD']);
const remote = process.env.PAGES_REMOTE || out('git', ['remote', 'get-url', 'origin']);

console.log('==> building frontend at', sha.slice(0, 7));
if (!fs.existsSync(path.join(FRONT, 'node_modules'))) run('npm', ['ci'], FRONT);
run('npm', ['run', 'build'], FRONT);

fs.rmSync(SITE, { recursive: true, force: true });
fs.cpSync(DIST, SITE, { recursive: true });
const landing = fs.existsSync(path.join(ROOT, 'landing.html')) ? path.join(ROOT, 'landing.html') : path.join(DIST, 'landing.html');
if (!fs.existsSync(path.join(SITE, 'app.html'))) fs.copyFileSync(path.join(DIST, 'index.html'), path.join(SITE, 'app.html'));
fs.copyFileSync(landing, path.join(SITE, 'index.html'));
fs.copyFileSync(landing, path.join(SITE, 'landing.html'));
fs.writeFileSync(path.join(SITE, '.nojekyll'), '');
fs.writeFileSync(path.join(SITE, 'version.txt'), `${sha}\n${new Date().toISOString()}\n`);

const app = fs.readFileSync(path.join(SITE, 'app.html'), 'utf8');
if (!/<div id="root">/.test(app)) throw new Error('app.html is not the React app');
if (!/Launch Full App/.test(fs.readFileSync(path.join(SITE, 'index.html'), 'utf8'))) throw new Error('index.html is not the landing page');
console.log('==> site laid out in', SITE);
if (dry) process.exit(0);

run('git', ['init', '-q'], SITE);
run('git', ['checkout', '-q', '-B', 'gh-pages'], SITE);
run('git', ['add', '-A'], SITE);
run('git', ['-c', 'user.name=pages-deploy', '-c', 'user.email=pages-deploy@users.noreply.github.com', 'commit', '-q', '-m', `deploy-${sha.slice(0, 7)}`], SITE);
run('git', ['push', '-f', remote, 'gh-pages'], SITE);
fs.rmSync(SITE, { recursive: true, force: true });
console.log(`\n==> pushed. In about a minute this must print ${sha.slice(0, 7)}:\n    https://srijans123.github.io/IncidentZero/version.txt`);
