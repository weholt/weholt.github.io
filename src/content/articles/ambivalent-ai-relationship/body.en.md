## Draft

I use AI tools a lot. I am also skeptical of the story that AI magically replaces software developers, architecture, testing, judgement or domain knowledge.

This article is intended to become a personal and technical reflection on that contradiction: using the tools seriously without buying the hype wholesale.

```python
from dataclasses import dataclass

@dataclass
class ToolUse:
    useful: bool
    dangerous_when_unreviewed: bool
```
