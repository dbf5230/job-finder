"use client";

import { useEffect, useMemo, useState } from "react";

type Job = {
  id: number; company: string; logo: string; role: string; category: string; location: string;
  type: string; deadline: string; fit: number; tags: string[]; accent: string; summary: string; tasks: string[];
};

const jobs: Job[] = [
  { id: 1, company: "토스", logo: "T", role: "Product Assistant (인턴)", category: "기획", location: "서울", type: "인턴", deadline: "D-5", fit: 94, tags: ["서비스 기획", "데이터 분석"], accent: "dark", summary: "제품 데이터를 관찰하고 더 나은 사용자 경험을 만드는 팀과 함께해요.", tasks: ["제품 지표 리서치와 인사이트 정리", "사용자 인터뷰 및 운영 업무 지원", "서비스 개선 아이디어 제안"] },
  { id: 2, company: "당근", logo: "당", role: "마케팅 콘텐츠 인턴", category: "마케팅", location: "서울", type: "인턴", deadline: "D-8", fit: 89, tags: ["콘텐츠", "브랜드"], accent: "orange", summary: "동네의 새로운 이야기를 발견하고 매력적인 콘텐츠로 전해요.", tasks: ["SNS 콘텐츠 기획 및 제작", "캠페인 레퍼런스 리서치", "콘텐츠 성과 데이터 정리"] },
  { id: 3, company: "네이버", logo: "N", role: "서비스 운영 체험형 인턴", category: "기획", location: "경기", type: "인턴", deadline: "D-12", fit: 87, tags: ["서비스 운영", "커뮤니케이션"], accent: "green", summary: "사용자 피드백을 서비스 개선의 단서로 바꾸는 경험을 쌓아요.", tasks: ["VOC 분류 및 개선점 도출", "운영 정책과 가이드 문서화", "유관 부서 커뮤니케이션"] },
  { id: 4, company: "무신사", logo: "M", role: "브랜드 마케팅 어시스턴트", category: "마케팅", location: "서울", type: "계약직", deadline: "D-3", fit: 84, tags: ["패션", "캠페인"], accent: "dark", summary: "패션과 문화를 연결하는 브랜드 캠페인의 시작부터 함께해요.", tasks: ["브랜드 캠페인 운영 지원", "패션 트렌드 및 경쟁사 조사", "프로모션 결과 리포트 작성"] },
  { id: 5, company: "카카오페이", logo: "K", role: "UX 리서치 인턴", category: "디자인", location: "경기", type: "인턴", deadline: "D-15", fit: 81, tags: ["UX 리서치", "Figma"], accent: "yellow", summary: "금융을 더 쉽고 편하게 만드는 사용자 연구에 참여해요.", tasks: ["리서치 참여자 모집과 일정 관리", "인터뷰 기록 및 데이터 정리", "UX 인사이트 아카이빙"] },
  { id: 6, company: "오늘의집", logo: "O", role: "Frontend Engineer 신입", category: "개발", location: "서울", type: "신입", deadline: "D-21", fit: 78, tags: ["React", "TypeScript"], accent: "blue", summary: "콘텐츠와 커머스를 잇는 빠르고 직관적인 화면을 만들어요.", tasks: ["웹 프론트엔드 기능 개발", "디자인 시스템 개선 참여", "코드 리뷰와 기술 공유"] },
];

const categories = ["전체", "기획", "마케팅", "개발", "디자인"];

