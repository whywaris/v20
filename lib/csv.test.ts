import { test } from "node:test";
import assert from "node:assert/strict";
import { csvCell, csvRow } from "./csv.ts";

test("csv escaping and formula neutralizing", () => {
  assert.equal(csvCell(null), "");
  assert.equal(csvCell(12), "12");
  assert.equal(csvCell(-5), "-5"); // numbers stay numbers
  assert.equal(csvCell('He said "hi", ok'), '"He said ""hi"", ok"');
  assert.equal(csvCell("=HYPERLINK(1)"), "'=HYPERLINK(1)");
  assert.equal(csvCell(["a", "b"]), "a; b");
  assert.equal(csvRow(["x", "line\nbreak", true]), 'x,"line\nbreak",true');
});
