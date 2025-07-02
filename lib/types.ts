// lib/types.ts
export type ModuleType = "TEXT" | "LIST" | "TESTIMONIAL" | "MEDIA" | "TABLE";

export type TextSubtype =
  | "HEADER"
  | "SUB_HEADER"
  | "PARAGRAPH"
  | "CTA"
  | "SHOP_NOW";

export type MediaSubtype = "VIDEO" | "IMAGE";

export type ListSubtype =
  | "BULLET_POINTS"
  | "BULLET_POINTS_WITH_SUPPORTING_TEXT";

export type TestimonialSubtype = "TESTIMONIAL";

export type TableSubtype = "TABLE_1" | "TABLE_2";

export type ModuleSubtype =
  | TextSubtype
  | MediaSubtype
  | ListSubtype
  | TestimonialSubtype
  | TableSubtype;

// Module content types
export type TextContent =
  | string
  | {
      text: string;
      url: string;
    };

export type MediaContent = {
  mediaList: Array<{
    link: string;
    extension: string;
    type: string;
  }>;
};

export type BulletPoint = string;

export type BulletPointWithSupport = {
  title: string;
  supportingText: string;
};

export type TestimonialContent = {
  quote: string;
  author: string;
  designation?: string;
};

export type TableContent = {
  headers: string[];
  rows: string[][];
};

export type ModuleContent =
  | TextContent
  | MediaContent
  | BulletPoint[]
  | BulletPointWithSupport[]
  | TestimonialContent
  | TableContent
  | any; // Allow any content type to handle flexible module formats

export interface Module {
  type: ModuleType;
  subtype: ModuleSubtype;
  content?: ModuleContent;
  mediaList?: Array<{
    link: string;
    extension: string;
    type: string;
  }>;
}

export interface LandingPageSection {
  title: string;
  description: string;
}

export interface LandingPageData {
  title: string;
  sections: LandingPageSection[];
}

export interface GenerateLandingPageRequest {
  url: string;
  prompt?: string;
}

export interface FormatModulesRequest {
  sections: LandingPageSection[];
}
