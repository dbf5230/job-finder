import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("renders a real recruitment from jobs.json", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const [html, jobsText] = await Promise.all([
    response.text(),
    readFile(new URL("../jobs.json", import.meta.url), "utf8"),
  ]);
  const jobs = JSON.parse(jobsText);
  assert.ok(jobs.length > 0);
  assert.match(html, /잡픽/);
  const displayed = jobs.find((job) => job.recrutPbancTtl && html.includes(job.recrutPbancTtl));
  assert.ok(displayed);
  assert.match(html, new RegExp(escapeRegExp(displayed.recrutPbancTtl)));
  assert.match(html, /관심 공고 저장/);
  assert.doesNotMatch(html, /스마일게이트|넥슨|토스/);
});

test("keeps contact fields out of the loaded jobs", async () => {
  const jobs = JSON.parse(await readFile(new URL("../jobs.json", import.meta.url), "utf8"));
  const keys = new Set();
  const collect = (value) => {
    if (Array.isArray(value)) return value.forEach(collect);
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      keys.add(key);
      collect(child);
    }
  };
  collect(jobs);
  assert.deepEqual(
    [...keys].filter((key) => /(담당|manager|contact|email|mail|전화|phone|tel|연락)/i.test(key)),
    [],
  );
});
