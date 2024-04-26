import string
from datetime import datetime
from pathlib import Path
import yaml
from invoke import task

POST_FORMAT = """---
tags:
  - ethics
  - opensource
  - software
  - license
---
# {title}

"""

INDEX_FORMAT = """
# Today I Learned

This is a collection of random topics I came across.

"""

data = {}
with open("mkdocs.yml", "r") as f:
    data = yaml.load(f, Loader=yaml.SafeLoader)
docs_dir = Path(data.get("docs_dir"))
author = data.get("author")
author_email = data.get("author_email")
today_dt = datetime.now()


def create_filename_from_title(title):
    base = (
        "".join(
            [c for c in title if c == " " or c.isdigit() or c in string.ascii_letters]
        )
        .lower()
        .replace(" ", "_")
    )
    return f"{today_dt.year}_{today_dt.month:02}_{today_dt.day:02}_{today_dt.hour}{today_dt.minute}{today_dt.second}_{base}.md"


@task
def publish(c, comment: str = "No comment."):
    c.run("git add .")
    c.run(f'git commit -m "{comment}"')
    c.run("git push")


def build_index(c):
    til_dir = Path(docs_dir) / "til"
    result = []
    for doc in til_dir.glob("*.md"):
        doc_title = doc.name
        with open(doc) as f:
            lines = [line for line in f.readlines() if line.strip().startswith("# ")]
            doc_title = lines and lines[0].replace("# ", "").strip()
        tags = extract_tags(doc.absolute())
        result.append((doc_title, "til/%s" % doc.name, tags))
    links = []

    for doc_name, doc_file, tags in result:
        formatted_tags = "" #", ".join([f'{tag}' for tag in tags])
        links.append(f"* [{doc_name}]({doc_file}) {formatted_tags}\n")

    index_file = docs_dir / "til.md"
    with open(index_file, "w") as f:
        f.write(INDEX_FORMAT)
        f.writelines(links)

def extract_tags(til_file: str) -> list[str]:
    result = []
    lines = [f for f in open(til_file).readlines() if f.strip() and not f.startswith("---")]
    try:
        return yaml.safe_load("".join(lines)).get('tags')
    except:
        return result

@task
def til(c, title: str):
    til_dir = Path(docs_dir) / "til"
    til_dir.mkdir(exist_ok=True)
    til_file = til_dir / Path(create_filename_from_title(title))
    post = POST_FORMAT.format(
            title=title,
            author=author,
            author_email=author_email,
            year=today_dt.year,
            month=today_dt.month,
            day=today_dt.day,
        )
    
    with open(til_file, "w") as f:
        f.write(post)
    build_index(c)
    c.run(f"code {til_file}")

