#!/usr/bin/env python3
"""Build lexical-similarity recommendations for Jekyll posts using only Python's standard library."""
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
import json, math, re

ROOT = Path(__file__).resolve().parents[1]
POSTS = ROOT / "_posts"
OUTPUT = ROOT / "_data" / "related_posts.json"
HAN = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+")
LATIN = re.compile(r"[a-z0-9]{2,}", re.I)
FRONT = re.compile(r"\A---\s*\r?\n(.*?)\r?\n---\s*\r?\n?", re.S)


def value(front, key):
    m = re.search(r"(?m)^" + re.escape(key) + r":\s*(.*?)\s*$", front)
    if not m: return ""
    v = m.group(1).strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'": v = v[1:-1]
    return v


def terms(text):
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r" \1 ", text)
    text = re.sub(r"<[^>]+>|https?://\S+|`[^`]*`", " ", text)
    result = Counter(t.casefold() for t in LATIN.findall(text))
    for run in HAN.findall(text):
        if len(run) == 1:
            result[run] += 1
        else:
            for n in (2, 3):
                for i in range(len(run) - n + 1): result[run[i:i+n]] += 1
    return result


def read_posts():
    docs = []
    for path in sorted(POSTS.rglob("*.md")):
        raw = path.read_text(encoding="utf-8-sig")
        match = FRONT.match(raw)
        if not match:
            print(f"略過沒有 Jekyll 資料欄的檔案：{path.relative_to(ROOT)}")
            continue
        front, body = match.group(1), raw[match.end():]
        title = value(front, "title")
        excerpt = value(front, "excerpt")
        published = value(front, "date")[:10]
        try: sort_date = date.fromisoformat(published)
        except ValueError: sort_date = date.min
        rel = path.relative_to(ROOT).as_posix()
        docs.append({"path": rel, "date": sort_date, "title": title, "terms": terms(title + " " + excerpt + " " + body)})
    return docs


def main():
    docs = read_posts()
    if len(docs) < 2:
        OUTPUT.write_text("{}\n", encoding="utf-8")
        print("文章不足兩篇；相關文章資料已留空。")
        return
    df = Counter()
    for d in docs: df.update(d["terms"].keys())
    total = len(docs)
    vectors = []
    for d in docs:
        weighted = {term: (1 + math.log(freq)) * (math.log((total + 1) / (df[term] + 1)) + 1) for term, freq in d["terms"].items()}
        length = math.sqrt(sum(v*v for v in weighted.values())) or 1.0
        vectors.append({k: v / length for k, v in weighted.items()})
    result = {}
    for i, source in enumerate(docs):
        scores = []
        for j, target in enumerate(docs):
            if i == j: continue
            # Cosine similarity for sparse TF-IDF vectors.
            a, b = vectors[i], vectors[j]
            if len(a) > len(b): a, b = b, a
            score = sum(weight * b.get(term, 0.0) for term, weight in a.items())
            if score > 0: scores.append((score, target["date"], target["path"]))
        scores.sort(key=lambda row: (-row[0], -row[1].toordinal(), row[2]))
        result[source["path"]] = [row[2] for row in scores[:4]]
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"已為 {len(docs)} 篇文章產生相關文章排序：{OUTPUT.relative_to(ROOT)}")

if __name__ == "__main__": main()
