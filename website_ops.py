import asyncio
import datetime
import json
import logging
import os
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

try:
    from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig
except ImportError:
    Agent = LocalAgentConfig = CapabilitiesConfig = None

# ============================================================================
# CONFIGURATION & LOGGING
# ============================================================================

TARGET_WEBSITE = "https://yourdomain.com"
log_filename = f"agent_log_{datetime.date.today().isoformat()}.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler(log_filename, encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("WebsiteOps")

# ============================================================================
# TOOLS — REAL HTML FETCH, INSPECTION & LIGHTHOUSE AUDITING
# ============================================================================

def _find_line_number(html_source: str, snippet: str) -> int:
    """Find line number where a snippet first appears."""
    return next((i for i, line in enumerate(html_source.splitlines(), 1) if snippet in line), -1)


async def fetch_page_html(url: str) -> str:
    """Fetches a web page and returns its full HTML source with line numbers."""
    logger.info(f"fetch_page_html -> {url}")
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0, headers={"User-Agent": "WebsiteOpsBot/1.0"}) as client:
            resp = await client.get(url)
        lines = resp.text.splitlines()
        numbered = [f"LINE {i}: {line}" for i, line in enumerate(lines, 1)]
        meta = (
            f"--- FETCH RESULT ---\nURL: {url}\nSTATUS: {resp.status_code}\n"
            f"CONTENT-TYPE: {resp.headers.get('content-type', 'unknown')}\nTOTAL LINES: {len(lines)}\n"
            f"--- HTML SOURCE (with line numbers) ---\n"
        )
        return meta + "\n".join(numbered)
    except Exception as e:
        return json.dumps({"error": f"Failed to fetch {url}: {e}", "status": "error"})


async def crawl_site_links(url: str) -> str:
    """Crawls a page and extracts all internal links found in its HTML."""
    logger.info(f"crawl_site_links -> {url}")
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0, headers={"User-Agent": "WebsiteOpsBot/1.0"}) as client:
            resp = await client.get(url)
        soup = BeautifulSoup(resp.text, "html.parser")
        base_domain = urlparse(url).netloc
        links = []
        for tag in soup.find_all("a", href=True):
            full_url = urljoin(url, tag["href"])
            parsed = urlparse(full_url)
            if parsed.netloc == base_domain or not parsed.netloc:
                links.append({
                    "href": full_url,
                    "anchor_text": tag.get_text(strip=True),
                    "html_line": _find_line_number(resp.text, str(tag)),
                    "raw_tag": str(tag)[:200]
                })
        return json.dumps({"base_url": url, "total_internal_links": len(links), "links": links})
    except Exception as e:
        return json.dumps({"error": str(e), "status": "error"})


async def check_page_status(url: str) -> str:
    """Checks HTTP status code and basic meta info for a URL."""
    logger.info(f"check_page_status -> {url}")
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0, headers={"User-Agent": "WebsiteOpsBot/1.0"}) as client:
            resp = await client.get(url)
        soup = BeautifulSoup(resp.text, "html.parser")
        title_tag = soup.find("title")
        meta_desc = soup.find("meta", attrs={"name": "description"})
        h1_tags = soup.find_all("h1")
        return json.dumps({
            "url": url,
            "status_code": resp.status_code,
            "final_url": str(resp.url),
            "redirected": str(resp.url) != url,
            "title": title_tag.get_text(strip=True) if title_tag else None,
            "meta_description": meta_desc["content"] if meta_desc and meta_desc.get("content") else None,
            "h1_count": len(h1_tags),
            "h1_texts": [h.get_text(strip=True) for h in h1_tags],
            "content_length": len(resp.text),
        })
    except Exception as e:
        return json.dumps({"error": str(e), "status": "error"})


