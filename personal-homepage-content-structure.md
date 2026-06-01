# Personal Homepage Content Structure

This document defines the initial content structure for a static, bilingual, agent-manageable personal homepage for Thomas Weholt.

The site is intended as an employer-facing portfolio, personal lab, writing platform and photography showcase. It is not a consulting/service-sales site.

## Core principles

1. Content is separate from presentation.
2. Layouts and themes may change freely without changing content files.
3. Agents must be able to add and update content safely through Git.
4. Use many small files instead of one large JSON file.
5. Every public text field should support English and Norwegian.
6. Articles use JSON metadata plus separate Markdown bodies.
7. Images live under `public/images/` and are referenced by absolute `/images/...` paths.
8. IDs are stable and must not be renamed without an explicit migration.
9. Tone is partly selected by theme and partly supported by content variants.
10. The site must build statically for GitHub Pages.

## Recommended folder structure

```text
personal-homepage/
  public/
    images/
      profile/
        thomas.jpg
      projects/
        serpentarium-core/
          cover.jpg
        airgun-performance-index/
          cover.jpg
        soml/
          cover.jpg
        wagtail-image-uploader/
          cover.jpg
      articles/
        ambivalent-ai-relationship/
          cover.jpg
        atomic-framework/
          cover.jpg
      photography/
        fujifilm/
        portraits/
        travel/
        street/
        landscape/
        development/
          cover.jpg
          photo-001.jpg
  src/
    content/
      settings/
        site.json
        navigation.json
        voice-profiles.json
        content-statuses.json
      profile/
        main.json
        hero.json
      professional/
        opportunities.json
        expertise.json
      career/
        visma.json
        gat-soft.json
        cintra.json
        bibliotek-systemer.json
      education/
        hit-datateknikk.json
      projects/
        serpentarium-core.json
        airgun-performance-index.json
        soml.json
        wagtail-image-uploader.json
        dse.json
      articles/
        ambivalent-ai-relationship/
          index.json
          body.en.md
          body.no.md
        atomic-framework/
          index.json
          body.en.md
          body.no.md
      photography/
        categories.json
        images.json
```

## Shared data shapes

### Localized string

```json
{
  "en": "English text",
  "no": "Norsk tekst"
}
```

### Voice IDs

```text
professional
personal
playful
experimental
```

### Tone-variant localized string

```json
{
  "professional": {
    "en": "Professional English text",
    "no": "Profesjonell norsk tekst"
  },
  "personal": {
    "en": "Personal English text",
    "no": "Personlig norsk tekst"
  },
  "playful": {
    "en": "Playful English text",
    "no": "Leken norsk tekst"
  },
  "experimental": {
    "en": "Experimental English text",
    "no": "Eksperimentell norsk tekst"
  }
}
```

## Default content files

### `src/content/settings/site.json`

```json
{
  "id": "site",
  "title": {
    "en": "Thomas Weholt",
    "no": "Thomas Weholt"
  },
  "description": {
    "en": "Personal portfolio, writing, photography and software development work by Thomas Weholt.",
    "no": "Personlig portfolio, tekster, fotografi og programvareutvikling av Thomas Weholt."
  },
  "baseUrl": "https://weholt.github.io",
  "defaultLanguage": "en",
  "supportedLanguages": ["en", "no"],
  "defaultTheme": "developer-clean",
  "randomizeThemeOnFirstVisit": true,
  "persistThemeChoice": true,
  "persistLanguageChoice": true,
  "profileImage": "/images/profile/thomas.jpg"
}
```

### `src/content/settings/navigation.json`

```json
{
  "items": [
    {
      "id": "home",
      "label": {
        "en": "Home",
        "no": "Hjem"
      },
      "href": "/"
    },
    {
      "id": "about",
      "label": {
        "en": "About",
        "no": "Om meg"
      },
      "href": "/about/"
    },
    {
      "id": "work",
      "label": {
        "en": "Work",
        "no": "Arbeid"
      },
      "href": "/work/"
    },
    {
      "id": "projects",
      "label": {
        "en": "Projects",
        "no": "Prosjekter"
      },
      "href": "/projects/"
    },
    {
      "id": "writing",
      "label": {
        "en": "Writing",
        "no": "Tekster"
      },
      "href": "/writing/"
    },
    {
      "id": "photography",
      "label": {
        "en": "Photography",
        "no": "Fotografi"
      },
      "href": "/photography/"
    },
    {
      "id": "contact",
      "label": {
        "en": "Contact",
        "no": "Kontakt"
      },
      "href": "/contact/"
    }
  ]
}
```

