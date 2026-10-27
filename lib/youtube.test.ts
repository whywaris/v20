import { test } from "node:test";
import assert from "node:assert/strict";
import { parseChannelInput, parseDuration } from "./youtube.ts";

test("parseChannelInput handles URLs, handles and ids", () => {
  const id = "UC" + "a".repeat(22);
  assert.deepEqual(parseChannelInput("https://www.youtube.com/@eliasyoderamish"), { handle: "eliasyoderamish" });
  assert.deepEqual(parseChannelInput("https://youtube.com/@doctorlaura-e1w1o/videos"), { handle: "doctorlaura-e1w1o" });
  assert.deepEqual(parseChannelInput("@chloevshistory"), { handle: "chloevshistory" });
  assert.deepEqual(parseChannelInput("dr.elenasantos"), { handle: "dr.elenasantos" });
  assert.deepEqual(parseChannelInput(`https://www.youtube.com/channel/${id}`), { id });
  assert.deepEqual(parseChannelInput(id), { id });
  assert.deepEqual(parseChannelInput("https://www.youtube.com/user/someone"), { username: "someone" });
  assert.equal(parseChannelInput("https://www.youtube.com/c/legacy"), null);
  assert.equal(parseChannelInput(""), null);
});

test("parseDuration", () => {
  assert.equal(parseDuration("PT1H2M3S"), 3723);
  assert.equal(parseDuration("PT59S"), 59);
  assert.equal(parseDuration("PT20M"), 1200);
  assert.equal(parseDuration("P1DT1S"), 86401);
  assert.equal(parseDuration("P0D"), 0);
});
