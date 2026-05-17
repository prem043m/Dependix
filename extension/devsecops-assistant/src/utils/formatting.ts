export function formatDateTime(
    value: string | number | null | undefined
): string {
    if (!value) {
        return 'Not available';
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Not available';
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            dateStyle: 'medium',
            timeStyle: 'short'
        }
    ).format(date);
}

export function escapeHtml(
    value: string
): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll('\'', '&#39;');
}
