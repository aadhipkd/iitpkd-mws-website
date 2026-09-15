import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const navLink = z.object({
  label: z.string(),
  href: z.string(),
});

const quickLink = z.object({
  title: z.string(),
  href: z.string(),
  icon: z.enum(["monitor", "camera", "speaker", "megaphone"]),
});

const service = z.object({
  number: z.string(),
  title: z.string(),
  description: z.string(),
  href: z.string(),
});

const stat = z.object({
  number: z.string(),
  label: z.string(),
});

const page = z.object({
  pageTitle: z.string(),
  headerTitle: z.string(),
  headerSubtitle: z.string().optional(),
  blocks: z
    .array(
      z.object({
        type: z.string(),
        title: z.string().optional(),
        text: z.string().optional(),
        number: z.string().optional(),
        section: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        align: z.enum(["center", "left", "right"]).optional(),
        items: z.array(z.string()).optional(),
        links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
        label: z.string().optional(),
        value: z.string().optional(),
      })
    )
    .optional(),
  body: z.string().optional(),
});

const settings = z.object({
  siteTitle: z.string(),
  siteDescription: z.string(),
  ogSiteName: z.string(),
  brandInstitute: z.string(),
  brandSection: z.string(),
  navLinks: z.array(navLink),
  footer: z.object({
    sectionName: z.string(),
    orgName: z.string(),
    navLinks: z.array(navLink),
    contactLabel: z.string(),
    contactEmail: z.string(),
    copyright: z.string(),
  }),
});

const home = z.object({
  title: z.string(),
  hero: z.object({
    label: z.string(),
    title: z.string(),
    primaryCta: z.object({ label: z.string(), href: z.string() }),
    secondaryCta: z.object({ label: z.string(), href: z.string() }),
    image: z.string().optional(),
  }),
  quickLinks: z.object({
    label: z.string(),
    items: z.array(quickLink),
  }),
  about: z.object({
    label: z.string(),
    title: z.string(),
    text: z.string(),
    ctaLabel: z.string(),
    ctaHref: z.string(),
    stats: z.array(stat),
  }),
  services: z.object({
    label: z.string(),
    title: z.string(),
    subtitle: z.string(),
    items: z.array(service),
  }),
  highlights: z.object({
    label: z.string(),
    title: z.string(),
    subtitle: z.string(),
  }),
  news: z.object({
    label: z.string(),
    title: z.string(),
    viewAll: z.string(),
    viewAllHref: z.string(),
    tickerEnabled: z.boolean().default(true),
    tickerLabel: z.string().default("Latest"),
  }),
  supportCta: z.object({
    title: z.string(),
    text: z.string(),
    buttonLabel: z.string(),
    buttonHref: z.string(),
  }),
  contact: z.object({
    label: z.string(),
    title: z.string(),
    text: z.string(),
    details: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        href: z.string().optional(),
      })
    ),
    portal: z.object({
      title: z.string(),
      text: z.string(),
      buttonLabel: z.string(),
      buttonHref: z.string(),
    }),
  }),
});

const resourceCategory = z.object({
  title: z.string(),
  description: z.string(),
  items: z.array(z.object({ label: z.string(), href: z.string() })),
});

const resources = z.object({
  title: z.string(),
  note: z.string(),
  categories: z.array(resourceCategory),
});

const galleryItem = z.object({
  title: z.string().optional(),
  alt: z.string(),
  category: z.string(),
  image: z.string().optional(),
});

const gallery = z.object({
  title: z.string(),
  subtitle: z.string(),
  note: z.string(),
  categories: z.array(z.string()),
});

const siteSettings = defineCollection({
  loader: glob({ base: "./src/content/site-settings", pattern: "**/*.yml" }),
  schema: settings,
});

const homeCollection = defineCollection({
  loader: glob({ base: "./src/content/home", pattern: "**/*.yml" }),
  schema: home,
});

const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.yml" }),
  schema: page,
});

const resourcesCollection = defineCollection({
  loader: glob({ base: "./src/content/resources", pattern: "**/*.yml" }),
  schema: resources,
});

const galleryCollection = defineCollection({
  loader: glob({ base: "./src/content/gallery", pattern: "**/*.yml" }),
  schema: gallery,
});

const galleryImages = defineCollection({
  loader: glob({ base: "./src/content/gallery-images", pattern: "**/*.yml" }),
  schema: galleryItem,
});

export const collections = {
  "site-settings": siteSettings,
  home: homeCollection,
  pages: pages,
  resources: resourcesCollection,
  gallery: galleryCollection,
  "gallery-images": galleryImages,
};