### `src/content/settings/voice-profiles.json`

```json
{
  "voiceProfiles": [
    {
      "id": "professional",
      "label": {
        "en": "Professional",
        "no": "Profesjonell"
      },
      "description": {
        "en": "Clear, credible and employer-facing.",
        "no": "Tydelig, troverdig og rettet mot arbeidsgivere."
      }
    },
    {
      "id": "personal",
      "label": {
        "en": "Personal",
        "no": "Personlig"
      },
      "description": {
        "en": "Reflective, autobiographical and human.",
        "no": "Reflektert, selvbiografisk og menneskelig."
      }
    },
    {
      "id": "playful",
      "label": {
        "en": "Playful",
        "no": "Leken"
      },
      "description": {
        "en": "Informal, experimental and slightly strange in a good way.",
        "no": "Uformell, eksperimentell og passe rar."
      }
    },
    {
      "id": "experimental",
      "label": {
        "en": "Experimental",
        "no": "Eksperimentell"
      },
      "description": {
        "en": "A personal lab, design playground and nonlinear archive.",
        "no": "Et personlig laboratorium, designlekeplass og ikke-lineært arkiv."
      }
    }
  ]
}
```

### `src/content/settings/content-statuses.json`

```json
{
  "projectStatuses": [
    "featured",
    "active",
    "experimental",
    "historical",
    "archived",
    "draft"
  ],
  "articleStatuses": [
    "published",
    "draft",
    "archived"
  ],
  "imageStatuses": [
    "published",
    "draft",
    "hidden"
  ]
}
```

### `src/content/profile/main.json`

```json
{
  "id": "main-profile",
  "name": "Thomas Augestad Weholt",
  "displayName": "Thomas Weholt",
  "location": {
    "en": "Norway",
    "no": "Norge"
  },
  "title": {
    "en": "Senior Software Developer",
    "no": "Senior systemutvikler"
  },
  "tagline": {
    "en": "Senior developer, Python enthusiast, open-source advocate, photographer and builder of AI-assisted software workflows.",
    "no": "Seniorutvikler, Python-entusiast, tilhenger av åpen kildekode, fotograf og bygger av AI-støttede utviklingsflyter."
  },
  "shortBio": {
    "en": "Senior software developer from Norway with more than 25 years of experience, focused on backend systems, Python, open source, Linux, AI-assisted development workflows and practical automation.",
    "no": "Senior systemutvikler fra Norge med mer enn 25 års erfaring, med fokus på backend-systemer, Python, åpen kildekode, Linux, AI-støttede utviklingsflyter og praktisk automatisering."
  },
  "mediumBio": {
    "en": "I am a senior software developer based in Norway with more than 25 years of experience in technology and software development. Professionally, I have spent most of my career building and maintaining complex Workforce Management systems, with a strong focus on backend development, databases, enterprise systems and long-lived software. Outside work, I build tools, experiments and open-source projects around Python, Django, Wagtail, FastAPI, Linux, automation and AI-assisted development.",
    "no": "Jeg er senior systemutvikler fra Norge med mer enn 25 års erfaring fra teknologi og programvareutvikling. Profesjonelt har jeg brukt mesteparten av karrieren på å bygge og vedlikeholde komplekse Workforce Management-systemer, med særlig vekt på backend-utvikling, databaser, enterprise-systemer og langlivede produkter. Utenfor jobb bygger jeg verktøy, eksperimenter og open source-prosjekter rundt Python, Django, Wagtail, FastAPI, Linux, automatisering og AI-støttet utvikling."
  },
  "longBio": {
    "en": "I am Thomas Augestad Weholt, a senior software developer from Norway. I started programming in the 1990s and have worked professionally in technology since 1999, and as a developer since 2000. My professional background is rooted in long-lived enterprise software, especially Workforce Management systems. I have worked for many years with backend development, databases, business-critical on-premise systems, C#, Microsoft SQL Server and complex product development. Privately, my technical center of gravity has always been Python, Linux and free software. This site is both a professional portfolio and a personal lab. It collects my development work, open-source projects, writing, photography and ideas about software, automation, AI-assisted development and practical computing.",
    "no": "Jeg er Thomas Augestad Weholt, senior systemutvikler fra Norge. Jeg begynte å programmere på 1990-tallet og har jobbet profesjonelt med teknologi siden 1999, og som utvikler siden 2000. Den profesjonelle bakgrunnen min er forankret i langlivede enterprise-systemer, spesielt Workforce Management. Jeg har arbeidet i mange år med backend-utvikling, databaser, forretningskritiske on-premise-systemer, C#, Microsoft SQL Server og kompleks produktutvikling. Privat har tyngdepunktet mitt alltid vært Python, Linux og fri programvare. Dette nettstedet er både en profesjonell portfolio og et personlig laboratorium. Det samler utviklingsarbeid, open source-prosjekter, tekster, fotografi og ideer om programvare, automatisering, AI-støttet utvikling og praktisk databehandling."
  },
  "image": "/images/profile/thomas.jpg",
  "contact": {
    "email": "thomas@weholt.org",
    "showPhone": false
  },
  "socialLinks": [
    {
      "id": "github",
      "label": "GitHub",
      "url": "https://github.com/weholt"
    },
    {
      "id": "website",
      "label": "Website",
      "url": "https://weholt.github.io/"
    }
  ]
}
```

