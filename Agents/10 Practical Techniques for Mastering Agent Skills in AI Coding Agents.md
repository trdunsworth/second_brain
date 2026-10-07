
# 10 Practical Techniques for Mastering Agent Skills in AI Coding Agents

From [10 Practical Techniques for Mastering Agent Skills in AI Coding Agents](https://shibuiyusuke.medium.com/10-practical-techniques-for-mastering-agent-skills-in-ai-coding-agents-6070e4038cf1):

my-skill/  
├── SKILL.md # Required: metadata + instructions  
├── scripts/ # Optional: executable scripts  
├── references/ # Optional: reference documents  
└── assets/ # Optional: templates and resources

``` yaml
---
name: pdf-processing
description: >
	Extracts text and tables from PDF files, fills forms,
	and merges documents. Use when the user mentions
	PDF files, forms, or document extraction.
```

``` markdown
# PDF Processing
## Extracting Text
Use pdfplumber to extract text:
(detailed instructions follow)
```

1. Sharpen Trigger Accuracy with the Frontmatter Description - make certain that you write the description field clearly to ensure the instructions match the intended output.
	1. Write in the third person
	2. Include trigger words
	3. Stay under 1024 characters
	4. List specific operations
2. Design Skills with 3-stage loading in mind
	1. Keep the SKILL.md body under 500 lines
	2. Use links to other Markdown files judiciously
	3. Limit references to one depth level
	4. Add a ToC to longer files.
``` markdown
# Good: direct references from SKILL.md  
**Basic usage**: [instructions in SKILL.md]  
**Advanced features**: See [advanced.md](advanced.md)  
**API reference**: See [reference.md](reference.md)
```
3. Use references to externalize larger knowledge bases
	1. Include splitting by domain where necessary
	2. Use descriptive filenames
	3. Make content searchable
4. Provide reusable tools via scripts with error handling
5. Choose between scopes (User vs Workplace)
	- Personal coding style preferences
	- Frequently used snippets and boilerplate
	- Personal development environment settings
6. Write portable skills for reuse
7. Leverage existing skill ecosystems
	1. [Strands](https://strandsagents.com/examples/)
	2. [SkillsMP Marketplace](https://skillsmp.com/)
	3. [skills.sh](https://skills.sh/)
8. Build workflows by combining skills
	1. Use workflow skill design patterns
	2. Embed feedback loops
	3. Use conditional workflows
9. Be security conscious with skills
	1. Create and use an auditing checklist.
	2. Use caution when referencing external URLs
	3. Disable unused skills
10. Polish Skill Quality through Testing and Iteration
	1. Evaluation-Driven Development (Test Driven Development)
		``` json
		  {  
					"skills": ["pdf-processing"],  
					"query": "Extract text from this PDF file and save it to output.txt",  
					"files": ["test-files/document.pdf"],  
					"expected_behavior": [  
						"Read the PDF using an appropriate PDF processing library",  
						"Extract text from all pages",  
						"Save the text to output.txt"  
						]  
					}
		```
	2. Iterative development cycles
		``` mermaid
		graph TD
		A[Claude A: Skill Creator] -->|Creates Skill| B[SKILL.md]
		B --> |Loads Skill| C[Claude B: Skill User]
		C --> |Executes real tasks| D[Observations]
		D --> |Feedback| A
		A --> |Improves| B
		``` 
	3. Observe the output
	4. Test Across Multiple Models


