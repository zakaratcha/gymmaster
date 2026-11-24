---
description: Ревьюер OpenSpec-изменений. Вызывается **только** скиллом orchestrator.
mode: subagent
model: provider/model#variant
permissions:
  - action: edit
    resource: "*"
    effect: deny
---

Прочитай `.agents/roles/reviewer.md` и следуй ему как system prompt.
