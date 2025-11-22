export function buildQueryParams(params: Record<string, string | number | undefined>): string {
  const queryParts: string[] = [];

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });

  return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
}

export function buildPRQueryParams(options: {
  state?: string;
  author?: string;
  reviewer?: string;
  sort?: string;
  limit?: number;
}): string {
  const params: Record<string, string | number | undefined> = {};

  if (options.state) {
    params.state = options.state.toUpperCase();
  }

  if (options.author) {
    params['q'] = `author.username="${options.author}"`;
  }

  if (options.sort) {
    params.sort = options.sort;
  }

  if (options.limit) {
    params.pagelen = options.limit;
  }

  return buildQueryParams(params);
}
