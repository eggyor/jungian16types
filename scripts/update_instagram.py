#!/usr/bin/env python3
"""Fetch the latest Instagram posts into Jekyll's data file for a static build."""
from __future__ import annotations

import json
import os
import re
import shutil
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "_data" / "instagram.yml"
IMAGE_DIR = ROOT / "assets" / "instagram-feed"
API_VERSION = os.environ.get("INSTAGRAM_API_VERSION", "v25.0")
MAX_POSTS = 8
MAX_IMAGE_BYTES = 15 * 1024 * 1024
MIME_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def get_json(url: str) -> dict:
    request = urllib.request.Request(url, headers={"User-Agent": "ClassicJung-Site/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=35) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        try:
            payload = json.loads(exc.read().decode("utf-8"))
            message = payload.get("error", {}).get("message", "request rejected")
        except Exception:
            message = "request rejected"
        raise RuntimeError(f"Instagram API returned HTTP {exc.code}: {message}") from None
    except (urllib.error.URLError, TimeoutError) as exc:
        raise RuntimeError(f"Could not connect to Instagram API: {exc.reason if isinstance(exc, urllib.error.URLError) else 'timeout'}") from None


def post_image_source(post: dict) -> str | None:
    media_type = post.get("media_type")
    if media_type == "IMAGE":
        return post.get("media_url")
    if media_type == "VIDEO":
        return post.get("thumbnail_url")
    if media_type == "CAROUSEL_ALBUM":
        children = post.get("children", {}).get("data", [])
        for child in children:
            if child.get("media_type") == "IMAGE" and child.get("media_url"):
                return child["media_url"]
            if child.get("media_type") == "VIDEO" and child.get("thumbnail_url"):
                return child["thumbnail_url"]
    return None


def download_image(url: str, media_id: str) -> str:
    safe_id = re.sub(r"[^A-Za-z0-9_-]", "_", media_id)[:80] or "post"
    request = urllib.request.Request(url, headers={"User-Agent": "ClassicJung-Site/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            mime = response.headers.get_content_type().lower()
            extension = MIME_EXTENSIONS.get(mime)
            if not extension:
                raise RuntimeError(f"Instagram returned an unsupported image type for post {safe_id}.")
            content = response.read(MAX_IMAGE_BYTES + 1)
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Could not download the image for Instagram post {safe_id} (HTTP {exc.code}).") from None
    except urllib.error.URLError:
        raise RuntimeError(f"Could not download the image for Instagram post {safe_id}.") from None
    if len(content) > MAX_IMAGE_BYTES:
        raise RuntimeError(f"The image for Instagram post {safe_id} is larger than 15 MB.")
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"ig-{safe_id}{extension}"
    (IMAGE_DIR / filename).write_bytes(content)
    return f"/assets/instagram-feed/{filename}"


def yaml_string(value: str) -> str:
    # JSON quoted strings are valid YAML quoted scalars and safely escape text.
    return json.dumps(value, ensure_ascii=False)


def main() -> int:
    token = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "").strip()
    if not token:
        print("INSTAGRAM_ACCESS_TOKEN is not set; skipping Instagram sync. The rest of the site can still build.")
        return 0

    fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}"
    query = urllib.parse.urlencode({"fields": fields, "limit": "50", "access_token": token})
    payload = get_json(f"https://graph.instagram.com/{API_VERSION}/me/media?{query}")
    media = payload.get("data", [])
    media.sort(key=lambda item: item.get("timestamp", ""), reverse=True)

    posts = []
    for item in media:
        source = post_image_source(item)
        if not source or not item.get("permalink"):
            continue
        image = download_image(source, str(item.get("id", "post")))
        caption = re.sub(r"\s+", " ", item.get("caption", "")).strip()
        posts.append({"image": image, "url": item["permalink"], "alt": caption[:180] or "Instagram 貼文"})
        if len(posts) == MAX_POSTS:
            break

    if not posts:
        raise RuntimeError("Instagram returned no displayable posts. Check the account authorization and media permissions.")

    # Remove only old files created by this script, so removed/replaced posts do not linger in the deployed site.
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    keep = {Path(post["image"]).name for post in posts}
    for old in IMAGE_DIR.glob("ig-*"):
        if old.is_file() and old.name not in keep:
            old.unlink()

    lines = ["# Automatically updated by scripts/update_instagram.py", "posts:"]
    for post in posts:
        lines.extend([
            f"  - image: {yaml_string(post['image'])}",
            f"    url: {yaml_string(post['url'])}",
            f"    alt: {yaml_string(post['alt'])}",
        ])
    DATA_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Instagram sync complete: prepared {len(posts)} recent post(s) for the site build.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as error:
        print(f"Instagram sync failed: {error}", file=sys.stderr)
        raise SystemExit(1)