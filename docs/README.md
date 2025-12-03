# Nushell GitHub Pages Site

This directory contains a complete GitHub Pages site for the Nushell project, featuring a blog, tutorials, and a live AI chatbot demo.

## Features

### 📝 Blog Section (`/blog`)
- 6 sample blog posts covering AI integration, data pipelines, and cross-platform development
- Card-based layout with metadata (dates, tags, authors)
- Responsive grid layout

### 📚 Tutorials Section (`/tutorials`)
- **Getting Started** (15min, beginner): Installation, basic commands, file operations
- **Data Pipelines** (25min, intermediate): Filtering, transforming structured data (JSON/CSV)
- **AI Integration Setup** (20min, intermediate): ChatGPT configuration and usage

### 🤖 Live Chatbot (`/chatbot`)
- Simulated AI assistant demonstrating integration concept
- Model selector (GPT-4, GPT-4 Turbo, GPT-3.5)
- Pre-populated responses for common Nushell questions
- Syntax-highlighted code examples

## Technical Stack

- **Pure HTML/CSS/JS** - No build process required
- **Jekyll compatible** - Works with GitHub Pages out of the box
- **Responsive design** - Mobile, tablet, and desktop support
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Purple-blue gradient theme** - Matching Nushell branding
- **Interactive features**:
  - Sticky navigation with hamburger menu (mobile)
  - Scroll-triggered fade-in animations
  - Interactive chatbot with simulated responses

## Deployment

### Option 1: GitHub Pages (Recommended)

1. Go to your repository's **Settings**
2. Navigate to **Pages** (in the left sidebar)
3. Under **Source**, select:
   - **Branch**: `main` (or your target branch)
   - **Folder**: `/docs`
4. Click **Save**

Your site will be available at: `https://<username>.github.io/<repository-name>/`

For this repository: `https://wsx7524999.github.io/chanfana-openapi-template/`

### Option 2: Local Development

To test the site locally:

```bash
# Navigate to the docs directory
cd docs

# Start a simple HTTP server
python3 -m http.server 8080

# Or with Node.js
npx http-server -p 8080

# Visit http://localhost:8080 in your browser
```

## File Structure

```
docs/
├── index.html              # Homepage
├── _config.yml            # Jekyll configuration
├── README.md              # This file
├── css/
│   └── styles.css         # All styling
├── js/
│   └── main.js            # Interactive functionality
├── blog/
│   └── index.html         # Blog listing page
├── tutorials/
│   ├── index.html         # Tutorials listing
│   ├── getting-started.html
│   ├── data-pipelines.html
│   └── ai-integration-setup.html
└── chatbot/
    └── index.html         # AI chatbot demo
```

## Customization

### Updating Links
The GitHub link in the navigation currently points to:
```
https://github.com/wsx7524999/chanfana-openapi-template
```

Update this in all HTML files to point to your actual repository.

### Modifying Colors
The purple-blue gradient theme is defined in `css/styles.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adding Blog Posts
Add new blog posts to `blog/index.html` following the existing card structure:
```html
<article class="blog-card fade-in">
    <div class="blog-card-content">
        <!-- Your content here -->
    </div>
</article>
```

### Extending Chatbot Responses
Add more responses in `js/main.js` in the `responses` object:
```javascript
const responses = {
    'Your question': {
        model: 'gpt-4',
        response: 'Your response...'
    }
};
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This site template is part of the Nushell project and is licensed under the MIT License.

## Contributing

To contribute to this documentation site:
1. Fork the repository
2. Make your changes in the `docs/` directory
3. Test locally using the instructions above
4. Submit a pull request

## Screenshots

See the main issue/PR for screenshots of:
- Homepage
- Blog section
- Tutorials section
- Live chatbot
- Chatbot with interaction
