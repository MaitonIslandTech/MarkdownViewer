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
        try {
            exportPdfBtn.innerText = '生成中...';
            exportPdfBtn.disabled = true;

            const opt = {
                margin:       10,
                filename:     'document.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#1e1e1e', scrollY: 0 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // スクロールバーの影響をなくすため、PDF用のクローン要素を作成
            const element = document.createElement('div');
            element.innerHTML = preview.innerHTML;
            element.className = 'preview-pane';
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            element.style.width = '800px';
            element.style.height = 'auto';
            element.style.overflow = 'visible';
            document.body.appendChild(element);

            html2pdf().set(opt).from(element).save().then(() => {
                document.body.removeChild(element);
                exportPdfBtn.innerText = 'Export PDF';
                exportPdfBtn.disabled = false;
            }).catch(err => {
                console.error(err);
                alert('PDFエラー: ' + err);
                document.body.removeChild(element);
                exportPdfBtn.innerText = 'Export PDF';
                exportPdfBtn.disabled = false;
            });
        } catch (e) {
            alert('PDFライブラリのエラー: ' + e);
            exportPdfBtn.innerText = 'Export PDF';
            exportPdfBtn.disabled = false;
        }
    });
});