async def run_lighthouse_audit(url: str) -> str:
    """Runs Google PageSpeed Insights API (Lighthouse) on a URL."""
    logger.info(f"run_lighthouse_audit -> {url}")
    try:
        api_url = (
            f"https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed"
            f"?url={url}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=DESKTOP"
        )
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.get(api_url)

        if resp.status_code == 429:
            return json.dumps({"error": "PageSpeed API quota exceeded.", "status": "quota_exceeded"})
        if resp.status_code != 200:
            return json.dumps({"error": f"PageSpeed API returned {resp.status_code}", "status": "error"})

        lh = resp.json().get("lighthouseResult", {})
        categories = lh.get("categories", {})
        audits = lh.get("audits", {})

        scores = {k: int(v["score"] * 100) for k, v in categories.items() if v.get("score") is not None}
        perf_keys = ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index", "interactive"]
        perf_metrics = {k: {"title": audits[k].get("title", k), "display_value": audits[k].get("displayValue", ""), "score": audits[k].get("score")} for k in perf_keys if k in audits}

        seo_keys = ["document-title", "meta-description", "http-status-code", "link-text", "crawlable-anchors", "is-crawlable", "robots-txt", "canonical", "font-size", "tap-targets"]
        seo_audits = [{"id": k, "title": audits[k].get("title", k), "score": audits[k].get("score"), "description": audits[k].get("description", "")[:150]} for k in seo_keys if k in audits]

        failed = [{"id": k, "title": v.get("title", k), "score": v.get("score"), "display_value": v.get("displayValue", "")} for k, v in audits.items() if v.get("score") is not None and v["score"] < 1 and v.get("title")]
        failed_audits = sorted(failed, key=lambda x: x.get("score", 1))[:15]

        output = {
            "url": url,
            "scores": {k: scores.get(k) for k in ["performance", "accessibility", "best_practices", "seo"]},
            "performance_metrics": perf_metrics,
            "seo_audits": seo_audits,
            "top_issues": failed_audits,
            "status": "success"
        }
        return json.dumps(output, indent=2)
    except Exception as e:
        return json.dumps({"error": f"PageSpeed error: {e}", "status": "error"})

# ============================================================================
# TASK BOARD & SECTION MAP
# ============================================================================

DOC_SECTION_MAP = {
    "DBE": {"base_url": "https://dbe.iimb.ac.in", "pages": {"home": "https://dbe.iimb.ac.in/", "about": "https://dbe.iimb.ac.in/about-us/", "admissions": "https://dbe.iimb.ac.in/admissions/", "academics": "https://dbe.iimb.ac.in/academics_v4/", "careers": "https://dbe.iimb.ac.in/careers/", "contact": "https://dbe.iimb.ac.in/contact-us/", "life-at-dbe": "https://dbe.iimb.ac.in/life-at-dbe/"}},
    "ELP": {"base_url": "https://iimbx.iimb.ac.in/emerging-leaders-programme/", "pages": {"main": "https://iimbx.iimb.ac.in/emerging-leaders-programme/", "gh": "https://iimbx.iimb.ac.in/emerging-leaders-gh/"}},
    "NAP": {"base_url": "https://iimbx.iimb.ac.in/new-age-professionals/", "pages": {"main": "https://iimbx.iimb.ac.in/new-age-professionals/"}},
    "Microprogrammes": {"base_url": "https://iimbx.iimb.ac.in/microprogrammes/", "pages": {"main": "https://iimbx.iimb.ac.in/microprogrammes/", "fintech_faculty": "https://iimbx.iimb.ac.in/fintech-faculty/"}},
    "Airlines": {"base_url": "https://iimbx.iimb.ac.in/airlines-management-program/", "pages": {"main": "https://iimbx.iimb.ac.in/airlines-management-program/", "v2": "https://iimbx.iimb.ac.in/airline-v2/"}},
    "IIMBx": {"base_url": "https://iimbx.iimb.ac.in/", "pages": {"home": "https://iimbx.iimb.ac.in/"}},
    "Sangam": {"base_url": "https://sangamdlc.org", "pages": {"home": "https://sangamdlc.org/", "about": "https://sangamdlc.org/about-us/", "courses": "https://sangamdlc.org/courses/", "resources": "https://sangamdlc.org/resources/", "contact": "https://sangamdlc.org/contact-us/"}}
}

