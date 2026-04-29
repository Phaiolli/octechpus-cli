# Profile System — Contributor Guide

This document describes the Octechpus profile schema in full. Read it before creating or modifying a profile.

---

## What is a profile?

A profile is a YAML file in `src/profiles/` that describes a specific language/framework stack. It controls:

- Which agents are active (and therefore which `.claude/commands/*.md` files are installed)
- How templates are rendered — every `{{placeholder}}` in a command template is replaced with the profile's values
- Stack-specific rules: forbidden patterns, review checklist, QA strategy, guardrails

---

## Inheritance

Profiles use single inheritance via the `extends` key. The profile-loader deep-merges parent into child (child wins on key conflicts, arrays are replaced, not merged).

```
_base.yaml                    (required root — do not extend anything else)
  ├── python-fastapi.yaml
  │     ├── python-ai-pipeline.yaml
  │     └── python-cli.yaml
  └── node-typescript.yaml
        └── nextjs-react.yaml
```

When you run `octechpus profile show <name>`, you see the fully resolved profile after all inheritance is applied.

---

## Schema reference

### Top-level keys

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `extends` | string | No | Parent profile name (filename without `.yaml`) |
| `name` | string | Yes | Unique identifier, matches filename |
| `description` | string | Yes | One-line description shown in `profile list` |
| `language` | string | Yes | Primary language (`python`, `typescript`, `go`, `rust`, …) |
| `runtime` | string | Yes | Runtime version constraint (`python>=3.12`, `node>=18`, …) |
| `package_manager` | string | Yes | `uv`, `npm`, `cargo`, `go_modules`, … |

### `agents` block

Controls which agent command files are installed. All default to the value in `_base.yaml` unless overridden.

```yaml
agents:
  maestro: true        # always true — cannot be disabled
  github: true
  architect: true
  coder: true
  reviewer: true
  qa: true
  security: true
  docs: true
  reporter: true
  profiler: true
  designer: false      # activate in UI profiles
  cost_engineer: false # activate in AI/ML profiles
```

### `testing` block

```yaml
testing:
  framework: pytest          # test runner
  fixtures: factory_boy      # fixture library
  http_mock: respx           # HTTP mocking
  e2e: playwright_python     # E2E tool (null if none)
  coverage_target: 85        # integer, percent
```

### `validation` block

```yaml
validation:
  library: pydantic_v2   # validation library used for external inputs
```

### `docs` block

```yaml
docs:
  format: google_docstrings  # docstring/comment style
  api: fastapi_openapi       # API doc tool (null if no HTTP API)
```

### `linting` block

```yaml
linting:
  formatter: ruff            # formatter
  type_checker: mypy_strict  # type checker (null if none)
  config: pyproject.toml     # config file
```

### `conventions` block

```yaml
conventions:
  imports: absolute                             # import style
  naming: snake_case_functions_PascalCase_classes  # naming convention
```

### `forbidden_patterns`

A list of regex strings. The Reviewer agent rejects PRs containing any match. Strings follow YAML quoting rules — double-escape backslashes.

```yaml
forbidden_patterns:
  - "import \\*"
  - "except Exception:\\s*pass"
  - "print\\("
```

### `guardrails` block

```yaml
guardrails:
  read_only_paths:           # paths requiring a special PR label to modify
    - "profiles/**/prompts/**"
    - "comfy_workflows/*.json"
```

### `review_checklist`

Multi-line string. Appended verbatim to the Reviewer agent's prompt. Use a YAML literal block scalar (`|`).

```yaml
review_checklist: |
  - All public functions have type hints
  - Error handling is explicit — no bare `except`
  - Pydantic models used for all request/response bodies
```

### `qa_strategy`

Multi-line string. Injected into the QA agent's prompt. Use a YAML literal block scalar (`|`).

```yaml
qa_strategy: |
  - pytest with fixtures for all test cases
  - factory_boy for generating model instances
  - pytest-cov for coverage; target 85%
```

---

## Template placeholders

Every `{{key}}` in a template file under `src/templates/commands/` is replaced with the corresponding value from the resolved profile. Nested keys use dot notation:

| Placeholder | Resolves to |
|-------------|-------------|
| `{{language}}` | `language` |
| `{{runtime}}` | `runtime` |
| `{{package_manager}}` | `package_manager` |
| `{{testing.framework}}` | `testing.framework` |
| `{{testing.coverage_target}}` | `testing.coverage_target` |
| `{{validation.library}}` | `validation.library` |
| `{{docs.format}}` | `docs.format` |
| `{{linting.formatter}}` | `linting.formatter` |
| `{{linting.type_checker}}` | `linting.type_checker` |
| `{{conventions.imports}}` | `conventions.imports` |
| `{{conventions.naming}}` | `conventions.naming` |
| `{{review_checklist}}` | `review_checklist` (block) |
| `{{qa_strategy}}` | `qa_strategy` (block) |
| `{{forbidden_patterns}}` | `forbidden_patterns` (list rendered as bullet points) |

Unknown placeholders are left as-is (no error) when `strict: false`, which is the default for command rendering.

---

## Creating a new profile

1. Identify the closest existing profile to extend
2. Create `src/profiles/my-stack.yaml`
3. Fill all `required_placeholders` listed in `_base.yaml`
4. Validate:
   ```bash
   node src/cli.mjs profile show my-stack
   ```
5. Test init:
   ```bash
   mkdir /tmp/test-my-stack && cd /tmp/test-my-stack
   node /path/to/octechpus-cli/src/cli.mjs init --stack=my-stack
   ```
6. Verify no `{{placeholder}}` strings remain in the generated files:
   ```bash
   grep -r '{{' /tmp/test-my-stack/.claude/commands/
   ```
7. Add a test case in `tests/cli-init.test.mjs` for the new profile
8. Open a PR — include `profile: my-stack` label

---

## Detection hints (optional)

To make the stack-detector auto-suggest your profile, add detection hints to `src/lib/stack-detector.mjs` in the `PROFILES` array. Each entry has:

```js
{
  name: 'my-stack',
  weight: 10,             // higher = preferred when multiple match
  checks: [
    { file: 'my-config.yaml', required: true },
    { file: 'package.json', key: 'dependencies.my-framework', required: false },
  ],
}
```

`weight` breaks ties — more specific profiles should have higher weight.

---

## Required placeholders

The following must be present (directly or via inheritance) or `init` will fail with a clear error:

```
language
runtime
package_manager
testing.framework
testing.coverage_target
validation.library
docs.format
linting.formatter
linting.type_checker
conventions.imports
conventions.naming
forbidden_patterns
guardrails.read_only_paths
review_checklist
qa_strategy
```
