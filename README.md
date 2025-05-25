## Personal Website

The site is [suryabulusu.github.io](https://suryabulusu.github.io)

### Technologies Used
- HTML5
- CSS3 (with Bulma framework)
- Vue.js 2
- GitHub Pages for hosting

## Development Setup

### Prerequisites
- Node.js (v20 or higher)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/suryabulusu/suryabulusu.github.io.git
cd suryabulusu.github.io

# Install dependencies
npm install

# Set up pre-commit hooks
npm run prepare
```

### Development Commands

```bash
# Lint all files
npm run lint

# Format all files
npm run format

# Fix auto-fixable issues
npm run fix

# Individual commands
npm run lint:html    # Validate HTML
npm run lint:css     # Lint CSS
npm run lint:js      # Lint JavaScript
npm run format:html  # Format HTML
npm run format:css   # Format CSS
npm run format:js    # Format JavaScript
```

### Pre-commit Hooks

This project uses Husky and lint-staged to automatically lint and format code before commits. The hooks will:
- Format code with Prettier
- Lint CSS with Stylelint
- Lint JavaScript with ESLint
- Validate HTML structure

### GitHub Actions

The project includes automated workflows:
- **Lint Check**: Runs on all PRs to ensure code quality
- **Deploy**: Validates code and deploys to GitHub Pages on main branch

### Code Quality Tools

- **ESLint**: JavaScript linting with Vue.js support
- **Stylelint**: CSS linting (catches real errors, ignores legacy patterns)
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **lint-staged**: Run linters on staged files

**Note**: HTML validation is available but not enforced due to legacy blog content.

## TODO

Still figuring out:
* How to surface comments in posts? Disqus Inline comments?
* Better structure; Markdown -> Post conversion?
* ✅ Improve gh actions?
* Implement tagging, pagination