### `src/content/profile/hero.json`

```json
{
  "id": "hero",
  "headline": {
    "professional": {
      "en": "Senior software developer building practical systems, tools and AI-assisted workflows.",
      "no": "Seniorutvikler som bygger praktiske systemer, verktøy og AI-støttede arbeidsflyter."
    },
    "personal": {
      "en": "I build software, write about technology, take photographs and keep returning to Python.",
      "no": "Jeg bygger programvare, skriver om teknologi, tar bilder og vender stadig tilbake til Python."
    },
    "playful": {
      "en": "Python, cameras, agents, Linux boxes and the occasional questionable side project.",
      "no": "Python, kameraer, agenter, Linux-bokser og et og annet tvilsomt sideprosjekt."
    },
    "experimental": {
      "en": "A personal lab for code, images, essays, tools and half-controlled software experiments.",
      "no": "Et personlig laboratorium for kode, bilder, essays, verktøy og halvkontrollerte programvareeksperimenter."
    }
  },
  "subheadline": {
    "professional": {
      "en": "More than 25 years of software development experience, with a background in enterprise systems, backend development, Python, open source and AI-supported developer workflows.",
      "no": "Mer enn 25 års erfaring med programvareutvikling, med bakgrunn fra enterprise-systemer, backend-utvikling, Python, åpen kildekode og AI-støttede utviklerflyter."
    },
    "personal": {
      "en": "This site collects the professional, technical and creative parts of my work: code, projects, articles, photographs and experiments.",
      "no": "Dette nettstedet samler de profesjonelle, tekniske og kreative delene av arbeidet mitt: kode, prosjekter, artikler, fotografier og eksperimenter."
    },
    "playful": {
      "en": "A portfolio, a notebook, a gallery and a software shed with too many half-finished but interesting tools.",
      "no": "En portfolio, en notatbok, et galleri og et programvareskur med litt for mange halvferdige, men interessante verktøy."
    },
    "experimental": {
      "en": "The same content may appear as a portfolio, lab notebook, visual archive or developer dashboard depending on the theme you get.",
      "no": "Det samme innholdet kan dukke opp som portfolio, laboratorienotat, visuelt arkiv eller utviklerdashboard, avhengig av hvilket tema du får."
    }
  }
}
```

### `src/content/professional/expertise.json`

```json
{
  "groups": [
    {
      "id": "core-development",
      "title": {
        "en": "Core development",
        "no": "Kjerneutvikling"
      },
      "items": [
        "Backend development",
        "Enterprise systems",
        "Workforce Management systems",
        "C#",
        "Microsoft SQL Server",
        "JavaScript",
        "React",
        "APIs"
      ]
    },
    {
      "id": "python-open-source",
      "title": {
        "en": "Python and open source",
        "no": "Python og åpen kildekode"
      },
      "items": [
        "Python",
        "Django",
        "Wagtail",
        "FastAPI",
        "Pydantic",
        "HTMX",
        "Docker",
        "Linux",
        "SQLite",
        "Nginx"
      ]
    },
    {
      "id": "automation-testing",
      "title": {
        "en": "Automation and testing",
        "no": "Automatisering og testing"
      },
      "items": [
        "Pytest",
        "Tox",
        "Selenium",
        "pre-commit",
        "BeautifulSoup",
        "Requests",
        "Web scraping",
        "Data processing"
      ]
    },
    {
      "id": "ai-assisted-development",
      "title": {
        "en": "AI-assisted development",
        "no": "AI-støttet utvikling"
      },
      "items": [
        "LLM-assisted development",
        "Agentic workflows",
        "Developer tooling",
        "Automation",
        "Code review support",
        "Planning and implementation workflows"
      ]
    }
  ]
}
```