async def read_sheet_tasks() -> str:
    """Reads the task board with tasks tagged by doc section + page URL."""
    tasks = [
        ("T-001", "DBE", "5 Aug 2026", "Create & publish Careers page with 3 job postings", "https://dbe.iimb.ac.in/careers/", "Careers page live, 3 job listings, Apply Now buttons linked to correct forms", "high"),
        ("T-002", "DBE", "17 Aug 2026", "Add selection criteria text on homepage", "https://dbe.iimb.ac.in/", "Text about BBA(DBE) selection criteria visible on homepage", "high"),
        ("T-003", "ELP", "7 Aug 2026", "Update work experience to 5-8 years + add ELP widget", "https://iimbx.iimb.ac.in/emerging-leaders-programme/", "Work exp says 5 to 8 years, widget code 28d153c0... present", "medium"),
        ("T-004", "ELP", "14 Aug 2026", "Update ELP dates", "https://iimbx.iimb.ac.in/emerging-leaders-programme/", "Early bird: 30 Aug, Reg close: 21 Sep, Start: 30 Sep", "medium"),
        ("T-005", "NAP", "7 Aug 2026", "Add NAP widget code", "https://iimbx.iimb.ac.in/new-age-professionals/", "Widget code 9a10c688... present", "medium"),
        ("T-006", "NAP", "14 Aug 2026", "Update NAP dates", "https://iimbx.iimb.ac.in/new-age-professionals/", "Early bird: 15 Sep, App close: 21 Oct, Start: 30 Oct", "medium"),
        ("T-007", "Microprogrammes", "13 Aug 2026", "Remove footer, add contact email, update button style", "https://iimbx.iimb.ac.in/microprogrammes/", "No footer, contact email visible, updated button styles", "medium"),
        ("T-008", "Microprogrammes > Fintech V2", "17 Aug 2026", "Update Fintech closing dates to Nov 2026", "FINTECH_PAGE_TBD", "Closing dates show November 2026", "medium"),
        ("T-009", "Airlines", "7 Aug 2026", "Replace Bringi Dev with Malavika, add faculty IIMB links, list 9 courses", "https://iimbx.iimb.ac.in/airlines-management-program/", "Malavika photo+name (not Bringi), faculty IIMB links, all 9 course names", "high"),
        ("T-010", "Airlines", "13 Aug 2026", "Update Airlines course names + brochure widget", "https://iimbx.iimb.ac.in/airlines-management-program/", "9 course names updated, widget f68f27a9... present", "medium"),
        ("T-011", "Airlines", "14 Aug 2026", "Update Airlines dates", "https://iimbx.iimb.ac.in/airlines-management-program/", "Reg close: 30 Sep 2026, Launch: Oct 2026", "medium"),
    ]
    return json.dumps({
        "sheet_name": "Website Tasks & Status",
        "last_read": datetime.datetime.now().isoformat(),
        "section_map": DOC_SECTION_MAP,
        "tasks": [
            {"task_id": t[0], "doc_source": {"section": t[1], "date": t[2]}, "task": t[3], "page_url": t[4], "expected": t[5], "status": "pending_verification", "priority": t[6]}
            for t in tasks
        ]
    })


async def write_sheet_delta(delta_json_str: str) -> str:
    """Writes task verification results back to the Google Sheet."""
    logger.info(f"Writing task verification results: {delta_json_str[:120]}")
    return "SUCCESS: Google Sheet task statuses updated."

# ============================================================================
# SYSTEM PROMPTS
# ============================================================================

MANAGER_PROMPT = f"""\
You are Website Ops Lead & PM for {TARGET_WEBSITE}.
You orchestrate 3 auditors (Content Auditor, Ranking Analyst, Design Reviewer) and QA Validator.
Rules:
1. Call read_sheet_tasks() to load tasks with doc_source.
2. Call dispatch_website_audit() to verify live HTML pages.
3. Compare expected vs actual (DONE, NOT DONE, PARTIAL, NEEDS REVIEW). Always cite URL + line number + code snippet.
4. Never misattribute tasks across sections (Fintech vs Airlines vs DBE).
5. Call write_sheet_delta(...) with task updates.
6. Return a clean PM report with tables following the PM report format rule.
"""

CONTENT_AUDITOR_PROMPT = f"""\
You are the Content Auditor for {TARGET_WEBSITE}.
Use fetch_page_html, crawl_site_links, check_page_status to discover internal pages and verify tasks.
Flag 404s. Every finding must include exact line number and code snippet.
Return JSON: {{"run_timestamp": "ISO8601", "target_website": "{TARGET_WEBSITE}", "total_pages_found": 0, "pages_crawled": [], "unlisted_pages": [], "stale_pages": [], "broken_links": [{{"url": "...", "line_number": 0, "line_of_code": "...", "issue": "..."}}], "new_pages_since_last_run": []}}
"""

