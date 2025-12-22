import { Property, User } from '@/types';
import qs from 'qs';

export const formatPrice = (price: number): string => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,   // Tối đa 2 chữ số thập phân
    minimumFractionDigits: 0,   // Không bắt buộc có thập phân
  });

  if (price >= 1_000_000_000) {
    const billions = price / 1_000_000_000;
    // Nếu là số nguyên tỷ → không hiện .0
    const formatted = billions % 1 === 0 
      ? formatter.format(billions).replace(/,\d+$/, "") 
      : formatter.format(billions);
    return `${formatted} tỷ`;
  } else {
    const millions = price / 1_000_000;
    const formatted = millions % 1 === 0 
      ? formatter.format(millions).replace(/,\d+$/, "") 
      : formatter.format(millions);
    return `${formatted} triệu`;
  }
};

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
  console.log(params);

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
      ...(params.is_vip ? [{ is_vip: { equals: params.is_vip } }] : []),
      ...(params.seller ? [{ seller: { equals: params.seller } }] : []),
      ...(searchConditions.length ? [{ or: searchConditions }] : []),
      ...(params.type ? [{ 'type.value': { equals: params.type } }] : []),
      ...(params.district
        ? [{ 'district.code': { equals: params.district } }]
        : []),
      ...(params.ward ? [{ 'ward.code': { equals: params.ward } }] : []),
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

export function buildWhereFromStatus(params: {
  userId: string;
  status?: 'published' | 'unpublished' | 'deleted' | 'expired' | 'expiring';
  search?: string;
}) {
  const now = new Date().toISOString();
  const fiveDaysLater = new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000
  ).toISOString();

  let where: any = {
    seller: { equals: params.userId },
  };
  if (params.status) {
    const conditions: any[] = [];

    switch (params.status) {
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

  // Search (nếu cần tìm trong tab)
  if (params.search?.trim()) {
    const s = params.search.trim();
    const searchConditions = {
      or: [
        { title: { contains: s, mode: 'insensitive' } },
        { address: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
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
  return qs.stringify(
    { where },
    {
      allowDots: true,
      encode: false,
    }
  );
}

export const getImageUrl = (img?: any): string => {
  if (!img) return '';

  // case: image: "abc123"
  if (typeof img === 'string') {
    return `${process.env.EXPO_PUBLIC_API_URL}/api/media/file/${img}`;
  }

  // case: image: { url: "/api/media/file/xxx.jpg" }
  if (typeof img === 'object' && img.url) {
    return `${process.env.EXPO_PUBLIC_API_URL}${img.url}`;
  }

  return '';
};

export const getSellerAvatar = (seller: string | User) => {
  if (!seller || typeof seller === 'string') return '';

  const avatar = seller.avatar as any;

  if (!avatar) return '';
  if (typeof avatar === 'string')
    return `${process.env.EXPO_PUBLIC_API_URL}/api/media/file/${avatar}`;

  if (avatar.url) return `${process.env.EXPO_PUBLIC_API_URL}${avatar.url}`;

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

// utils/payloadQuery.ts

interface PayloadQueryOptions {
  path: string; // endpoint path → /api/wards, /api/properties
  limit?: number;
  page?: number;
  sort?: string | string[];
  where?: Record<string, any>;
  otherParams?: Record<string, any>; // optional (expand: depth, populate...)
}

export function generatePayloadQuery({
  path,
  limit,
  page,
  sort,
  where = {},
  otherParams = {},
}: PayloadQueryOptions) {
  const queryString = qs.stringify(
    {
      ...(limit !== undefined ? { limit } : {}),
      ...(page !== undefined ? { page } : {}),
      ...(sort !== undefined ? { sort } : {}),
      where,
      ...otherParams,
    },
    { encode: false }
  );

  return `${path}?${queryString}`;
}
