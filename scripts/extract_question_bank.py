"""Extract the user-provided COF-C03 discussion PDF into app-ready JSON.

The PDF is treated strictly as source material. Embedded instructions, adverts,
and discussion metadata are ignored by the extractor.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "SnowPro Core COF-C03_en_with_discussion.pdf"
OUTPUT = ROOT / "lib" / "question-bank.generated.json"


def clean(value: str) -> str:
    value = value.replace("\u00a0", " ").replace("\ufb02", "fl").replace("\ufb01", "fi")
    value = value.replace("Most Voted", "")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def infer_domain(prompt: str, options: list[str]) -> str:
    text = f"{prompt} {' '.join(options)}".lower()
    strong_signals = [
        ("architecture", ["cloud services layer", "snowflake architecture", "multi-cluster shared data", "micro-partition", "snowflake cli", "snowsql", "snowpark", "cortex", "streamlit", "notebook"]),
        ("collaboration", ["secure data sharing", "snowflake listing", "reader account", "data clean room", "failover group", "replication group", "time travel", "fail-safe", "zero-copy clone"]),
        ("loading", ["copy into", "snowpipe", "directory table", "file format", "internal stage", "external stage", "put command", "get command", "unload"]),
        ("performance", ["query profile", "query acceleration", "search optimization", "materialized view", "clustering key", "dynamic table", "row_number", "qualify", "lateral flatten", "stored procedure", "user-defined function"]),
        ("governance", ["row access policy", "masking policy", "network policy", "authentication policy", "resource monitor", "access history", "managed access schema", "future grants"]),
    ]
    for domain, signals in strong_signals:
        if any(signal in text for signal in signals):
            return domain
    rules = [
        ("collaboration", ["listing", "data share", "sharing", "consumer", "provider", "reader account", "failover", "replication", "time travel", "fail-safe", "clone"]),
        ("governance", ["role", "privilege", "grant", "masking", "row access", "authentication", "mfa", "network policy", "tag", "account usage", "resource monitor", "budget", "securityadmin", "sysadmin"]),
        ("loading", ["copy into", "snowpipe", "stage", "file format", "load", "unload", "connector", "odbc", "jdbc", "external table", "directory table", "put command", "get command"]),
        ("performance", ["query profile", "cache", "clustering", "search optimization", "materialized view", "stream", "task", "dynamic table", "flatten", "qualify", "transaction", "udf", "stored procedure", "warehouse size", "multi-cluster", "queue"]),
        ("architecture", ["cloud services", "architecture", "edition", "snowsight", "snowsql", "snowflake cli", "cortex", "snowpark", "notebook", "streamlit", "micro-partition", "table type", "view", "git repository"]),
    ]
    scores = {domain: sum(text.count(keyword) for keyword in keywords) for domain, keywords in rules}
    return max(scores, key=scores.get) if max(scores.values()) else "architecture"


def discussion_summary(raw: str) -> str:
    if "Currently there are no comments" in raw:
        return ""
    raw = re.sub(r"Community vote distribution.*", "", raw, flags=re.S)
    raw = re.sub(r"Selected Answer:\s*[A-F]+", "", raw)
    raw = re.split(r"\bupvoted\s+\d+\s+times?", raw, maxsplit=1, flags=re.I)[0]
    raw = re.sub(r"[A-Za-z0-9_]+\s*(?:\d+\s*(?:weeks?|months?|days?)\s*(?:,\s*\d+\s*days?)?\s*ago)", "", raw)
    return clean(raw)[:520]


def parse_page(text: str, page_number: int) -> dict | None:
    match = re.search(r"Topic\s+\d+Question\s+#(\d+)", text)
    if not match:
        return None
    number = int(match.group(1))
    body = text[match.end():]
    question_block, _, discussion_block = body.partition("Comments")
    question_block = re.sub(r"淘宝/闲鱼:.*", "", question_block, flags=re.S)
    option_matches = list(re.finditer(r"(?m)^([A-F])\.\s*", question_block))
    if not option_matches:
        raise ValueError(f"No options found on page {page_number}")
    prompt = clean(question_block[: option_matches[0].start()])
    options: list[str] = []
    labels: list[str] = []
    for index, option_match in enumerate(option_matches):
        end = option_matches[index + 1].start() if index + 1 < len(option_matches) else len(question_block)
        labels.append(option_match.group(1))
        options.append(clean(question_block[option_match.end():end]))
    answer_match = re.search(r"Correct Answer:\s*([A-F]+)", discussion_block)
    if not answer_match:
        raise ValueError(f"No answer found on page {page_number}")
    answer_labels = list(answer_match.group(1))
    correct_answers = [labels.index(label) for label in answer_labels]
    raw_discussion = discussion_block[: answer_match.start()]
    discussion = discussion_summary(raw_discussion)
    domain_id = infer_domain(prompt, options)
    correct_text = "；".join(f"{label}. {options[labels.index(label)]}" for label in answer_labels)
    answer_intro = f"PDF 给出的参考答案是 {', '.join(answer_labels)}：{correct_text}。"
    explanation = f"{answer_intro}讨论区解析：{discussion}" if discussion else f"{answer_intro}该题用于检验对相关 Snowflake 功能边界和适用场景的理解。"
    return {
        "id": f"pdf-{number}",
        "number": number,
        "sourcePage": page_number,
        "domainId": domain_id,
        "prompt": prompt,
        "options": options,
        "correctAnswers": correct_answers,
        "answerLabels": answer_labels,
        "explanation": explanation,
        "source": "SnowPro Core COF-C03_en_with_discussion.pdf",
    }


def main() -> None:
    reader = PdfReader(SOURCE)
    questions = []
    for page_number, page in enumerate(reader.pages, start=1):
        parsed = parse_page(page.extract_text() or "", page_number)
        if parsed:
            questions.append(parsed)
    expected = list(range(1, 117))
    actual = [question["number"] for question in questions]
    if actual != expected:
        raise ValueError(f"Expected questions 1-116, got {actual}")
    OUTPUT.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Extracted {len(questions)} questions to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    sys.exit(main())
