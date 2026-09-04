# 🚀 LeakGuard: The Absolute Beginner's Guide & Presentation Script

Welcome! If you have no idea what this project does, or if you need a script to present it to your judges, you are in the right place. 

This document breaks down **everything** into simple, everyday language.

---

## 1. The Big Picture (Explain Like I'm 5)

**What is a Resource?**
Imagine you check out a library book. You are holding a "resource." You are expected to return it. 
In programming, when your code asks the operating system to open a File, connect to a Database, or open a Network Socket, it is checking out a resource.

**What is a Resource Leak?**
If you forget to return the library book, someone else can't read it. Eventually, the library runs out of books.
In programming, if you forget to write `close()` on a file or database, it stays open in the background. If a server does this thousands of times a day, it runs out of memory and crashes. This is a **Resource Leak**, and it takes down major apps and websites.

**What is LeakGuard?**
LeakGuard is a program that acts like an inspector. Before a developer ever runs their code, LeakGuard reads their code like a book and mathematically proves whether or not they forgot to close a resource. If they forgot, it throws a giant red flag so they can fix it *before* it crashes the live app.

---

## 2. Decoding the MVP Requirements (Jargon Buster)

Your judges asked for specific things in your MVP (Minimum Viable Product). Here is what those fancy words mean and how you achieved them.

### A. "Single-language parser (Python)"
**What it means:** A "parser" is a tool that reads text and understands the grammar (like knowing nouns vs verbs). The judges wanted you to focus on just ONE programming language (Python) rather than doing a sloppy job trying to read Java, C++, and Python all at once.
**How you did it:** LeakGuard is built in Python, to scan Python code.

### B. "AST-based resource tracking (Not Regex)"
**What it means:** 
- **Regex (Regular Expressions)** is like `Ctrl+F` (Find). It's a dumb search. If you search for the word `close()`, a dumb search will find a comment that says `# don't close() this` and get confused. 
- **AST (Abstract Syntax Tree)** is like a sentence diagram. Python converts the code into a tree structure that understands *context*.
**How you did it:** LeakGuard doesn't do dumb string searches. It builds the AST, so it knows the difference between a real function call and just a random string of text.

### C. "Close-path verification"
**What it means:** A program doesn't always run straight down from top to bottom. Sometimes it hits an `if/else` statement and splits into different paths. Sometimes it hits an `Exception` (an error) and jumps to the end of the file. "Close-path verification" means tracing *every possible route* a program could take to ensure the resource is closed no matter what.
**How you did it:** LeakGuard builds a **Control Flow Graph (CFG)**. It maps out a maze of every possible route the code can take. It walks through every path of the maze. If even one path reaches the exit without closing the resource, LeakGuard flags it.

### D. "CI Build integration that actually fails"
**What it means:** CI (Continuous Integration) is the automated robot that tests code when a developer tries to upload it to GitHub. The judges want LeakGuard to physically **block** bad code from being uploaded, rather than just printing a polite warning.
**How you did it:** If LeakGuard finds a leak, it triggers a "Crash Exit Code" (Exit Code 1). When GitHub Actions sees Exit Code 1, it turns red and blocks the code from being merged into production.

---

## 3. Scenario: A User Using it on Their PC

Imagine a developer named Alex. 
1. Alex writes a new script called `server.py` that opens a database connection.
2. Alex makes a mistake: if the password is wrong, the code exits early and forgets to close the database.
3. Before uploading to GitHub, Alex opens their terminal and types:
   ```bash
   leakguard scan server.py
   ```
4. LeakGuard instantly outputs a warning:
   ```text
   [HIGH] DEFINITE RESOURCE LEAK
   File: server.py
   Resource: Sqlite_connection 'db'
   Reason: Early return bypasses resource cleanup.
   ```
5. Alex says "Oops!", changes the code to safely close the database, and re-scans. LeakGuard says `Passed!`, and Alex safely uploads the code.

---

## 4. How to Present to the Judges (The Pitch)

When you walk up to present, follow this script:

1. **The Hook:** "Hi everyone. Resource leaks are silent killers. They don't break your code immediately—they slowly consume memory until your servers crash at 3 AM. We built LeakGuard to catch these leaks before code ever reaches production."
2. **The Demo:** "Let me show you." (Open your terminal and show them the `demo-project/example.py` file which has deliberate leaks). "Here is a script with a hidden leak. If an error occurs, it returns early and the file stays open."
3. **The Execution:** Run `leakguard scan demo-project/`. Show them the red error output. "LeakGuard didn't just find the missing close. It mapped the Control Flow Graph and proved that this specific exception path bypassed the cleanup."
4. **The Fix:** Edit the file in front of them to use a `with open(...) as f:` block (a Context Manager). Run LeakGuard again to show the green `Passed!` message.
5. **The MVP Check:** "We hit all MVP requirements. We built a native Python AST parser. We built a mathematical path analyzer to handle branches and exception paths. And we integrated it into a GitHub Action that strictly blocks bad builds."

---

## 5. Live Test: "What if the judges give me a random GitHub link?"

Judges love to test if your code actually works or if it's faked. If they hand you a link to a random GitHub repository, here is exactly what you do:

**Step 1: Clone their repo to your computer**
Open your terminal and type:
```bash
git clone <THEIR_GITHUB_LINK> test-repo
```

**Step 2: Tell LeakGuard what to look for**
Different projects use different libraries. If their repo uses a library called `requests` (for web scraping), you need to tell LeakGuard to track it.
Open the file `leakguard/rules/resources.yaml` in your LeakGuard folder. Add their library to the config list so LeakGuard knows what to track!

**Step 3: Run the scan**
```bash
leakguard scan test-repo/ --config leakguard/rules/resources.yaml
```

**Step 4: Explain the results**
- If it finds a leak, show them exactly where it is! 
- If it says `Passed! 0 Leaks`, confidently tell the judges: "LeakGuard analyzed the AST for all files in your repository, traced all execution paths, and confirmed that every tracked resource is safely closed." 

*(Pro tip: If it finds 0 leaks, open one of their files, intentionally delete a `close()` statement in front of the judges, and run it again to prove that LeakGuard instantly catches your sabotage!)*