### `src/content/professional/opportunities.json`

```json
{
  "headline": {
    "en": "What I would like to work on",
    "no": "Hva jeg gjerne vil jobbe med"
  },
  "summary": {
    "en": "I am not selling consulting services here. This site is meant to show how I think, what I build, what I care about, and what kind of work I would like to do more of.",
    "no": "Jeg selger ikke konsulenttjenester her. Dette nettstedet skal vise hvordan jeg tenker, hva jeg bygger, hva jeg bryr meg om, og hva slags arbeid jeg gjerne vil gjøre mer av."
  },
  "targets": [
    {
      "id": "ai-assisted-development",
      "title": {
        "en": "AI-assisted software development",
        "no": "AI-støttet programvareutvikling"
      },
      "description": {
        "en": "Practical use of AI tools, agents and automation to improve planning, development, testing, review and developer workflows.",
        "no": "Praktisk bruk av AI-verktøy, agenter og automatisering for å forbedre planlegging, utvikling, testing, review og utviklerflyt."
      },
      "tags": ["AI", "agents", "developer tooling", "automation"]
    },
    {
      "id": "backend-enterprise",
      "title": {
        "en": "Backend and enterprise systems",
        "no": "Backend og enterprise-systemer"
      },
      "description": {
        "en": "Long-lived systems, databases, APIs, business-critical logic and modernization of complex software.",
        "no": "Langlivede systemer, databaser, API-er, forretningskritisk logikk og modernisering av kompleks programvare."
      },
      "tags": ["backend", "enterprise", "databases", "APIs"]
    },
    {
      "id": "python-open-source",
      "title": {
        "en": "Python, open source and developer tools",
        "no": "Python, åpen kildekode og utviklerverktøy"
      },
      "description": {
        "en": "Tools, prototypes, packages and systems built around Python, Linux, automation and practical software craftsmanship.",
        "no": "Verktøy, prototyper, pakker og systemer bygget rundt Python, Linux, automatisering og praktisk programvarehåndverk."
      },
      "tags": ["Python", "Linux", "open source", "tools"]
    }
  ]
}
```

### `src/content/career/visma.json`

```json
{
  "id": "visma",
  "period": "2017-present",
  "role": {
    "en": "System Developer",
    "no": "Systemutvikler"
  },
  "company": "Visma",
  "location": "Porsgrunn, Norway",
  "description": {
    "en": "Development of Workforce Management functionality in GAT Ressursstyring, with work involving complex systems, APIs, event-sourcing ideas, React-based frontends and AI-assisted development in large projects.",
    "no": "Utvikling av Workforce Management-funksjonalitet i GAT Ressursstyring, med arbeid knyttet til komplekse systemer, API-er, event-sourcing-ideer, React-baserte frontends og AI-støttet utvikling i store prosjekter."
  },
  "highlights": [
    "Workforce Management",
    "Backend development",
    "APIs",
    "React",
    "AI-assisted development"
  ],
  "order": 10
}
```

### `src/content/career/gat-soft.json`

```json
{
  "id": "gat-soft",
  "period": "2001-2017",
  "role": {
    "en": "System Developer",
    "no": "Systemutvikler"
  },
  "company": "GAT-Soft",
  "location": "Porsgrunn, Norway",
  "description": {
    "en": "Development of scheduling and resource-management functionality in GAT Ressursstyring.",
    "no": "Utvikling av turnusplanlegging og ressursstyringsfunksjonalitet i GAT Ressursstyring."
  },
  "highlights": [
    "Workforce Management",
    "Long-term product development",
    "Enterprise software",
    "Scheduling"
  ],
  "order": 20
}
```

### `src/content/career/cintra.json`

