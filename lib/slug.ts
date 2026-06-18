const adjectives = [
    'amber', 'brass', 'coral', 'dusty', 'emery', 'flint', 'frost', 'ghost',
    'hazel', 'ivory', 'jade', 'khaki', 'lavender', 'mauve', 'neon', 'olive',
    'pearl', 'quartz', 'rust', 'silver', 'steel', 'taupe', 'umber', 'velvet',
    'wheat', 'xenon', 'yarn', 'zinc', 'azure', 'blush', 'crimson', 'denim',
];

const nouns = [
    'anchor', 'bridge', 'crane', 'delta', 'echo', 'forge', 'grain', 'hedge',
    'index', 'joint', 'knoll', 'latch', 'marsh', 'north', 'oasis', 'pivot',
    'query', 'ridge', 'spine', 'trait', 'uncle', 'valve', 'waste', 'xenon',
    'yield', 'zones', 'cabin', 'dawn', 'ember', 'flame', 'glade', 'haven',
];

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSlug(): string {
    const adj = pick(adjectives);
    const noun = pick(nouns);
    const suffix = Math.random().toString(36).substring(2, 5);
    return `${adj}-${noun}-${suffix}`;
}

export function sanitizeSlug(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48);
}
