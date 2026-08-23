"use client";

/* The carousel card is an article so its semantic content remains discoverable while it supports keyboard selection. */
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */

import { useMemo, useState } from "react";
import recruitmentData from "../jobs.json";

type View = "지원 가능" | "제외된 공고" | "관심 공고";
type JobType = "" | "인턴" | "신입";
type Job = {
  id: number; company: string; title: string; location: string; deadline: string; deadlineLabel: string; type: JobType; mode: string; isGame: boolean; devPrimary: boolean;
  eligibility: { firstYear: boolean; graduateOnly: boolean; experienceRequired: boolean };
  responsibilities: string[]; qualification: string[]; summary: string; source: string;
};

type Recruitment = {
  recrutPblntSn?: number;
  instNm?: string;
  recrutPbancTtl?: string;
  workRgnNmLst?: string;
  pbancEndYmd?: string;
  decimalDay?: number;
  hireTypeNmLst?: string;
  recrutSeNm?: string;
  ncsCdNmLst?: string;
  aplyQlfcCn?: string;
  srcUrl?: string;
};

const asText = (value: unknown) => typeof value === "string" ? value : "";
const formatDate = (value: string) => /^\d{8}$/.test(value) ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}` : "";
const formatDeadlineLabel = (date: string, decimalDay?: number) => {
  if (!date) return "";
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  const days = typeof decimalDay === "number" ? ` · D-${decimalDay}` : "";
  return `${month}월 ${day}일${days}`;
};
const splitLines = (value: string) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const jobs: Job[] = (recruitmentData as Recruitment[]).map((item, index) => {
  const company = asText(item.instNm);
  const title = asText(item.recrutPbancTtl);
  const location = asText(item.workRgnNmLst);
  const deadline = formatDate(asText(item.pbancEndYmd));
  const qualifications = asText(item.aplyQlfcCn);
  const type: JobType = asText(item.hireTypeNmLst).includes("인턴") ? "인턴" : asText(item.recrutSeNm).includes("신입") ? "신입" : "";
  const searchable = `${title} ${asText(item.ncsCdNmLst)}`;
  const devPrimary = /(개발|소프트웨어|정보통신|전산|프로그래|데이터|인공지능|AI|웹|앱|시스템|IT|클라우드)/i.test(searchable);
  const graduateOnly = /(졸업자|졸업예정자|졸업 예정자)/.test(qualifications) && !/(재학생|대학생)/.test(qualifications);
  const experienceRequired = /(경력\s*필수|경력자\s*필수|경력\s*\d+년|유관\s*경력)/.test(qualifications);
  return {
    id: Number(item.recrutPblntSn ?? index + 1), company, title, location, deadline,
    deadlineLabel: formatDeadlineLabel(deadline, item.decimalDay), type, mode: "",
    isGame: /게임|game/i.test(searchable), devPrimary,
    eligibility: { firstYear: !graduateOnly && !experienceRequired, graduateOnly, experienceRequired },
    responsibilities: [], qualification: splitLines(qualifications), summary: "", source: asText(item.srcUrl),
  };
});

const regionRank: Record<string, number> = { "서울·수도권": 0, "판교·경기": 0, "대전": 1, "세종": 2, "충남": 3 };
const today = new Date("2026-08-24T00:00:00");
const isGame = (job: Job) => job.isGame;
const isEligible = (job: Job) => job.devPrimary && Object.keys(regionRank).some((region) => job.location.includes(region.split("·")[0])) && job.eligibility.firstYear && !job.eligibility.graduateOnly && !job.eligibility.experienceRequired;
const exclusionReason = (job: Job) => !job.devPrimary ? "소프트웨어·서비스 개발이 주된 업무가 아님" : !job.eligibility.firstYear ? "1학년 지원 불가" : job.eligibility.graduateOnly ? "졸업자 또는 졸업예정자만 지원 가능" : job.eligibility.experienceRequired ? "경력 보유가 필수" : "지원 가능 지역 외 근무지";
const daysUntil = (deadline: string) => deadline ? Math.round((new Date(`${deadline}T00:00:00`).getTime() - today.getTime()) / 86400000) : null;
const deadlineStatus = (deadline: string) => { const days = daysUntil(deadline); return days === null ? "" : days >= 0 ? "접수 중" : "마감"; };

export default function Home() {
  const [view, setView] = useState<View>("지원 가능");
  const [typeFilter, setTypeFilter] = useState<"전체" | JobType>("전체");
  const [sort, setSort] = useState<"priority" | "deadline">("priority");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const [savedAt, setSavedAt] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const visibleJobs = useMemo(() => {
    let next = jobs.filter((job) => view === "제외된 공고" ? !isEligible(job) : view === "관심 공고" ? Boolean(savedAt[job.id]) : isEligible(job));
    if (typeFilter !== "전체") next = next.filter((job) => job.type === typeFilter);
    if (search.trim()) next = next.filter((job) => `${job.company} ${job.title} ${job.location}`.toLowerCase().includes(search.trim().toLowerCase()));
    return next.sort((a, b) => view === "관심 공고" ? (savedAt[b.id] ?? 0) - (savedAt[a.id] ?? 0) : sort === "priority" ? Number(isGame(b)) - Number(isGame(a)) || (regionRank[a.location] ?? 9) - (regionRank[b.location] ?? 9) || a.deadline.localeCompare(b.deadline) : a.deadline.localeCompare(b.deadline));
  }, [view, typeFilter, sort, search, savedAt]);
  const selectedJob = selectedId ? jobs.find((job) => job.id === selectedId) ?? null : null;
  const activeJob = visibleJobs[slide] ?? visibleJobs[0] ?? null;
  const selectJob = (job: Job) => { setSelectedId(job.id); setSlide(Math.max(0, visibleJobs.findIndex((item) => item.id === job.id))); };
  const toggleSaved = (id: number) => setSavedAt((current) => { const next = { ...current }; if (next[id]) delete next[id]; else next[id] = Date.now(); return next; });
  const moveSlide = (direction: number) => { if (visibleJobs.length) setSlide((current) => (current + direction + visibleJobs.length) % visibleJobs.length); };
  const countFor = (target: View) => target === "지원 가능" ? jobs.filter(isEligible).length : target === "제외된 공고" ? jobs.filter((job) => !isEligible(job)).length : Object.keys(savedAt).length;

  return <main className={selectedJob ? "app-shell detail-open" : "app-shell"}>
    <header className="topbar"><a className="wordmark" href="#top"><span>J</span>잡픽</a><div className="student-chip"><span className="status-dot" /> 충남대학교 컴퓨터인공지능학부 · 1학년</div><div className="top-actions"><button type="button" className="ghost-button">프로필 설정</button><div className="avatar">김</div></div></header>
    <section className="intro" id="top"><div><p className="eyebrow">TODAY&apos;S JOB RADAR</p><h1>지금, <em>지원할 수 있는</em><br />공고만 골라봤어요.</h1><p className="intro-copy">개발이 주된 업무인지, 1학년도 지원할 수 있는지<br />공고에 적힌 조건으로 먼저 확인해요.</p></div><div className="intro-note"><span>추천 기준</span><strong>게임 · 지역 · 마감일</strong><p>공고 원문에 적힌 데이터만 사용해<br />지원 가능 여부를 판정합니다.</p></div></section>
    <section className="workspace" aria-label="채용공고 탐색">
      <aside className="sidebar"><div className="sidebar-title"><span>공고 목록</span><b>{visibleJobs.length}</b></div><div className="view-tabs">{(["지원 가능", "제외된 공고", "관심 공고"] as View[]).map((item) => <button key={item} type="button" className={view === item ? "active" : ""} onClick={() => { setView(item); setSlide(0); setSelectedId(null); }}>{item}<span>{countFor(item)}</span></button>)}</div><div className="sidebar-filters"><label htmlFor="search">공고 검색</label><div className="search-input"><span>⌕</span><input id="search" value={search} onChange={(event) => { setSearch(event.target.value); setSlide(0); }} placeholder="회사, 직무, 지역" /></div><label htmlFor="type-filter">모집 형태</label><div className="segmented">{(["전체", "인턴", "신입"] as const).map((item) => <button id={item === "전체" ? "type-filter" : undefined} key={item} type="button" className={typeFilter === item ? "selected" : ""} onClick={() => { setTypeFilter(item); setSlide(0); }}>{item}</button>)}</div></div></aside>
      <div className="carousel-panel"><div className="panel-heading"><div><p className="eyebrow">{view === "지원 가능" ? "APPLY NOW" : view === "제외된 공고" ? "CHECK CONDITIONS" : "SAVED JOBS"}</p><h2>{view}</h2></div><div className="sort-control"><label htmlFor="sort">정렬</label><select id="sort" value={sort} onChange={(event) => setSort(event.target.value as "priority" | "deadline")} disabled={view === "관심 공고"}><option value="priority">우선순위순</option><option value="deadline">마감일순</option></select></div></div>{activeJob ? <><div className="carousel-meta"><span>{slide + 1} / {visibleJobs.length}</span><div><button type="button" onClick={() => moveSlide(-1)} aria-label="이전 공고">←</button><button type="button" onClick={() => moveSlide(1)} aria-label="다음 공고">→</button></div></div><div className="carousel-window"><div className="carousel-track" style={{ transform: `translateX(calc(${slide} * -100%))` }}>{visibleJobs.map((job) => <article className={`job-card ${job.id === activeJob.id ? "active" : ""}`} key={job.id} role="button" tabIndex={0} onClick={() => selectJob(job)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") selectJob(job); }}><div className="card-top"><span className={`company-mark ${job.isGame ? "game" : ""}`}>{job.company.slice(0, 1)}</span><span className={job.isGame ? "game-label" : "match-label"}>{job.isGame ? "GAME" : "MATCH"}</span></div><p className="company">{job.company}</p><h3>{job.title}</h3><div className="card-meta"><span>⌖ {job.location}</span><span>◷ {job.deadlineLabel}</span></div><div className="card-bottom"><span className="type-pill">{job.type}</span><span className="mode-pill">{job.mode}</span><button type="button" className={savedAt[job.id] ? "save-button saved" : "save-button"} onClick={(event) => { event.stopPropagation(); toggleSaved(job.id); }} aria-label={`${job.company} 관심 공고 ${savedAt[job.id] ? "해제" : "저장"}`}>{savedAt[job.id] ? "저장됨" : "관심 공고 저장"}</button></div>{view === "제외된 공고" && <p className="excluded-reason">제외: {exclusionReason(job)}</p>}</article>)}</div></div><p className="carousel-hint">카드를 눌러 상세 내용을 확인하세요</p></> : <div className="empty"><strong>{view === "관심 공고" ? "저장한 공고가 아직 없어요" : "조건에 맞는 공고가 없어요"}</strong><span>다른 필터를 선택해보세요.</span></div>}</div>
      {selectedJob && <aside className="detail-panel"><div className="detail-top"><span className="eyebrow">JOB DETAIL</span><button type="button" className="close-detail" onClick={() => setSelectedId(null)} aria-label="상세 닫기">×</button></div><div className="detail-company"><span className={`company-mark large ${selectedJob.isGame ? "game" : ""}`}>{selectedJob.company.slice(0, 1)}</span><div><b>{selectedJob.company}</b><span>{selectedJob.location}</span></div></div><h2>{selectedJob.title}</h2><p className="detail-summary">{selectedJob.summary}</p><div className="detail-status"><span className={isEligible(selectedJob) ? "status-ok" : "status-no"}>{isEligible(selectedJob) ? "지원 가능" : "지원 제외"}</span><span>{selectedJob.deadlineLabel}</span></div><div className="detail-grid"><div><span>개발 중심 업무</span><strong>{selectedJob.devPrimary ? "예 · 주된 업무" : "아니오"}</strong></div><div><span>모집 형태</span><strong>{selectedJob.type}</strong></div><div><span>근무 방식</span><strong>{selectedJob.mode}</strong></div><div><span>접수 상태</span><strong>{deadlineStatus(selectedJob.deadline)}</strong></div></div><section className="detail-section"><h3>주요 업무</h3><ul>{selectedJob.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="detail-section"><h3>지원 자격</h3><ul>{selectedJob.qualification.map((item) => <li key={item}>{item}</li>)}</ul></section>{!isEligible(selectedJob) && <div className="reason-box"><b>지원 제외 이유</b><span>{exclusionReason(selectedJob)}</span></div>}<div className="detail-actions"><button type="button" className={savedAt[selectedJob.id] ? "saved-action" : ""} onClick={() => toggleSaved(selectedJob.id)}>{savedAt[selectedJob.id] ? "★ 관심 공고 저장됨" : "☆ 관심 공고 저장"}</button><a href={selectedJob.source || undefined} target="_blank" rel="noreferrer">원문 공고 보기 ↗</a></div></aside>}
    </section><footer><span className="wordmark"><span>J</span>잡픽</span><p>공고에 적힌 조건으로, 첫 지원을 더 가볍게.</p><small>© 2026 JOBPICK</small></footer>
  </main>;
}