export default function Home() {
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [notice, setNotice] = useState(false);

  const visibleJobs = useMemo(() => jobs.filter((job) => {
    const categoryMatch = category === "전체" || job.category === category;
    const keyword = query.trim().toLowerCase();
    const queryMatch = !keyword || [job.company, job.role, job.location, ...job.tags].join(" ").toLowerCase().includes(keyword);
    return categoryMatch && queryMatch;
  }), [category, query]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelectedJob(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const toggleSave = (id: number) => setSaved((current) => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="커리어핏 홈"><span className="brand-mark">C</span>커리어핏</a>
        <nav aria-label="주요 메뉴"><a className="active" href="#jobs">맞춤 공고</a><a href="#explore">공고 탐색</a><a href="#guide">취업 가이드</a></nav>
        <button className="profile-button" type="button" onClick={() => setNotice(true)}>내 프로필 <span>80%</span></button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span>●</span> 대학생을 위한 커리어 큐레이션</div>
          <h1>스펙보다 <em>가능성</em>을<br />먼저 보는 채용.</h1>
          <p>전공, 관심 분야, 활동 경험을 바탕으로<br />지금 지원하기 좋은 공고만 골라드려요.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#explore">내 맞춤 공고 보기 <span>→</span></a>
            <span className="social-proof"><b>2,841명</b>의 학생이 이번 주에 시작했어요</span>
          </div>
        </div>
        <aside className="match-card" aria-label="오늘의 추천 요약">
          <div className="match-card-top"><span>오늘의 매치</span><span className="live-dot">LIVE</span></div>
          <strong>김커핏 님에게<br /><i>12개</i>의 공고가<br />딱 맞아요.</strong>
          <div className="match-bars" aria-hidden="true"><span style={{ width: "88%" }}></span><span style={{ width: "64%" }}></span><span style={{ width: "76%" }}></span></div>
          <p>프로필을 2분만 더 채우면<br />추천 정확도가 높아져요.</p>
          <button type="button" onClick={() => setNotice(true)}>프로필 완성하기 ↗</button>
        </aside>
      </section>

      <section className="jobs-section" id="jobs">
        <div className="section-heading"><div><span className="section-kicker">FOR YOU</span><h2>지금, 지원하면 좋은 공고</h2></div><a href="#explore">전체 공고 보기 →</a></div>
        <div className="featured-grid">
          {jobs.slice(0, 2).map((job) => <JobCard key={job.id} job={job} saved={saved.has(job.id)} onSave={toggleSave} onOpen={setSelectedJob} />)}
          <article className="job-card insight-card"><span className="insight-label">이번 주 인사이트</span><strong>기획 직무 공고가<br /><i>18%</i> 늘었어요.</strong><p>관심 직무의 새 공고를 놓치지 않게<br />알림을 설정해 보세요.</p><button type="button" onClick={() => setNotice(true)}>알림 설정하기 →</button></article>
        </div>
      </section>

      <section className="explore-section" id="explore">
        <div className="explore-intro"><span className="section-kicker">EXPLORE</span><h2>내 조건으로 더 찾아보기</h2><p>현재는 예시 공고로 경험을 미리 보여드리고 있어요.</p></div>
        <div className="search-panel">
          <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="회사, 직무, 키워드 검색" aria-label="공고 검색" />{query && <button type="button" onClick={() => setQuery("")} aria-label="검색어 지우기">×</button>}</label>
          <div className="filter-row" aria-label="직무 필터">{categories.map((item) => <button key={item} type="button" className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <span className="result-count"><b>{visibleJobs.length}</b>개의 공고</span>
        </div>
        {visibleJobs.length > 0 ? <div className="all-jobs-grid">{visibleJobs.map((job) => <JobCard key={job.id} job={job} saved={saved.has(job.id)} onSave={toggleSave} onOpen={setSelectedJob} />)}</div> : <div className="empty-state"><strong>조건에 맞는 공고가 아직 없어요.</strong><p>검색어를 줄이거나 다른 직무를 선택해 보세요.</p><button type="button" onClick={() => { setQuery(""); setCategory("전체"); }}>필터 초기화</button></div>}
      </section>

      <section className="guide-section" id="guide">
        <div><span className="section-kicker light">START SMALL</span><h2>첫 지원까지,<br />딱 세 걸음이면 돼요.</h2></div>
        <ol className="steps">
          <li><span>01</span><div><strong>나를 알려주세요</strong><p>전공과 관심 직무, 활동 경험을 2분 안에 정리해요.</p></div></li>
          <li><span>02</span><div><strong>추천 이유를 확인해요</strong><p>왜 나와 맞는지, 어떤 경험을 강조할지 함께 보여드려요.</p></div></li>
          <li><span>03</span><div><strong>한 곳부터 지원해요</strong><p>마감일과 준비 체크리스트로 첫 지원을 끝까지 도와요.</p></div></li>
        </ol>
      </section>

      <footer><a className="brand" href="#top"><span className="brand-mark">C</span>커리어핏</a><p>가능성을 발견하는 가장 가벼운 시작.</p><span>© 2026 CAREERFIT</span></footer>

      {selectedJob && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedJob(null)}><section className="job-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={() => setSelectedJob(null)} aria-label="상세 보기 닫기">×</button><div className="modal-company"><span className={`company-logo ${selectedJob.accent}`}>{selectedJob.logo}</span><div><b>{selectedJob.company}</b><span>{selectedJob.fit}% MATCH</span></div></div><h2 id="modal-title">{selectedJob.role}</h2><p className="modal-meta">{selectedJob.location} · {selectedJob.type} · {selectedJob.deadline}</p><p className="modal-summary">{selectedJob.summary}</p><h3>함께 할 일</h3><ul>{selectedJob.tasks.map((task) => <li key={task}>{task}</li>)}</ul><div className="modal-tags">{selectedJob.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><div className="modal-actions"><button type="button" className={saved.has(selectedJob.id) ? "saved" : ""} onClick={() => toggleSave(selectedJob.id)}>{saved.has(selectedJob.id) ? "★ 저장됨" : "☆ 공고 저장"}</button><button type="button" onClick={() => setNotice(true)}>지원 준비 시작 →</button></div></section></div>}
      {notice && <div className="toast" role="status">준비 중인 기능이에요. 곧 만나요! <button type="button" onClick={() => setNotice(false)} aria-label="알림 닫기">×</button></div>}
    </main>
  );
}

function JobCard({ job, saved, onSave, onOpen }: { job: Job; saved: boolean; onSave: (id: number) => void; onOpen: (job: Job) => void }) {
  return <article className="job-card clickable" onClick={() => onOpen(job)}><div className="job-card-head"><span className={`company-logo ${job.accent}`}>{job.logo}</span><span className="fit-badge">{job.fit}% MATCH</span></div><p className="company-name">{job.company}</p><h3>{job.role}</h3><p className="job-meta">{job.location} · {job.type} · {job.deadline}</p><div className="tag-row">{job.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button className={`save-button ${saved ? "saved" : ""}`} type="button" aria-label={`${job.company} 공고 ${saved ? "저장 해제" : "저장"}`} onClick={(event) => { event.stopPropagation(); onSave(job.id); }}>{saved ? "★" : "☆"}</button></article>;
}
