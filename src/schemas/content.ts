import { z } from "zod";

export const localizedStringSchema = z.object({
  en: z.string().min(1),
  no: z.string().min(1)
});

export const voiceIdSchema = z.enum(["professional", "personal", "playful", "experimental"]);
export const projectStatusSchema = z.enum(["featured", "active", "experimental", "historical", "archived", "draft"]);
export const articleStatusSchema = z.enum(["draft", "published", "archived"]);

export const localizedByVoiceSchema = z.object({
  professional: localizedStringSchema.optional(),
  personal: localizedStringSchema.optional(),
  playful: localizedStringSchema.optional(),
  experimental: localizedStringSchema.optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one voice variant is required"
});

export const linkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url()
});

export const profileSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  location: localizedStringSchema,
  title: localizedStringSchema,
  tagline: localizedStringSchema,
  shortBio: localizedStringSchema,
  mediumBio: localizedStringSchema,
  longBio: localizedStringSchema,
  portraitImage: z.string().min(1),
  contact: z.object({
    email: z.string().email()
  }),
  socialLinks: z.array(linkSchema)
});

export const heroSchema = z.object({
  eyebrow: localizedStringSchema,
  headline: localizedByVoiceSchema,
  subheadline: localizedByVoiceSchema,
  primaryCta: z.object({ label: localizedStringSchema, href: z.string().min(1) }),
  secondaryCta: z.object({ label: localizedStringSchema, href: z.string().min(1) })
});

export const professionalSchema = z.object({
  summary: localizedStringSchema,
  expertise: z.array(z.string().min(1)),
  opportunities: z.object({
    headline: localizedStringSchema,
    summary: localizedStringSchema,
    targets: z.array(z.object({
      id: z.string().min(1),
      title: localizedStringSchema,
      description: localizedStringSchema,
      tags: z.array(z.string().min(1)).default([])
    }))
  })
});

export const careerItemSchema = z.object({
  id: z.string().min(1),
  period: z.string().min(1),
  role: localizedStringSchema,
  company: z.string().min(1),
  location: localizedStringSchema,
  description: localizedStringSchema,
  highlights: z.array(localizedStringSchema).default([]),
  order: z.number().int().default(0)
});

export const educationItemSchema = z.object({
  id: z.string().min(1),
  period: z.string().min(1),
  institution: z.string().min(1),
  title: localizedStringSchema,
  description: localizedStringSchema,
  order: z.number().int().default(0)
});

export const projectSchema = z.object({
  id: z.string().min(1),
  title: localizedStringSchema,
  summary: localizedStringSchema,
  description: localizedStringSchema,
  repo: z.string().optional(),
  url: z.string().url().optional(),
  image: z.string().optional(),
  status: projectStatusSchema,
  featured: z.boolean().default(false),
  tags: z.array(z.string().min(1)).default([]),
  order: z.number().int().default(0)
});

export const articleSchema = z.object({
  id: z.string().min(1),
  title: localizedStringSchema,
  summary: localizedStringSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  coverImage: z.string().optional(),
  tags: z.array(z.string().min(1)).default([]),
  status: articleStatusSchema,
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  pinOrder: z.number().int().optional(),
  order: z.number().int().default(0)
});

export const photoCategorySchema = z.object({
  id: z.string().min(1),
  title: localizedStringSchema,
  description: localizedStringSchema.optional()
});

export const photoExifSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  lens: z.string().optional(),
  focalLength: z.string().optional(),
  shutterSpeed: z.string().optional(),
  aperture: z.string().optional(),
  iso: z.string().optional()
});

export const photoSchema = z.object({
  id: z.string().min(1),
  src: z.string().min(1),
  alt: localizedStringSchema,
  title: localizedStringSchema.optional(),
  caption: localizedStringSchema.optional(),
  categories: z.array(z.string().min(1)).default([]),
  camera: z.string().optional(),
  lens: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string().min(1)).default([]),
  exif: photoExifSchema.optional()
});

export const gallerySchema = z.object({
  id: z.string().min(1),
  title: localizedStringSchema,
  description: localizedStringSchema.optional(),
  coverImage: z.string().optional(),
  categories: z.array(z.string().min(1)).default([]),
  images: z.array(z.string().min(1)).default([]),
  order: z.number().int().default(0)
});

export const settingsSchema = z.object({
  siteName: z.string().min(1),
  languages: z.array(z.enum(["en", "no"])),
  defaultLanguage: z.enum(["en", "no"]),
  defaultLayout: z.string().min(1),
  defaultTheme: z.string().min(1),
  defaultVoice: voiceIdSchema,
  layouts: z.array(z.object({
    id: z.string().min(1),
    label: localizedStringSchema,
    defaultVoice: voiceIdSchema
  })),
  themes: z.array(z.object({
    id: z.string().min(1),
    label: localizedStringSchema,
    defaultVoice: voiceIdSchema.optional()
  }))
});

export type LocalizedString = z.infer<typeof localizedStringSchema>;
export type VoiceId = z.infer<typeof voiceIdSchema>;
export type LocalizedByVoice = z.infer<typeof localizedByVoiceSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Hero = z.infer<typeof heroSchema>;
export type Professional = z.infer<typeof professionalSchema>;
export type CareerItem = z.infer<typeof careerItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Article = z.infer<typeof articleSchema>;
export type PhotoExif = z.infer<typeof photoExifSchema>;
export type PhotoCategory = z.infer<typeof photoCategorySchema>;
export type Photo = z.infer<typeof photoSchema>;
export type Gallery = z.infer<typeof gallerySchema>;
export type Settings = z.infer<typeof settingsSchema>;