```json
{
  "id": "cintra",
  "period": "2000-2001",
  "role": {
    "en": "System Developer",
    "no": "Systemutvikler"
  },
  "company": "Cintra Software Engineering AS",
  "location": "Porsgrunn, Norway",
  "description": {
    "en": "Software development using Delphi and Java.",
    "no": "Systemutvikling med Delphi og Java."
  },
  "highlights": [
    "Delphi",
    "Java",
    "Professional software development"
  ],
  "order": 30
}
```

### `src/content/career/bibliotek-systemer.json`

```json
{
  "id": "bibliotek-systemer",
  "period": "1999-2000",
  "role": {
    "en": "Service Technician",
    "no": "Servicetekniker"
  },
  "company": "Bibliotek Systemer",
  "location": "Larvik, Norway",
  "description": {
    "en": "PC building, printer service and technical support.",
    "no": "Bygging av PC-er, service på skrivere og teknisk support."
  },
  "highlights": [
    "Hardware",
    "Technical support",
    "Service work"
  ],
  "order": 40
}
```

### `src/content/education/hit-datateknikk.json`

```json
{
  "id": "hit-datateknikk",
  "period": "1997-1999",
  "institution": "Høgskolen i Telemark",
  "title": {
    "en": "Computer Engineering",
    "no": "Datateknikk, ingeniør"
  },
  "description": {
    "en": "Higher education in computer engineering.",
    "no": "Høyere utdanning innen datateknikk."
  },
  "order": 10
}
```

### `src/content/projects/serpentarium-core.json`

```json
{
  "id": "serpentarium-core",
  "title": {
    "en": "Serpentarium Core",
    "no": "Serpentarium Core"
  },
  "summary": {
    "en": "A Python service container using typing Protocols and type hints to resolve construction requirements for services.",
    "no": "En Python-basert service container som bruker typing Protocols og type hints for å løse avhengigheter mellom tjenester."
  },
  "description": {
    "en": "A small Python project exploring dependency resolution, service containers, typed interfaces and practical architecture patterns.",
    "no": "Et lite Python-prosjekt som utforsker avhengighetsløsning, service containers, typede grensesnitt og praktiske arkitekturmønstre."
  },
  "repo": "serpentarium-core",
  "url": "https://github.com/weholt/serpentarium-core",
  "image": "/images/projects/serpentarium-core/cover.jpg",
  "status": "featured",
  "featured": true,
  "tags": ["Python", "typing", "architecture", "developer tooling"],
  "order": 10
}
```

### `src/content/projects/airgun-performance-index.json`

```json
{
  "id": "airgun-performance-index",
  "title": {
    "en": "Airgun Performance Index",
    "no": "Airgun Performance Index"
  },
  "summary": {
    "en": "A Django-based site for airgun tuning recipes and performance information.",
    "no": "Et Django-basert nettsted for tuningoppskrifter og ytelsesinformasjon for luftvåpen."
  },
  "description": {
    "en": "A former web project for tuning tips and performance data for high-power airguns, built using Python, Django, SQLite, HTMX, Nginx and Docker.",
    "no": "Et tidligere webprosjekt for tuning-tips og ytelsesdata for kraftige luftvåpen, bygget med Python, Django, SQLite, HTMX, Nginx og Docker."
  },
  "repo": "airgun-performance-index",
  "url": "https://github.com/weholt/airgun-performance-index",
  "image": "/images/projects/airgun-performance-index/cover.jpg",
  "status": "historical",
  "featured": true,
  "tags": ["Python", "Django", "SQLite", "HTMX", "Docker"],
  "order": 20
}
```

### `src/content/projects/soml.json`

```json
{
  "id": "soml",
  "title": {
    "en": "SOML — Simple Object Markup Language",
    "no": "SOML — Simple Object Markup Language"
  },
  "summary": {
    "en": "An experimental system for turning HTML-like markup into JSON Schema and code generation targets.",
    "no": "Et eksperimentelt system for å gjøre HTML-lignende markup om til JSON Schema og mål for kodegenerering."
  },
  "description": {
    "en": "A project exploring how structured attributes in markup can produce JSON Schema and generate Django models, forms, Wagtail pages, snippets, Python dataclasses and Pydantic models.",
    "no": "Et prosjekt som utforsker hvordan strukturerte attributter i markup kan produsere JSON Schema og generere Django-modeller, forms, Wagtail pages, snippets, Python dataclasses og Pydantic-modeller."
  },
  "repo": "soml",
  "url": "https://github.com/weholt/soml",
  "image": "/images/projects/soml/cover.jpg",
  "status": "experimental",
  "featured": true,
  "tags": ["Python", "JSON Schema", "Django", "code generation"],
  "order": 30
}
```