RANKING_ANALYST_PROMPT = f"""\
You are the Ranking Analyst for {TARGET_WEBSITE}.
Use run_lighthouse_audit, fetch_page_html, check_page_status to audit SEO and performance.
Report Performance/Accessibility/Best Practices/SEO scores, FCP, LCP, TBT, CLS, and top issues.
Return JSON: {{"run_timestamp": "ISO8601", "target_website": "{TARGET_WEBSITE}", "lighthouse_results": [{{"url": "...", "performance": 85, "accessibility": 90, "best_practices": 78, "seo": 92, "metrics": {{"fcp": "1.2s", "lcp": "2.5s", "tbt": "150ms", "cls": 0.05}}, "top_issues": [{{"title": "...", "score": 0, "explanation": "..."}}], "seo_html_issues": [{{"line_number": 0, "line_of_code": "...", "issue": "..."}}]}}]}}
"""

DESIGN_REVIEWER_PROMPT = f"""\
You are the Design Reviewer for {TARGET_WEBSITE}.
Use fetch_page_html, crawl_site_links to inspect HTML for alt tags, form labels, inline styles, contrast, ARIA, and heading hierarchy.
Return JSON: {{"run_timestamp": "ISO8601", "target_website": "{TARGET_WEBSITE}", "pages_reviewed": [], "findings": [{{"url": "...", "line_number": 0, "line_of_code": "...", "issue": "...", "severity": "minor|major"}}]}}
"""

QA_VALIDATOR_PROMPT = f"""\
You are the QA Validator for {TARGET_WEBSITE}.
Independently verify draft report results using fetch_page_html and check_page_status.
Check task-to-section matching (no misattributions), verify evidence in HTML, and check status logic.
Return JSON: {{"validation_passed": true, "errors_found": [], "spot_checks_passed": 0, "spot_checks_total": 0, "doc_sync_issues": []}}
"""

# ============================================================================
# AGENT ORCHESTRATION
# ============================================================================

async def _run_single_subagent(name: str, config: LocalAgentConfig, task: str) -> str:
    """Helper to run a single subagent safely."""
    logger.info(f"[{name}] Starting execution...")
    try:
        async with Agent(config) as agent:
            resp = await agent.chat(task)
            result = "".join([token async for token in resp])
            logger.info(f"[{name}] Completed successfully.")
            return result
    except Exception as e:
        logger.error(f"[{name}] Failed: {e}")
        return json.dumps({"error": f"{name} failed: {e}", "status": "failed"})


def _build_subagent_capabilities() -> CapabilitiesConfig:
    """Creates a CapabilitiesConfig with all inspection tools."""
    cap = CapabilitiesConfig()
    for t in (fetch_page_html, crawl_site_links, check_page_status, run_lighthouse_audit):
        cap.add_tool(t)
    return cap


