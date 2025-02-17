export interface TextContent {
  type: string;
}

export interface Image {
  type: "Image";
  url: string;
  description?: string;
}

export interface SupportingText {
  type: string;
}

export interface Point {
  type: string;
  header: TextContent;
  supportingText: SupportingText;
}

export interface SectionComponents {
  header?: TextContent;
  subHeader?: TextContent;
  points?: Point[];
  images?: Image[];
  requirement?: string;
}

export interface Section {
  type: string;
  components: SectionComponents;
}

export interface Testimonial {
  type: "Testimonial";
  content: string;
  mediaType: "Review" | "Video";
  influencer?: boolean;
}

export interface LandingPage {
  LandingPage: string;
  sections: Section[];
  testimonials?: Testimonial[];
}
