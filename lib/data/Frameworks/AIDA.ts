import { LandingPage } from "./BlogDataTypes";
export const AIDA: LandingPage = {
  LandingPage: "AIDA",
  sections: [
    {
      type: "Attention",
      components: {
        header: { type: "Introductory Header of Attention section" },
      },
    },
    {
      type: "Interest",
      components: {
        header: { type: "Header of Interest section" },
        points: [
          {
            type: "1st Point Interest section",
            header: { type: "header of 1st point" },
            supportingText: {
              type: "SupportingText of 1st point",
            },
          },
          {
            type: "2nd Point Interest section",
            header: { type: "header of 2nd point" },
            supportingText: {
              type: "SupportingText of 2nd point",
            },
          },
          {
            type: "3rd Point Interest section",
            header: { type: "header of 3rd point" },
            supportingText: {
              type: "SupportingText of 3rd point",
            },
          },
        ],
      },
    },
    {
      type: "Desire",
      components: {
        header: { type: "Header of Desire section" },
        points: [
          {
            type: "1st Point Desire section",
            header: { type: "header of 1st point" },
            supportingText: {
              type: "SupportingText of 1st point",
            },
          },
          {
            type: "2nd Point Desire section",
            header: { type: "header of 2nd point" },
            supportingText: {
              type: "SupportingText of 2nd point",
            },
          },
          {
            type: "3rd Point Desire section",
            header: { type: "header of 3rd point" },
            supportingText: {
              type: "SupportingText of 3rd point",
            },
          },
        ],
      },
    },
  ],
};
