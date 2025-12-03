// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Chatbot functionality
if (document.getElementById('chatMessages')) {
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const modelSelector = document.getElementById('modelSelector');

    // Constants
    const TYPING_DELAY_MS = 800;

    // Predefined responses for different questions
    const responses = {
        'How do I filter files larger than 1MB in Nushell?': {
            model: 'gpt-3.5-turbo',
            response: `This command:
1. Lists all files in the current directory with <code>ls</code>
2. Filters the results using <code>where</code> to show only files where <code>size > 1mb</code>

You can also combine this with other filters:

<pre><code># Show only files (not directories) larger than 1MB
ls | where type == "file" and size > 1mb

# Sort by size and show top 10
ls | where size > 1mb | sort-by size --reverse | first 10</code></pre>

The <code>where</code> command in Nushell is very powerful for filtering structured data!`
        },
        "What's the difference between 'where' and 'select' in Nushell?": {
            model: 'gpt-4',
            response: `Great question! These are two fundamental commands in Nushell with different purposes:

<strong>where</strong> - Filters rows based on conditions:
<pre><code># Keep only rows where condition is true
ls | where size > 1mb</code></pre>

<strong>select</strong> - Chooses which columns to display:
<pre><code># Show only name and size columns
ls | select name size</code></pre>

You can combine them:
<pre><code># Filter large files and show only name and size
ls | where size > 1mb | select name size</code></pre>

Think of it like SQL:
- <code>where</code> = WHERE clause (filters rows)
- <code>select</code> = SELECT clause (picks columns)`
        },
        'How can I convert a JSON file to CSV using Nushell?': {
            model: 'gpt-4-turbo',
            response: `Converting between formats in Nushell is straightforward:

<pre><code># Basic conversion
open data.json | to csv | save data.csv

# With custom delimiter
open data.json | to csv --separator ";" | save data.csv

# Pretty print first to check
open data.json | to csv</code></pre>

For nested JSON, you might need to flatten first:
<pre><code># Flatten nested structure
open data.json | flatten | to csv | save data.csv</code></pre>

Nushell automatically handles the structure conversion! You can also:
- Use <code>to json</code> to go the other way
- Use <code>to yaml</code>, <code>to toml</code> for other formats
- Chain multiple transformations in a pipeline`
        },
        'Show me how to group data by a column in Nushell': {
            model: 'gpt-4',
            response: `Grouping data in Nushell uses the <code>group-by</code> command:

<pre><code># Group files by extension
ls | group-by extension

# Group and count items in each group
ls | group-by extension | transpose name count | 
    each { |row| {extension: $row.name, count: ($row.count | length)} }</code></pre>

More advanced examples:
<pre><code># Group by type and calculate total size
ls | group-by type | 
    transpose key items | 
    each { |row| {
        type: $row.key, 
        count: ($row.items | length),
        total_size: ($row.items | get size | math sum)
    } }

# Group by multiple columns
$data | group-by [status priority]</code></pre>

The <code>group-by</code> command returns a record where keys are the group values and values are lists of items in each group.`
        },
        'How do I parse and analyze log files with Nushell?': {
            model: 'gpt-4-turbo',
            response: `Nushell is excellent for log analysis! Here are some patterns:

<pre><code># Parse a standard log format
open server.log | 
    lines | 
    parse "{timestamp} [{level}] {message}" |
    where level == "ERROR"

# Count errors by type
open server.log |
    lines |
    parse "{timestamp} [{level}] {message}" |
    where level == "ERROR" |
    group-by message |
    transpose error count |
    each { |row| {error: $row.error, count: ($row.count | length)} } |
    sort-by count --reverse

# Analyze access logs
open access.log |
    lines |
    parse "{ip} - - [{timestamp}] \"{method} {path} {protocol}\" {status} {size}" |
    where status >= 400 |
    group-by status |
    transpose code requests |
    each { |row| {status_code: $row.code, count: ($row.requests | length)} }</code></pre>

You can also use <code>str contains</code>, <code>str starts-with</code>, and regular expressions with <code>parse</code> for more complex patterns!`
        }
    };

    // Add initial welcome message
    addMessage('assistant', `Hello! I'm your Nushell AI Assistant. 👋

I can help you with:
- Understanding Nushell commands
- Writing pipelines and filters
- Working with structured data
- Converting between file formats
- And much more!

<strong>Note:</strong> This is a demo with simulated responses. For real ChatGPT assistance, check out our <a href="../tutorials/ai-integration-setup.html">setup tutorial</a>.

Try clicking a suggested question below or ask me anything about Nushell!`);

    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Suggested question buttons
    document.querySelectorAll('.question-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.textContent.trim();
            chatInput.value = question;
            sendMessage();
        });
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage('user', message);
        chatInput.value = '';

        // Simulate typing delay
        setTimeout(() => {
            const selectedModel = modelSelector.value;
            
            // Find matching response
            let response = responses[message];
            
            if (!response) {
                // Default response for unmatched questions
                response = {
                    model: selectedModel,
                    response: `I understand you're asking about: "${message}"

While this is a demo with limited responses, in a real implementation with ChatGPT, I would provide detailed assistance on this topic.

For now, try clicking one of the suggested questions below to see example responses, or check out our <a href="../tutorials/index.html">tutorials</a> for comprehensive guides!`
                };
            }

            // Update model selector to match response
            if (response.model && modelSelector.value !== response.model) {
                modelSelector.value = response.model;
            }

            addMessage('assistant', response.response);
        }, TYPING_DELAY_MS);
    }

    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const header = document.createElement('div');
        header.className = 'message-header';
        header.innerHTML = role === 'assistant' 
            ? '🤖 Nushell AI Assistant' 
            : '👤 You';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;

        messageDiv.appendChild(header);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
