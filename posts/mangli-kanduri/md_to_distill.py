import re

def convert_md_to_distill(md_file, distill_file):
    """
    Convert Markdown file to Distill-compatible HTML format focusing on h3 headers.
    
    Args:
        md_file (str): Path to input Markdown file
        distill_file (str): Path to output Distill HTML file
    """
    try:
        with open(md_file, 'r', encoding='utf-8') as file:
            md_content = file.read()
        
        # Split content into lines and process
        lines = md_content.split('\n')
        
        distill_content = []
        toc_entries = []
        paragraph_buffer = []
        
        for line in lines:
            line = line.strip()
            
            # Process h3 headers with TOC entry
            if line.startswith("### "):
                # First flush any pending paragraph content
                if paragraph_buffer:
                    distill_content.append(f"<p>{' '.join(paragraph_buffer)}</p>")
                    paragraph_buffer = []
                
                # Process the h3 header
                heading_text = line[4:]
                heading_id = create_id(heading_text)
                
                distill_content.append(f'<h3 id="{heading_id}">{heading_text}</h3>')
                toc_entries.append(f'<li><a href="#{heading_id}">{heading_text}</a></li>')
            
            # Skip images
            elif line.startswith("![") and "](" in line:
                continue
            
            # Process text content
            elif line:
                # Convert Markdown links to HTML
                line = convert_links(line)
                
                # Add to paragraph buffer
                paragraph_buffer.append(line)
            
            # Empty line means paragraph break
            else:
                if paragraph_buffer:
                    distill_content.append(f"<p>{' '.join(paragraph_buffer)}</p>")
                    paragraph_buffer = []
        
        # Don't forget any remaining paragraph content
        if paragraph_buffer:
            distill_content.append(f"<p>{' '.join(paragraph_buffer)}</p>")
        
        # Create TOC
        toc_html = create_toc(toc_entries)
        
        # Combine everything
        final_content = [toc_html] + distill_content
        
        # Write to output file
        with open(distill_file, 'w', encoding='utf-8') as file:
            file.write('\n'.join(final_content))
        
        print(f"Conversion complete. Output saved to {distill_file}")
        
    except Exception as e:
        print(f"Error during conversion: {e}")

def create_id(text):
    """Create a valid HTML ID from header text"""
    # Remove special characters and convert spaces to hyphens
    id_text = re.sub(r'[^\w\s-]', '', text.lower())
    return re.sub(r'[\s-]+', '-', id_text).strip('-')

def convert_links(text):
    """Convert Markdown links to HTML links"""
    return re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)

def create_toc(entries):
    """Create a table of contents HTML block"""
    if not entries:
        return ""
        
    return (
        "<d-contents>\n"
        "  <nav class=\"l-text toc figcaption\">\n"
        "    <h3>Contents</h3>\n"
        "    <ul>\n      " + 
        "\n      ".join(entries) +
        "\n    </ul>\n"
        "  </nav>\n"
        "</d-contents>"
    )

if __name__ == "__main__":
    convert_md_to_distill('mangli-kanduri-_.md', 'output.html')