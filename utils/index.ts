import { Property, User } from '@/types';

const toArray = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string')
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
};

const toSlug = (value: string) => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const removeVietnameseTones = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
};

export function buildWhereFromParams(params: any) {
  const searchConditions: any[] = [];

  const searchRaw = (params.search || params.q)?.toString().trim() || '';
  const cleanQuery = searchRaw ? removeVietnameseTones(searchRaw) : '';
  const slugQuery = searchRaw ? toSlug(searchRaw) : '';

  if (searchRaw && cleanQuery) {
    const words = cleanQuery.split(/\s+/).filter((w) => w.length >= 2);

    // Search by title, description, address
    searchConditions.push(
      { title: { contains: cleanQuery } },
      { description: { contains: cleanQuery } },
      { address: { contains: cleanQuery } }
    );

    // Search each keyword
    words.forEach((w) => {
      searchConditions.push(
        { title: { contains: w } },
        { description: { contains: w } },
        { address: { contains: w } }
      );
    });

    // district / ward
    searchConditions.push(
      { 'district.name': { contains: searchRaw } },
      { 'district.name': { contains: cleanQuery } },
      { 'ward.name': { contains: searchRaw } },
      { 'ward.name': { contains: cleanQuery } }
    );

    // slug
    searchConditions.push({ slug: { contains: slugQuery } });
  }

  const priceMin = params.price_min ? Number(params.price_min) : undefined;
  const priceMax = params.price_max ? Number(params.price_max) : undefined;
  const areaMin = params.area_min ? Number(params.area_min) : undefined;
  const areaMax = params.area_max ? Number(params.area_max) : undefined;

  const where: any = {
    and: [
      { is_published: { equals: true } },
      { is_hidden: { equals: false } },
      {
        or: [
          { expire_at: { exists: false } },
          { expire_at: { greater_than_equal: new Date().toISOString() } },
        ],
      },
      ...(searchConditions.length ? [{ or: searchConditions }] : []),
      ...(params.p_types
        ? [{ 'type.value': { in: toArray(params.p_types) } }]
        : []),
      ...(params.d
        ? [{ 'district.code': { in: toArray(params.d).map(Number) } }]
        : []),
      ...(params.w
        ? [{ 'ward.code': { in: toArray(params.w).map(Number) } }]
        : []),
      ...(priceMin !== undefined
        ? [{ price: { greater_than_equal: priceMin } }]
        : []),
      ...(priceMax !== undefined
        ? [{ price: { less_than_equal: priceMax } }]
        : []),
      ...(areaMin !== undefined
        ? [{ area: { greater_than_equal: areaMin } }]
        : []),
      ...(areaMax !== undefined
        ? [{ area: { less_than_equal: areaMax } }]
        : []),
    ],
  };

  return where;
}

export function buildWhereFromStatus(params: any) {
  const now = new Date().toISOString();
  const fiveDaysLater = new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000
  ).toISOString();

  let where: any = {
    seller: { equals: params.user?.id },
  };

  const status = params.status;

  if (status) {
    const conditions: any[] = [];

    switch (status) {
      case 'published':
        conditions.push(
          { is_published: { equals: true } },
          { is_hidden: { equals: false } },
          {
            or: [
              { expire_at: { exists: false } },
              { expire_at: { greater_than_equal: now } },
            ],
          }
        );
        break;

      case 'unpublished':
        conditions.push(
          { is_published: { equals: false } },
          { is_hidden: { equals: false } }
        );
        break;

      case 'deleted':
        conditions.push({ is_hidden: { equals: true } });
        break;

      case 'expired':
        conditions.push({ expire_at: { less_than: now } });
        break;

      case 'expiring':
        conditions.push(
          { expire_at: { greater_than_equal: now } },
          { expire_at: { less_than_equal: fiveDaysLater } }
        );
        break;
    }

    where = { and: [where, ...conditions] };
  }

  // ---- SEARCH ----
  if (params.search?.trim()) {
    const s = params.search.trim();

    const searchConditions = {
      or: [
        { title: { contains: s } },
        { address: { contains: s } },
        { description: { contains: s } },
      ],
    };

    where = { and: [where, searchConditions] };
  }

  return where;
}

export function encodeWhere(where: any) {
  return JSON.stringify(where);
}

export function encodePayloadWhere(where: any) {
  return JSON.stringify(where);
}

export const getImageUrl = (img?: any): string => {
  if (!img) return '';

  // case: image: "abc123"
  if (typeof img === 'string') {
    return `http://192.168.2.120:3000/api/media/file/${img}`;
  }

  // case: image: { url: "/api/media/file/xxx.jpg" }
  if (typeof img === 'object' && img.url) {
    return `http://192.168.2.120:3000${img.url}`;
  }

  return '';
};

export const getSellerAvatar = (seller: string | User) => {
  if (!seller || typeof seller === 'string') return '';

  const avatar = seller.avatar as any;

  if (!avatar) return '';
  if (typeof avatar === 'string')
    return `http://192.168.2.120:3000/api/media/file/${avatar}`;

  if (avatar.url) return `http://192.168.2.120:3000${avatar.url}`;

  return '';
};

export const getSellerName = (seller: string | User) => {
  if (!seller) return 'Người đăng';
  if (typeof seller === 'string') return 'Người đăng';
  return seller.name ?? 'Người đăng';
};

export const getFullAddress = (property: Property) => {
  const province =
    typeof property.province === 'string' ? '' : property.province?.name;
  const district =
    typeof property.district === 'string' ? '' : property.district?.name;
  const ward = typeof property.ward === 'string' ? '' : property.ward?.name;

  return `${ward ? ward + ', ' : ''}${district ? district + ', ' : ''}${
    province || ''
  }`;
};

// --------------------------
// RESOLVE IMAGE URL
// --------------------------
export const resolveImageUrl = (relative?: string | null | undefined) => {
  if (!relative) return null;
  if (relative.startsWith('http')) return relative;
  return `${process.env.EXPO_PUBLIC_API_URL}${relative}`;
};
