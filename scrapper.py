# scraper.py
import requests
from bs4 import BeautifulSoup
import time
from urllib.parse import urljoin, urlparse
import re

HEADERS = {"User-Agent": "PathSenseScraper/1.0 (contact: sahaturjoy@gmail.com)"}

def respects_robots(base_url, path="/"):
    try:
        robots_url = urljoin(base_url, "/robots.txt")
        r = requests.get(robots_url, timeout=6, headers=HEADERS)
        if r.status_code != 200:
            return True
        text = r.text.lower()
        # super-simple: disallow check for 'User-agent: *' + 'Disallow: /...'
        # For production use a robots.txt parser like reppy or robotexclusionrulesparser
        ua_index = text.find("user-agent: *")
        if ua_index == -1:
            return True
        dis_index = text.find("disallow:", ua_index)
        if dis_index == -1:
            return True
        dis_line = text[dis_index: dis_index + 200].splitlines()[0]
        path_dis = dis_line.split(":")[1].strip()
        if path_dis == "/":
            return False
        return not path.startswith(path_dis)
    except Exception:
        return True

def extract_questions_from_html(html):
    soup = BeautifulSoup(html, "html.parser")
    questions = []

    # heuristics to find MCQ blocks - sites vary a lot; adapt per-site
    # look for elements with 'question' in class or h3/h4 followed by list items
    for qtag in soup.select(".question, .mcq, .single-question"):
        text = qtag.get_text(separator=" ").strip()
        if len(text) > 30:
            questions.append({"source_snippet": text[:1000]})
    # fallback: find headers + options lists
    if not questions:
        for h in soup.select("h2,h3,h4"):
            ul = h.find_next_sibling("ul")
            if ul:
                opts = [li.get_text(strip=True) for li in ul.find_all("li")]
                if len(opts) >= 2:
                    questions.append({
                        "question": h.get_text(strip=True),
                        "options": opts
                    })
    return questions

def scrape_url(url, max_pages=1, delay=1.0):
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    if not respects_robots(base, parsed.path):
        return {"error": "disallowed by robots.txt"}
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        res.raise_for_status()
    except Exception as e:
        return {"error": str(e)}
    questions = extract_questions_from_html(res.text)
    time.sleep(delay)
    return {"url": url, "questions": questions}