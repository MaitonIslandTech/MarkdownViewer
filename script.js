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

    // PDF Export functionality
    const exportPdfBtn = document.getElementById('export-pdf');
    exportPdfBtn.addEventListener('click', () => {
        const opt = {
            margin:       10,
            filename:     'document.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#1e1e1e' },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Temporarily adjust styles for better PDF output if needed
        // but default html2canvas usually handles the displayed element well.
        html2pdf().set(opt).from(preview).save();
    });
});
