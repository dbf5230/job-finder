import fs from "node:fs";

const API_URL = "https://apis.data.go.kr/1051000/recruitment/list";
const MAX_JOBS = 300;
const YOUTH_INTERN_CODES = ["R1050", "R1060", "R1070"];

function readEnvKey() {
  const envPath = new URL("../.env", import.meta.url);
  const envText = fs.readFileSync(envPath, "utf8");
  const line = envText
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith("RECRUITMENT_API_KEY="));
  if (!line) throw new Error("RECRUITMENT_API_KEY가 .env에 없습니다.");
  const rawValue = line.slice(line.indexOf("=") + 1).trim().replace(/^['"]|['"]$/g, "");
  if (!rawValue) throw new Error("RECRUITMENT_API_KEY가 비어 있습니다.");
  return decodeURIComponent(rawValue);
}

async function fetchPage(serviceKey, extraParams) {
  const params = new URLSearchParams({
    serviceKey,
    resultType: "json",
    ongoingYn: "Y",
    numOfRows: String(MAX_JOBS),
    pageNo: "1",
    ...extraParams,
  });
  const response = await fetch(`${API_URL}?${params}`);
  const payload = await response.json();
  if (!response.ok || payload.resultCode !== 200) {
    const message = payload?.OpenAPI_ServiceResponse?.cmmMsgHeader?.returnAuthMsg
      ?? payload?.resultMsg
      ?? response.statusText;
    throw new Error(`채용정보 API 오류: ${message}`);
  }
  return Array.isArray(payload.result) ? payload.result : [];
}

function removeContactFields(value) {
  if (Array.isArray(value)) return value.map(removeContactFields);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !/(담당|manager|contact|email|mail|전화|phone|tel|연락)/i.test(key))
      .map(([key, item]) => [key, removeContactFields(item)]),
  );
}

const serviceKey = readEnvKey();
const [newJobs, youthInternJobs] = await Promise.all([
  fetchPage(serviceKey, { recrutSe: "R2010" }),
  fetchPage(serviceKey, { hireTypeLst: YOUTH_INTERN_CODES.join(",") }),
]);

const byId = new Map();
for (const job of [...newJobs, ...youthInternJobs]) {
  if (job?.recrutPblntSn != null) byId.set(String(job.recrutPblntSn), job);
}

const jobs = [...byId.values()]
  .sort((a, b) => String(b.pbancBgngYmd ?? "").localeCompare(String(a.pbancBgngYmd ?? ""))
    || Number(b.recrutPblntSn ?? 0) - Number(a.recrutPblntSn ?? 0))
  .slice(0, MAX_JOBS)
  .map(removeContactFields);

fs.writeFileSync(new URL("../jobs.json", import.meta.url), `${JSON.stringify(jobs, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ newJobs: newJobs.length, youthInternJobs: youthInternJobs.length, saved: jobs.length }));