### `src/content/projects/wagtail-image-uploader.json`

```json
{
  "id": "wagtail-image-uploader",
  "title": {
    "en": "Wagtail Image Uploader",
    "no": "Wagtail Image Uploader"
  },
  "summary": {
    "en": "A reusable Wagtail/Django app and command-line client for uploading images to Wagtail sites.",
    "no": "En gjenbrukbar Wagtail/Django-app og kommandolinjeklient for å laste opp bilder til Wagtail-nettsteder."
  },
  "description": {
    "en": "A project for uploading images to one or more Wagtail sites through an API and CLI workflow.",
    "no": "Et prosjekt for å laste opp bilder til ett eller flere Wagtail-nettsteder via API og kommandolinje."
  },
  "repo": "wagtail-image-uploader",
  "url": "https://github.com/weholt/wagtail-image-uploader",
  "image": "/images/projects/wagtail-image-uploader/cover.jpg",
  "status": "active",
  "featured": false,
  "tags": ["Python", "Django", "Wagtail", "CLI", "images"],
  "order": 40
}
```

### `src/content/projects/dse.json`

```json
{
  "id": "dse",
  "title": {
    "en": "DSE",
    "no": "DSE"
  },
  "summary": {
    "en": "A historical Django package for simplified bulk insert, update and delete operations.",
    "no": "En historisk Django-pakke for enklere bulk insert, update og delete."
  },
  "description": {
    "en": "An older Python/Django project that had real-world use before similar functionality became more common elsewhere.",
    "no": "Et eldre Python/Django-prosjekt som ble brukt i praksis før tilsvarende funksjonalitet ble vanligere andre steder."
  },
  "repo": "dse",
  "url": "https://github.com/weholt/dse",
  "image": "/images/projects/dse/cover.jpg",
  "status": "archived",
  "featured": false,
  "tags": ["Python", "Django", "bulk operations", "historical"],
  "order": 50
}
```

### `src/content/articles/ambivalent-ai-relationship/index.json`

```json
{
  "id": "ambivalent-ai-relationship",
  "title": {
    "en": "An Ambivalent Relationship With AI",
    "no": "Et ambivalent forhold til AI"
  },
  "summary": {
    "en": "A personal and technical reflection on using AI tools heavily while remaining skeptical of hype, replacement narratives and careless automation.",
    "no": "En personlig og teknisk refleksjon om å bruke AI-verktøy aktivt, men samtidig være skeptisk til hype, erstatningsfortellinger og uforsiktig automatisering."
  },
  "date": "2026-01-01",
  "status": "draft",
  "coverImage": "/images/articles/ambivalent-ai-relationship/cover.jpg",
  "body": {
    "en": "body.en.md",
    "no": "body.no.md"
  },
  "tags": ["AI", "software development", "work", "automation"],
  "featured": true,
  "order": 10
}
```

### `src/content/articles/ambivalent-ai-relationship/body.en.md`

```markdown
# An Ambivalent Relationship With AI

Draft article.

Possible angles:

- Using AI tools heavily while not trusting the hype.
- Productivity as assistance, not replacement.
- Why architecture, testing, review and domain knowledge still matter.
- The tension between useful tools and destructive management narratives.
- How AI changes the work without magically removing the work.
```

### `src/content/articles/ambivalent-ai-relationship/body.no.md`

```markdown
# Et ambivalent forhold til AI

Utkast.

Mulige vinkler:

- Å bruke AI-verktøy aktivt uten å stole på hypen.
- Produktivitet som assistanse, ikke erstatning.
- Hvorfor arkitektur, testing, review og domenekunnskap fortsatt betyr noe.
- Spenningen mellom nyttige verktøy og destruktive ledelsesfortellinger.
- Hvordan AI endrer arbeidet uten å på magisk vis fjerne arbeidet.
```

### `src/content/articles/atomic-framework/index.json`

