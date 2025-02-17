import React from "react";

export type SectionProps = {
  sections: Array<{
    contentBlocks: Array<{
      type:
        | "header"
        | "subheader"
        | "paragraph"
        | "bulletPoints"
        | "testimonials"
        | "table"
        | "image"
        | "video"
        | "cta" 
        | "button";
      content?: string; 
      bullets?: Array<{ bulletPoint: string; supportingText: string }>; 
      testimonials?: Array<{ author?: string; quote: string }>; 
      table?: { headers: string[]; rows: string[][] }; 
      image?: { url: string; alt?: string };
      video?: { url: string; title?: string }; 
      cta?: { text: string; url: string }; 
      button?: { text: string; url: string };
    }>;
  }>;
};


const sections:SectionProps = {
 "sections": [{
  "contentBlocks": [
    {
      "type": "header",
      "content": "🌟 Transform Your Curls with Vilvah’s Goat Milk Shampoo 🌟",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "subheader",
      "content": "Promotional Offer",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "paragraph",
      "content": "❤️ Curls deserve the best care! Experience a revolution in hair care with Vilvah's Goat Milk Shampoo – now at an irresistible FLAT 20% OFF!",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "header",
      "content": "Why You’ll Love It",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "subheader",
      "content": "Key Benefits",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "bulletPoints",
      "content": "",
      "bullets": [
        {
          "bulletPoint": "Zero Chemicals",
          "supportingText": "Because your hair deserves pure, natural nourishment."
        },
        {
          "bulletPoint": "5x Less Frizz in Just 1 Wash",
          "supportingText": "See the difference after the first use."
        },
        {
          "bulletPoint": "Bounce & Shine",
          "supportingText": "Enjoy defined, bouncy curls in just a few washes!"
        }
      ],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "header",
      "content": "Your Journey to Perfect Curls Starts Here",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "subheader",
      "content": "Importance of Healthy Hair",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "paragraph",
      "content": "Healthy hair isn’t just about appearance; it’s about long-term care.",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "subheader",
      "content": "Features of Vilvah’s Goat Milk Shampoo",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "bulletPoints",
      "content": "",
      "bullets": [
        {
          "bulletPoint": "Hydration",
          "supportingText": "Vilvah’s Goat Milk Shampoo is packed with the goodness of goat milk."
        },
        {
          "bulletPoint": "Strengthening",
          "supportingText": "Designed to hydrate and strengthen your curls with every wash."
        },
        {
          "bulletPoint": "Transformation",
          "supportingText": "Transform your curls."
        }
      ],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "header",
      "content": "What Makes Goat Milk So Special?",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "bulletPoints",
      "content": "",
      "bullets": [
        {
          "bulletPoint": "Deep Hydration",
          "supportingText": "Deep hydration for dry, frizzy hair."
        },
        {
          "bulletPoint": "Nutritional Benefits",
          "supportingText": "Rich in vitamins and nutrients for scalp health."
        },
        {
          "bulletPoint": "Gentle Cleansing",
          "supportingText": "Gentle cleansing without stripping natural oils."
        }
      ],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "header",
      "content": "Call to Action",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "subheader",
      "content": "Special Offer",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "paragraph",
      "content": "Don’t Miss Out – Give Your Hair the Love It Deserves. With FLAT 20% OFF, there’s no better time to make the switch to a healthier, chemical-free hair care routine.",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "button",
      "content": "🛒 Shop Now",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "#shop-now" }
    },
    {
      "type": "header",
      "content": "Customer Testimonials",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "testimonials",
      "content": "",
      "bullets": [],
      "testimonials": [
        {
          "author": "Priya R.",
          "quote": "My curls have never felt this soft and manageable! Truly a game-changer."
        },
        {
          "author": "Sneha T.",
          "quote": "Frizz-free and bouncy – just like they promised. Absolutely in love!"
        }
      ],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "header",
      "content": "Final Call to Action",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "subheader",
      "content": "Encouragement to Order",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "paragraph",
      "content": "What Are You Waiting For? Your dream curls are just one wash away.",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "subheader",
      "content": "Reminder of Offer",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "paragraph",
      "content": "Order Now and save big while making your hair healthier, shinier, and frizz-free.",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "header",
      "content": "Limited Time Offer",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "subheader",
      "content": "Urgency",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "paragraph",
      "content": "🎉 Buy Now – FLAT 20% OFF",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "subheader",
      "content": "Closing Remark",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    },
    {
      "type": "paragraph",
      "content": "💌 Limited time offer. Grab yours before it’s gone!",
      "bullets": [],
      "testimonials": [],
      "table": { "headers": [], "rows": [] },
      "image": { "url": "", "alt": "" },
      "video": { "url": "", "title": "" },
      "cta": { "text": "", "url": "" },
      "button": { "text": "", "url": "" }
    }
  ]
  
}
]
}


