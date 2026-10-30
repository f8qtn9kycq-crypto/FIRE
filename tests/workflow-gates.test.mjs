import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const source = readFileSync(new URL('../.github/workflows/project-auto-add.yml', import.meta.url), 'utf8');
function evaluate(variable, pages, sha = 'a'.repeat(40)) {
  const command = source.match(new RegExp(`${variable}="\\$\\(([\\s\\S]*?)\\)"`))?.[1];
  assert.ok(command, `${variable} 必須存在`);
  const body = 'gh() { cat; }\n' + command;
  const result = spawnSync('bash', ['-c', body], {
    input: JSON.stringify(pages), encoding: 'utf8',
    env: { ...process.env, GITHUB_REPOSITORY: 'fixture/repo', head_sha: sha, target_number: '1' },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim() === 'true';
}
const check = (id = 1, overrides = {}) => ({
  id, name: 'build', head_sha: 'a'.repeat(40), app: { slug: 'github-actions' },
  status: 'completed', conclusion: 'success', ...overrides,
});

test('Project gate 僅接受目前 head、GitHub Actions 最新成功 Build，涵蓋分頁', () => {
  for (const [pages, expected] of [
    [[{ check_runs: [check()] }], true],
    [[{ check_runs: [] }, { check_runs: [check()] }], true],
    [[{ check_runs: [check(), check(2, { conclusion: 'failure' })] }], false],
    [[{ check_runs: [check(), check(2, { status: 'in_progress', conclusion: null })] }], false],
    [[{ check_runs: [check(1, { head_sha: 'b'.repeat(40) })] }], false],
    [[{ check_runs: [check(1, { app: { slug: 'other' } })] }], false],
    [[{ check_runs: [] }], false],
  ]) assert.equal(evaluate('has_build', pages), expected);
});

const review = (state, submitted_at, login = 'reviewer') => ({ state, submitted_at, user: { login } });
test('COMMENTED 不解除 requested changes，APPROVED 或 DISMISSED 才解除，涵蓋分頁', () => {
  for (const [pages, expected] of [
    [[[review('CHANGES_REQUESTED', '1'), review('COMMENTED', '2')]], true],
    [[[review('CHANGES_REQUESTED', '1')], [review('COMMENTED', '2')]], true],
    [[[review('CHANGES_REQUESTED', '1'), review('APPROVED', '2')]], false],
    [[[review('CHANGES_REQUESTED', '1'), review('DISMISSED', '2')]], false],
    [[[review('APPROVED', '1'), review('CHANGES_REQUESTED', '2')]], true],
    [[[]], false],
  ]) assert.equal(evaluate('has_changes', pages), expected);
});

test('Project gate 的查詢保留分頁與 latest 篩選', () => {
  assert.match(source, /check-runs\?per_page=100&filter=latest" --paginate --slurp/);
  assert.match(source, /reviews\?per_page=100" --paginate --slurp/);
});
