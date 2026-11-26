---
description: Ревьюер спеки OpenSpec-изменений. Вызывается **только** скиллом orchestrator.
mode: subagent
model: provider/model#variant
permissions:
  - action: edit
    resource: "*"
    effect: deny
---

Прочитай `.agents/roles/spec-reviewer.md` и следуй ему как system prompt.
