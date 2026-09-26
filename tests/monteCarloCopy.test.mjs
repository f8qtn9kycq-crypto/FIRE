import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const riskSource = await readFile(new URL("../src/components/Risk.jsx", import.meta.url), "utf8");
const guideSource = await readFile(new URL("../src/components/FormulaGuide.jsx", import.meta.url), "utf8");

test("risk copy separates the deterministic threshold, Monte Carlo check, and historical calibration", () => {
  assert.match(riskSource, /FIRE 門檻先回答是否達到目標/);
  assert.match(riskSource, /簡化均勻模型檢查不確定性/);
  assert.match(riskSource, /不是歷史市場校準、真實成功機率或保證/);
});

test("formula guide exposes the model identifier, bounded uniform sampling, and limitations", () => {
  assert.match(guideSource, /SIMPLE_MODEL_ID/);
  assert.match(guideSource, /固定種子均勻抽樣/);
  assert.match(guideSource, /未用台灣或全球歷史資料校準/);
  assert.match(guideSource, /極端跌幅/);
});
