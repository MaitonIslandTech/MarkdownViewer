document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');

    // Configure marked.js to use highlight.js for code blocks
    marked.setOptions({
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
        breaks: true, // Convert \n to <br>
        gfm: true // GitHub Flavored Markdown
    });

    // Function to render markdown to preview
    const renderMarkdown = () => {
        const rawMarkdown = editor.value;
        const rawHtml = marked.parse(rawMarkdown);
        // Sanitize the HTML to prevent XSS
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        preview.innerHTML = cleanHtml;
    };

    // Initial render
    renderMarkdown();

    // Listen for input events on the editor
    editor.addEventListener('input', renderMarkdown);

    // Synchronize scrolling (optional enhancement)
    let isScrollingEditor = false;
    let isScrollingPreview = false;

    editor.addEventListener('scroll', () => {
        if (!isScrollingPreview) {
            isScrollingEditor = true;
            const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
            preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
        }
        isScrollingPreview = false;
    });

    preview.addEventListener('scroll', () => {
        if (!isScrollingEditor) {
            isScrollingPreview = true;
            const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
            editor.scrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
        }
        isScrollingEditor = false;
    });
});