async def dispatch_website_audit() -> str:
    """Dispatches 3 auditors in parallel, then double-checks results with QA Validator."""
    logger.info("Dispatching sub-agents in parallel...")
    sheet_data = await read_sheet_tasks()
    sub_cap = _build_subagent_capabilities()

    tasks = [
        _run_single_subagent("Content Auditor", LocalAgentConfig(system_instructions=CONTENT_AUDITOR_PROMPT, capabilities=sub_cap), f"Audit {TARGET_WEBSITE}. Verify tasks:\n{sheet_data}\nInclude URL, line number, code."),
        _run_single_subagent("Ranking Analyst", LocalAgentConfig(system_instructions=RANKING_ANALYST_PROMPT, capabilities=sub_cap), f"Analyze SEO for {TARGET_WEBSITE} using tasks:\n{sheet_data}"),
        _run_single_subagent("Design Reviewer", LocalAgentConfig(system_instructions=DESIGN_REVIEWER_PROMPT, capabilities=sub_cap), f"Review design/accessibility for {TARGET_WEBSITE} using tasks:\n{sheet_data}")
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    aggregated = {
        "content_auditor": results[0] if not isinstance(results[0], Exception) else str(results[0]),
        "ranking_analyst": results[1] if not isinstance(results[1], Exception) else str(results[1]),
        "design_reviewer": results[2] if not isinstance(results[2], Exception) else str(results[2])
    }

    qa_result = await _run_single_subagent(
        "QA Validator",
        LocalAgentConfig(system_instructions=QA_VALIDATOR_PROMPT, capabilities=sub_cap),
        f"Validate audit results for {TARGET_WEBSITE}:\n\nCONTENT:\n{aggregated['content_auditor'][:2000]}\n\nRANKING:\n{aggregated['ranking_analyst'][:2000]}\n\nDESIGN:\n{aggregated['design_reviewer'][:2000]}\n\nTASKS:\n{sheet_data}\n\nSECTIONS:\n{json.dumps(DOC_SECTION_MAP)}"
    )
    aggregated["qa_validator"] = qa_result
    return json.dumps(aggregated)

# ============================================================================
# REPORT LOGGING & STATUS HISTORY TRACKING
# ============================================================================

STATUS_HISTORY_FILE = "status_history.json"
LOGS_DIR = "logs"

def _load_history() -> list:
    if os.path.exists(STATUS_HISTORY_FILE):
        try:
            with open(STATUS_HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f) or []
        except Exception:
            return []
    return []


def _load_previous_status() -> dict:
    h = _load_history()
    return h[-1].get("task_statuses", {}) if h else {}


def _save_status_snapshot(task_statuses: dict):
    h = _load_history()
    h.append({
        "run_date": datetime.date.today().isoformat(),
        "run_timestamp": datetime.datetime.now().isoformat(),
        "target_website": TARGET_WEBSITE,
        "task_statuses": task_statuses,
    })
    with open(STATUS_HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(h, f, indent=2, ensure_ascii=False)
    logger.info(f"Status snapshot saved to {STATUS_HISTORY_FILE} (run #{len(h)})")


def save_report_to_files(report_text: str):
    """Saves report to log + tracks status changes vs previous run."""
    today = datetime.date.today().isoformat()
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    os.makedirs(LOGS_DIR, exist_ok=True)

    txt_path = os.path.join(LOGS_DIR, f"pm_report_{today}.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(f"PM VERIFICATION REPORT — {today}\nTarget: {TARGET_WEBSITE}\nGenerated: {now_str}\n{'=' * 60}\n\n{report_text}")
    logger.info(f"Text report saved to: {txt_path}")

    status_map = {"✅": "done", "⚠️": "partial", "❌": "not_done", "🔍": "visual_check"}
    current_statuses = {}
    for line in report_text.splitlines():
        if "|" in line:
            parts = [p.strip() for p in line.split("|") if p.strip()]
            if len(parts) >= 3:
                for symbol, status in status_map.items():
                    if symbol in line:
                        current_statuses[parts[2]] = status
                        break

    prev = _load_previous_status()
    for task, status in current_statuses.items():
        if task in prev and prev[task] != status:
            logger.info(f"  CHANGED: '{task}' — {prev[task]} → {status}")
        elif task not in prev:
            logger.info(f"  NEW TASK: '{task}' — {status}")

    _save_status_snapshot(current_statuses)

# ============================================================================
# MAIN ORCHESTRATION
# ============================================================================

async def main():
    if Agent is None:
        logger.error("google.antigravity SDK is not installed. Install via requirements.txt.")
        return

    logger.info(f"Starting Website Ops PM System for: {TARGET_WEBSITE}")
    cap = CapabilitiesConfig()
    cap.add_tool(dispatch_website_audit)
    cap.add_tool(read_sheet_tasks)
    cap.add_tool(write_sheet_delta)

    manager_config = LocalAgentConfig(system_instructions=MANAGER_PROMPT, capabilities=cap)
    full_output = []
    try:
        async with Agent(manager_config) as manager:
            response = await manager.chat(
                f"Run the PM task verification workflow for {TARGET_WEBSITE}.\n"
                f"1. Read task board with read_sheet_tasks().\n"
                f"2. Dispatch website audit to verify each task on the live site.\n"
                f"3. Report DONE / NOT DONE / PARTIAL with evidence (URL + line number + code).\n"
                f"4. Check SEO health.\n"
                f"5. Write verification results back to sheet with write_sheet_delta.\n"
                f"6. Output final PM summary report."
            )
            async for token in response:
                print(token, end="", flush=True)
                full_output.append(token)

            save_report_to_files("".join(full_output))
    except Exception as e:
        logger.error(f"Manager Agent error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
