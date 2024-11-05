# using GPT 4o + small edits
import re

def convert_md_to_distill(md_file, distill_file):
    with open(md_file, 'r') as file:
        md_content = file.readlines()

    distill_content = []
    toc_content = []
    paper_block = []
    current_id = 1

    for line in md_content:
        line = line.strip()

        # Process ## headers as h2 with TOC entry
        if line.startswith("## "):
            heading_text = line[3:]
            heading_id = heading_text.lower().replace(" ", "-")
            distill_content.append(f'<h2 id="{heading_id}">{heading_text}</h2>')
            toc_content.append(f'<div><a href="#{heading_id}">{heading_text}</a></div>')

        # Process ### headers as h3 with TOC entry as list item
        elif line.startswith("### "):
            heading_text = line[4:]
            heading_id = heading_text.lower().replace(" ", "-")
            distill_content.append(f'<h3 id="{heading_id}">{heading_text}</h3>')
            toc_content.append(f'<li><a href="#{heading_id}">{heading_text}</a></li>')

        # Skip images
        elif line.startswith("![") and "](" in line:
            continue

        # Process inline links and text blocks
        elif line:
            # Convert Markdown links [text](url) to HTML <a href="url">text</a>
            line = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', line)
            
            if paper_block and line:  # Add line as part of previous block if no double line break
                paper_block[-1] += f"<br>{line}"
            else:  # Otherwise start a new paragraph or block
                paper_block.append(line)
        
        # Empty line: output any accumulated block content
        else:
            if paper_block:
                for entry in paper_block:
                    distill_content.append(f"<p>{entry}</p>")
                paper_block.clear()
            distill_content.append("\n")  # Retain space for readability

    # Wrap TOC content at the beginning
    toc_html = (
        "<d-contents>\n"
        "  <nav class=\"l-text toc figcaption\">\n"
        "    <h3>Contents</h3>\n"
        + "    " + "\n    ".join(toc_content) +
        "\n  </nav>\n</d-contents>\n"
    )

    # Add TOC to start of the output content
    distill_content.insert(0, toc_html)

    with open(distill_file, 'w') as file:
        file.writelines(distill_content)

    print(f"Conversion complete. Output saved to {distill_file}")

convert_md_to_distill('writeup_taste.md', 'output.html')
