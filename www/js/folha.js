function limitLines(textarea, maxLines) {
    const lines = textarea.value.split('\n');
    if (lines.length > maxLines) {
        textarea.value = lines.slice(0, maxLines).join('\n');
    }
}

function clearPlaceholder(textarea) {
    if (textarea.placeholder === 'Escreva sua redação aqui...') {
        textarea.placeholder = '';
    }
}

function restorePlaceholder(textarea) {
    if (textarea.value === '') {
        textarea.placeholder = 'Escreva sua redação aqui...';
    }
}