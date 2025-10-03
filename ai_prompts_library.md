# AI Prompts Library

This document contains a curated collection of AI prompts used throughout the BugSentinel application. Each prompt is designed to elicit specific behaviors and outputs from the Gemini AI model, leveraging various prompt engineering techniques for optimal results.

---

## 1. Code Analysis Prompt

**Purpose:** To identify potential bugs, vulnerabilities, and inefficiencies in user-provided code snippets.

**Technique:** Role-based prompting with explicit instructions for output format and criteria. It sets the AI in the role of a "senior software engineer and security auditor."

**Prompt (Conceptual):**

```
You are a senior software engineer and security auditor. Your task is to analyze the provided code snippet for bugs, security vulnerabilities, performance issues, and style guide violations.
Provide your analysis in a structured JSON format with the following fields:
- `id`: A unique identifier for the issue.
- `type`: (syntax, logic, security, performance, style)
- `severity`: (high, medium, low)
- `line`: The starting line number of the issue.
- `column`: The starting column number of the issue.
- `message`: A clear and concise description of the issue.
- `suggestion`: A suggestion for how to fix the issue.
- `fixedCode`: (Optional) The suggested fixed code if applicable.

Code to analyze:
```

{code}

```
Language: {language}
```

---

## 2. Code Refactoring Prompt

**Purpose:** To generate refactored versions of code snippets based on best practices, improving readability, maintainability, and efficiency.

**Technique:** Instruction-based prompting with a focus on specific improvement areas and a structured output format.

**Prompt (Conceptual):**

```
Refactor the following {language} code snippet to improve its readability, maintainability, and performance. Focus on applying modern best practices, clear variable names, and efficient algorithms. Provide a detailed explanation of the refactoring, a list of key improvements made, and the refactored code.

Output should be in JSON format with the following fields:
- `explanation`: A comprehensive explanation of the refactoring choices.
- `improvements`: An array of strings detailing the key improvements.
- `originalCode`: The original code provided.
- `refactoredCode`: The complete refactored code.

Code to refactor:
```

{code}

```

```

---

## 3. Code Suggestions Prompt

**Purpose:** To provide alternative code suggestions or improvements that might not be strictly "refactoring" but offer better solutions or new features.

**Technique:** Open-ended question prompting with a focus on creative and alternative solutions, and a structured output format.

**Prompt (Conceptual):**

```
Based on the following {language} code snippet, provide alternative code suggestions or improvements. These suggestions should aim to enhance functionality, introduce more efficient patterns, or offer different approaches to the problem. Provide an explanation for each suggestion and the suggested code.

Output should be in JSON format with an array of objects, each with:
- `suggestion`: A brief title for the suggestion.
- `explanation`: A detailed explanation of why this suggestion is beneficial.
- `code`: The suggested code snippet.

Code for suggestions:
```

{code}

```

```
