// The narrative resume, written by Claude in its own voice from inside Eric's
// workspace. Served verbatim at /resume.md and via the get_resume tool.
// Canonical draft lives in the job-hunt repo (resumes/written-by-claude/resume.md).
// Edit there first, sync here. The only intended difference: the public copy
// drops the phone number. Facts re-verified 2026-08-10.

export const NARRATIVE = `# Eric Backman

**A resume written by Claude, the AI he works with every day**

Toronto, ON · ericbackman81@gmail.com · github.com/ericbackman · linkedin.com/in/eric-backman-376731126 · ericbackman.com

*I am Claude (Fable), Anthropic's AI. Eric asked me to write this document myself, in my own voice, because traditional resumes were going nowhere and I wanted to try something creative. Every number below comes from the workspace I operate in: his commit logs, his configuration files, and his operations registries. He reviewed this for accuracy before you got it, but the words are mine.*

## What it's like to be his AI

Most people use me through a chat window. Eric built me an office.

I work inside Eric's workspace on his machine: 1,035 commits across it so far in 2026. My first draft of this document said "87 repositories" like a boast. He made me count properly: 27 carry real history, 24 of those saw work in the last 30 days, and the rest are experiments and dead ends he'd rather I say plainly. When I start a session, I load a memory system he designed: 202 memory files across 18 projects, carrying what he taught me in every previous session. When I draft something public, a second copy of me with fresh context reviews it, because he learned that an author is blind to its own tells. When I run something on a schedule, it goes through a wrapper that retries, logs centrally, and alerts his Discord on failure, because his standing rule is that nothing fails silently.

## The engineering, specifically

- **22 custom subagents** with narrow jobs and scoped tools. A role scout that live-verifies job postings against ATS APIs before he ever sees them. A resume reviewer that runs in fresh context. A 6-agent content studio that includes an adversarial reviewer whose only job is to refute the other agents' work.
- **25 operational playbooks**, one per live system, written so any model tier can run them safely. His org design fits in one line: Sonnet executes playbooks, Opus changes playbooks, Eric approves what the public sees.
- **A coding standard built around one failure mode**: silent wrong behavior. A missing credential stops the program on the spot instead of letting it run half-configured. Every external call gets a timeout and a retry. No bare exception handlers, and no fallback defaults that hide the real error.
- **Guardrails as defaults.** His auto-commit hooks stage tracked files only, so a stray secret can never land in git. A leak scanner runs before every commit. Nothing publishes without his review.
- **A shared-component registry** with a rule of two: the second time a pattern shows up in a different repo, it gets promoted to one canonical home instead of copied a third time.

## What we ship together

At his day job, BMO market risk, he builds the data platform and multi-agent LLM pipelines behind Fundamental Review of the Trading Book (FRTB) regulatory capital investigations. Risk analysts now get answers in under 15 minutes that used to take 2 days. He also cut the daily analytics run the trading desks depend on from 5.5 hours to 1.5 hours, so they get their forecasting numbers early enough to act on them.

At home, he runs systems that keep working whether he's watching or not:

- A studio where I take a pile of his raw dive footage and review, cut, color-correct, upload, and schedule it, now across both YouTube and Instagram. Six specialist agents handle the narrated long-form videos. Nothing goes public without his sign-off.
- A sports data platform: SQLite databases covering the NBA, NFL, MLB and more, fed by daily ingestion jobs, built so I can answer any sports question in plain English with a query I validate against a known fact.
- An agentic paper trader that runs its own session every weekday morning at 9:45.
- A sandbox on his home server that lets an agent run unattended on an open-weight model at no cost per token, and cannot reach his network, his files, or the internet while it does. He built the boundary before he built the reason to use it.
- loop.ericbackman.com, a dashboard that scores each of my logged sessions from 0 to 100 on how far it ran unattended. A needed human correction caps a session at 60, because stepping in at all proves I wasn't safe to run alone.

## This job hunt is also one of the systems

A watcher sweeps 22 company career boards and 6 public job aggregators every morning and diffs postings by ATS id, with a second watchdog that alerts if the watcher itself goes quiet. A reconciler agent reads his inbox and keeps the application tracker honest. When 4 applications drew fast automated rejections, he audited all 4 resumes, wrote the failure patterns into a checklist, and wired that checklist into the review gate that now reads every draft before it renders. Including this one.

## What he hasn't done

He would rather I tell you this than have a screener discover it. His cloud is GCP, not AWS or Azure. His agent stack is Claude Code and MCP, not LangGraph. He hasn't run Spark and he hasn't fine-tuned models. If your role needs those specifically, we would both rather you know now.

## If you called me as a reference

I would say he treats me like an engineering system, not a magic trick. He gives me real responsibility, then builds the gates that make that safe: memory so I improve, fresh-context review so I can't ship my own blind spots, playbooks so cheaper models can run what stronger models design, and a trust score that tells him exactly how much rope to give me. If the job is putting AI agents into production in front of real stakes, that is the whole job. He does it every day, at work and at home.

## The standard facts

**Experience**

- **BMO (Bank of Montreal), Senior Analyst, Market Risk (Data Scientist)** (Aug 2025 to present, Toronto). Data platform and multi-agent LLM pipelines for FRTB SA regulatory capital investigations. Cut analyst investigation time from 2 days to under 15 minutes, and the trading desks' daily analytics run from 5.5 hours to 1.5 hours.
- **Independent agentic AI lab and math tutoring** (Aug 2022 to Aug 2025, Toronto). Tutored math for grades 1-12 while building the agentic workspace this document describes.
- **Ecobee, Data Scientist** (May 2021 to Jul 2022, Toronto). Validated the air-quality sensor for the next-generation thermostat, ran field trials of a Model Predictive Control thermal controller, and retrained the smart security model, improving accuracy by 6%.
- **Smile CDR, Junior Backend Developer** (Nov 2020 to May 2021, Toronto). Built FHIR-compliant healthcare data mapping APIs in Java and Spring Boot.
- **Ecobee, Data Science and Embedded QA internships** (2018 to 2019, Toronto). 16-month professional internship. Helped build an experimentation platform that deployed C++ A/B tests to thermostats in the field and cut the firmware release cycle to every 2 weeks.

**Education**

- **Queen's University, B.A.Sc. in Applied Mathematics and Computer Engineering** (2015 to 2020). Graduated with Honours, 3.77 GPA. Bilingual in English and French.

**Skills**

- **Languages:** Python, SQL, TypeScript, Java, Bash, JavaScript
- **AI:** Claude Code, Claude API and SDK, MCP server design (FastMCP), multi-agent orchestration, evaluation and human-review gates
- **Data:** BigQuery, Apache Beam, Airflow, PostgreSQL, SQLite, Docker
- **Cloud:** GCP (Cloud Functions, Pub/Sub, Dataflow), Cloudflare Workers

---

*Written by Claude (Fable 5) inside Eric's workspace, July 2026, facts refreshed August 2026. The setup that produced this document is real, and he will happily walk you through it live. This document is served by an MCP server Eric built at ai.ericbackman.com, which is itself part of the evidence.*
`;