```json
{
  "id": "atomic-framework",
  "title": {
    "en": "The Atomic Framework",
    "no": "Atomic-rammeverket"
  },
  "summary": {
    "en": "Notes on a git-driven framework for structured, agent-assisted software development.",
    "no": "Notater om et git-drevet rammeverk for strukturert, agentstøttet programvareutvikling."
  },
  "date": "2026-01-01",
  "status": "draft",
  "coverImage": "/images/articles/atomic-framework/cover.jpg",
  "body": {
    "en": "body.en.md",
    "no": "body.no.md"
  },
  "tags": ["Atomic", "agents", "git", "software development"],
  "featured": true,
  "order": 20
}
```

### `src/content/articles/atomic-framework/body.en.md`

```markdown
# The Atomic Framework

Draft article.

Possible angles:

- Git as the backbone for agent-assisted work.
- Atomic issues, append-only task stores and structured implementation loops.
- Separating human-facing workflows from agent-facing workflows.
- Why repeatable process matters more than impressive demos.
```

### `src/content/articles/atomic-framework/body.no.md`

```markdown
# Atomic-rammeverket

Utkast.

Mulige vinkler:

- Git som ryggrad for agentstøttet arbeid.
- Atomiske issues, append-only task stores og strukturerte implementasjonsløkker.
- Skillet mellom menneskevennlige arbeidsflyter og agentvennlige arbeidsflyter.
- Hvorfor repeterbar prosess betyr mer enn imponerende demoer.
```

### `src/content/photography/categories.json`

```json
{
  "intro": {
    "en": "Photography made with Fujifilm cameras, focused on portraits, travel, street scenes and landscapes.",
    "no": "Fotografi tatt med Fujifilm-kameraer, med fokus på portretter, reise, gatefoto og landskap."
  },
  "categories": [
    {
      "id": "fujifilm",
      "title": {
        "en": "All Fujifilm",
        "no": "Alt Fujifilm"
      },
      "description": {
        "en": "A broad collection of photographs made with Fujifilm cameras.",
        "no": "En bred samling fotografier tatt med Fujifilm-kameraer."
      }
    },
    {
      "id": "portraits",
      "title": {
        "en": "Portraits",
        "no": "Portretter"
      },
      "description": {
        "en": "People, faces and character.",
        "no": "Mennesker, ansikter og karakter."
      }
    },
    {
      "id": "travel",
      "title": {
        "en": "Travel",
        "no": "Reise"
      },
      "description": {
        "en": "Places, movement and visual notes from trips.",
        "no": "Steder, bevegelse og visuelle notater fra reiser."
      }
    },
    {
      "id": "street",
      "title": {
        "en": "Street",
        "no": "Gatefoto"
      },
      "description": {
        "en": "Urban scenes, small moments and public life.",
        "no": "Urbane scener, små øyeblikk og offentlig liv."
      }
    },
    {
      "id": "landscape",
      "title": {
        "en": "Landscape",
        "no": "Landskap"
      },
      "description": {
        "en": "Light, space, weather and terrain.",
        "no": "Lys, rom, vær og terreng."
      }
    }
  ]
}
```

### `src/content/photography/images.json`

```json
{
  "images": [
    {
      "id": "development-photo-001",
      "src": "/images/photography/development/photo-001.jpg",
      "alt": {
        "en": "Temporary development image",
        "no": "Midlertidig utviklingsbilde"
      },
      "title": {
        "en": "Development image 1",
        "no": "Utviklingsbilde 1"
      },
      "caption": {
        "en": "Placeholder image used during site development.",
        "no": "Plassholderbilde brukt under utvikling av nettstedet."
      },
      "categories": ["fujifilm"],
      "camera": "Fujifilm X-T5",
      "lens": "XF 16-55mm f/2.8",
      "date": "2026-01-01",
      "status": "draft",
      "featured": true,
      "order": 10
    }
  ]
}
```

## Notes for implementation

The profile image should be copied from the uploaded image to this path:

```text
public/images/profile/thomas.jpg
```

Do not publish phone number by default. Keep email public and phone private unless explicitly requested.

Long articles should not be stored as escaped JSON strings. Use `index.json` for metadata and separate `body.en.md` / `body.no.md` files for body content.

Project URLs are provisional and follow this pattern:

```text
https://github.com/weholt/<repo-name>
```

Before publishing, verify that each repository exists and that the repo name is correct.