const Sections: React.FC = () => {
  return (
    <div className="space-y-10 lg:space-y-16 bg-gray-50 p-6 lg:p-12">
      {sections.sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="bg-white p-6 lg:p-8 shadow-lg rounded-lg transition hover:shadow-xl"
        >
          {section.contentBlocks.map((block, blockIndex) => {
            switch (block.type) {
              case "header":
                return (
                  <h2
                    key={blockIndex}
                    className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4"
                  >
                    {block.content}
                  </h2>
                );
              case "subheader":
                return (
                  <h3
                    key={blockIndex}
                    className="text-xl lg:text-2xl font-semibold text-gray-800 mb-4"
                  >
                    {block.content}
                  </h3>
                );
              case "paragraph":
                return (
                  <p
                    key={blockIndex}
                    className="text-gray-700 text-base lg:text-lg leading-relaxed mb-6"
                  >
                    {block.content}
                  </p>
                );
              case "bulletPoints":
                return (
                  <div key={blockIndex} className="space-y-4 mb-6">
                    {block.bullets?.map((item, bulletIndex) => (
                      <div
                        key={bulletIndex}
                        className="flex items-start gap-2"
                      >
                        <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-600"></div>
                        <div>
                          <h4 className="text-gray-800 font-semibold text-base lg:text-lg">
                            {item.bulletPoint}
                          </h4>
                          <p className="text-gray-600 text-sm lg:text-base">
                            {item.supportingText}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
                
              case "testimonials":
                return (
                  <div key={blockIndex} className="space-y-6 mb-6">
                    {block.testimonials?.map((testimonial, testimonialIndex) => (
                      <blockquote
                        key={testimonialIndex}
                        className="bg-gray-50 p-4 border-l-4 border-green-600"
                      >
                        <p className="text-gray-800 italic text-base lg:text-lg">
                          “{testimonial.quote}”
                        </p>
                        {testimonial.author && (
                          <footer className="text-gray-600 mt-2 text-sm">
                            - {testimonial.author}
                          </footer>
                        )}
                      </blockquote>
                    ))}
                  </div>
                );
              case "table":
                return (
                  <div key={blockIndex} className="overflow-x-auto mb-6">
                    <table className="min-w-full table-auto border border-gray-300 bg-gray-100">
                      <thead>
                        <tr className="bg-gray-200">
                          {block.table?.headers.map((header, headerIndex) => (
                            <th
                              key={headerIndex}
                              className="border border-gray-300 px-4 py-2 text-left text-gray-800 font-semibold"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.table?.rows.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="border border-gray-300 px-4 py-2 text-gray-700"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              case "image":
                return (
                  <div key={blockIndex} className="mb-6">
                    <img
                      src={block.image?.url}
                      alt={block.image?.alt || "Image"}
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                );
              case "video":
                return (
                  <div key={blockIndex} className="mb-6">
                    <iframe
                      title={block.video?.title || "Video"}
                      src={block.video?.url}
                      className="w-full h-64 lg:h-80 rounded-lg shadow-md"
                      allowFullScreen
                    />
                  </div>
                );
              case "cta":
                return (
                  <div key={blockIndex} className="mt-6 flex flex-col justify-center items-center bg-slate-100 p-4">

                    <p className="text-black text-xl">
                      {block.cta?.text}</p>
                    <a
                      href={block.cta?.url}
                      className="m-6 my-4 inline-block px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 hover:scale-105 transition-transform"
                    >
                     Buy Now !
                    </a>
                  </div>
                );
              case "button":
                return (
                  <div key={blockIndex} className="mt-6">
                    <a
                      href={block.button?.url}
                      className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition-transform"
                    >
                      {block.button?.text}
                    </a> 
                    </div>
                );
              default:
                return null;
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Sections;
