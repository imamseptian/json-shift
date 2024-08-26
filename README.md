# JSON-Shift

JSON-Shift is a tool designed to simplify web scraping and information extraction. It transforms website content into structured JSON format based on user-defined attributes.

To extract information that requested by user, this project utilizing:

## Table of Contents

- [Key Features](#keyfeatures)
- [Setup Project](#setup-project)
- [How This Works](#how-this-works)
- [Usage Examples](#usage-examples)
  - [Extract array of mangas object from manga reading website](#extract-array-of-mangas-object-from-manga-reading-website)
  - [Extract Person Information from Wiki](#extract-person-information-from-wiki)
  - [Extract Indonesian News](#extract-indonesian-news)
- [Technologies Used](#technologies-used)
- [License](#license)

## KeyFeatures

- Web scraping using Puppeteer
- Embedding with Cohere
- Large Language Model integration (currently using Gemini and Groq free plans)
- Intelligent content filtering
- Vector store for efficient similarity search
- Langchain to integrate data/context to Large Language Model
- Gemini and Groq LLM
- Customizable JSON output

## Setup Project

- Clone this project
- install project dependencies

```bash
bun install

# or

npm install
```

- create `.env` file and make sure you set all required env variable. You can check `@/lib/env.ts` to know what `.env` variable should be set

Check [src/lib/env.ts](src/lib/env.ts) for .env variable requirements

```typescript
import { z } from "zod";

const envSchema = z.object({
  // llm providers
  // https://console.groq.com/keys
  GROQ_API_KEY: z.string().min(1),
  // https://aistudio.google.com/app/apikey
  GOOGLE_AI_STUDIO_API_KEY: z.string().min(1),
  // embedding, get from https://dashboard.cohere.com/api-keys
  COHERE_API_KEY: z.string().min(1),
  // upstash vectorstore, get from https://console.upstash.com/
  UPSTASH_VECTOR_REST_URL: z.string().url(),
  UPSTASH_VECTOR_REST_TOKEN: z.string().min(1),
  // upstash redis, get from https://console.upstash.com/
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  // just put random string or generate with command `openssl rand -base64 32`
  CLEAR_UPSTASH_VECTOR_STORE_TOKEN: z.string().min(1),
  BASE_URL: z.string().url(),
  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("testing"),
      z.literal("production"),
    ])
    .default("development"),
});
export const env = envSchema.parse(process.env);
```

- run project on development mode

```bash
bun dev

# or

npm install
```

## How this works ?

1. Users provide a URL and define desired JSON attributes.
2. The backend scrapes the website, filtering out unnecessary elements like:

   - `nav`
   - `footer`
   - `header`
   - `aside`
   - `script`
   - `style`
   - `noscript`
   - `iframe`

3. Extracted content is split and stored in a vector database.
4. Relevant chunks are retrieved using similarity search.
5. An LLM processes the data to generate the requested JSON output.

> **Note:** We store user form or template data in localStorage, so user can reuse it without need to refill the form

## Usage Example

### Extract array of mangas object from manga reading website

![Manga website scrape](/public/usage-1.png)

**Request Body**

```json
{
  "id": "1c8ab1fa-303d-4000-8e2c-70d22ea5b528",
  "url": "https://tcbscans.me",
  "name": "manga scraper",
  "attributes": [
    {
      "name": "mangas",
      "description": "array of manga object",
      "type": "array",
      "items": {
        "type": "object",
        "properties": [
          {
            "name": "name",
            "description": "manga name",
            "type": "string"
          },
          {
            "name": "chapter",
            "description": "manga chapter number",
            "type": "string"
          },
          {
            "name": "thumbnail",
            "description": "manga thumbnail image url",
            "type": "string"
          },
          {
            "name": "url",
            "description": "url to read the manga chapter",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "last_updated_at",
      "description": "time of latest manga update",
      "type": "string"
    }
  ],
  "latestResult": {
    "output": {
      "mangas": [
        {
          "name": "My Hero Academia",
          "chapter": "430",
          "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/mhaDescriptionv2.png",
          "url": "https://tcbscans.me/chapters/7777/my-hero-academia-chapter-430"
        },
        {
          "name": "Black Clover",
          "chapter": "370.371",
          "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/site_cover_bc1.png",
          "url": "https://tcbscans.me/chapters/7723/black-clover-chapter-370and371"
        },
        {
          "name": "Haikyuu!! (New Special)",
          "chapter": "3",
          "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/haikyu45-1200px.jpeg",
          "url": "https://tcbscans.me/chapters/7654/haikyu-special-chapter-3"
        },
        {
          "name": "Black Clover Gaiden: Quartet Knights",
          "chapter": "40",
          "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/hbc.png",
          "url": "https://tcbscans.me/chapters/7651/black-clover-gaiden-quartet-knights-chapter-40"
        },
        {
          "name": "Jujutsu Kaisen",
          "chapter": "267",
          "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/jjkkk.png",
          "url": "https://tcbscans.me/chapters/7790/jujutsu-kaisen-chapter-267"
        },
        {
          "name": "One Piece",
          "chapter": "1124",
          "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/op_1009_00-Cover-redraw-fin-wm-lvl-1.png",
          "url": "https://tcbscans.me/chapters/7789/one-piece-chapter-1124"
        },
        {
          "name": "Chainsaw Man",
          "chapter": "174",
          "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/cmt2.jpg",
          "url": "https://tcbscans.me/chapters/7787/chainsaw-man-chapter-174"
        },
        {
          "name": "My Hero Academia One-Shot: You're Next!!",
          "chapter": "1",
          "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/PV_pic.png",
          "url": "https://tcbscans.me/chapters/7782/my-hero-academia-one-shot-you-re-next-chapter-1"
        }
      ],
      "last_updated_at": "2 days ago"
    }
  },
  "updatedAt": "2024-08-25T14:50:36.284Z",
  "ignoreCache": false,
  "model": "mixtral-8x7b-32768"
}
```

**Output**

```json
{
  "output": {
    "mangas": [
      {
        "name": "My Hero Academia",
        "chapter": "430",
        "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/mhaDescriptionv2.png",
        "url": "https://tcbscans.me/chapters/7777/my-hero-academia-chapter-430"
      },
      {
        "name": "Black Clover",
        "chapter": "370.371",
        "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/site_cover_bc1.png",
        "url": "https://tcbscans.me/chapters/7723/black-clover-chapter-370and371"
      },
      {
        "name": "Haikyuu!! (New Special)",
        "chapter": "3",
        "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/haikyu45-1200px.jpeg",
        "url": "https://tcbscans.me/chapters/7654/haikyu-special-chapter-3"
      },
      {
        "name": "Black Clover Gaiden: Quartet Knights",
        "chapter": "40",
        "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/hbc.png",
        "url": "https://tcbscans.me/chapters/7651/black-clover-gaiden-quartet-knights-chapter-40"
      },
      {
        "name": "Jujutsu Kaisen",
        "chapter": "267",
        "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/jjkkk.png",
        "url": "https://tcbscans.me/chapters/7790/jujutsu-kaisen-chapter-267"
      },
      {
        "name": "One Piece",
        "chapter": "1124",
        "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/op_1009_00-Cover-redraw-fin-wm-lvl-1.png",
        "url": "https://tcbscans.me/chapters/7789/one-piece-chapter-1124"
      },
      {
        "name": "Chainsaw Man",
        "chapter": "174",
        "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/cmt2.jpg",
        "url": "https://tcbscans.me/chapters/7787/chainsaw-man-chapter-174"
      },
      {
        "name": "My Hero Academia One-Shot: You're Next!!",
        "chapter": "1",
        "thumbnail": "https://cdn.onepiecechapters.com/file/CDN-M-A-N/PV_pic.png",
        "url": "https://tcbscans.me/chapters/7782/my-hero-academia-one-shot-you-re-next-chapter-1"
      }
    ],
    "last_updated_at": "2 days ago"
  }
}
```

### Extract Person Information from Wiki

![Dota player scrape](/public/usage-2.png)

**Request Body**

```json
{
  "id": "e0654277-89b6-4a7b-a071-a788fdbb6636",
  "url": "https://liquipedia.net/dota2/Gorgc",
  "name": "dota player detail",
  "attributes": [
    {
      "name": "name",
      "description": "player real name",
      "type": "string"
    },
    {
      "name": "ign",
      "description": "player In game name",
      "type": "string"
    },
    {
      "name": "earnings",
      "description": "players earnings from dota competitive scene",
      "type": "number"
    },
    {
      "name": "nationality",
      "description": "player nationality",
      "type": "string"
    },
    {
      "name": "picture",
      "description": "image url of player picture",
      "type": "string"
    }
  ],
  "latestResult": {
    "output": {
      "name": "Janne Stefanovski",
      "ign": "Gorgc",
      "earnings": 14839,
      "nationality": "Sweden",
      "picture": "https://liquipedia.net/commons/images/thumb/0/0f/Gorgc_WESG_2016.jpg/600px-Gorgc_WESG_2016.jpg"
    }
  },
  "createdAt": "2024-08-25T14:59:46.509Z",
  "updatedAt": "2024-08-25T14:59:46.509Z",
  "ignoreCache": false,
  "model": "mixtral-8x7b-32768"
}
```

**Output**

```json
{
  "output": {
    "name": "Janne Stefanovski",
    "ign": "Gorgc",
    "earnings": 14839,
    "nationality": "Sweden",
    "picture": "https://liquipedia.net/commons/images/thumb/0/0f/Gorgc_WESG_2016.jpg/600px-Gorgc_WESG_2016.jpg"
  }
}
```

### Extract indonesian news

![Extract indonesian news](/public/usage-3.png)

**Request Body**

```json
{
  "id": "f6086055-324d-4b81-be68-b2c220b83b1f",
  "url": "https://www.kaskus.co.id/thread/66c916cb5a6daedab1041d6c/netizen-curiga-skandal-azizah-salsha-hanya-pengalihan-isu-polemik-putusan-mk?ref=homelanding&med=hot_thread&style=thumb",
  "name": "news scraper",
  "attributes": [
    {
      "name": "judul",
      "description": "judul dari berita pada website",
      "type": "string"
    },
    {
      "name": "rangkuman",
      "description": "2 sampai 3 kalimat rangkuman mengenai berita pada website",
      "type": "string"
    },
    {
      "name": "gambar",
      "description": "link untuk gambar thumbnaill berita",
      "type": "string"
    },
    {
      "name": "penulis",
      "description": "objek yang berisi detail profil penulis berita",
      "type": "object",
      "properties": [
        {
          "name": "nama",
          "description": "nama akun penulis",
          "type": "string"
        },
        {
          "name": "total_post",
          "description": "jumlah postingan penulis",
          "type": "number"
        }
      ]
    }
  ],
  "latestResult": {
    "output": {
      "judul": "Netizen Curiga! Skandal Azizah Salsha Hanya Pengalihan Isu Polemik Putusan MK!",
      "rangkuman": "Kasus dugaan perselingkuhan istri Pratama Arhan, Azizah Salsha, dengan pacar selebgram Rachel Vennya, Salim Nauderer, memancing spekulasi di ranah digital. Netizen memulai kampanye #KawalPutusanMK untuk menjaga fokus terhadap isu yang dinilai lebih krusial.",
      "gambar": "https://s.kaskus.id/images/2024/08/23/10600510_202408231058540652.jpg",
      "penulis": {
        "nama": "TS harrywjyy",
        "total_post": 3
      }
    }
  },
  "createdAt": "2024-08-25T15:08:10.227Z",
  "updatedAt": "2024-08-25T15:08:10.227Z",
  "ignoreCache": false,
  "model": "mixtral-8x7b-32768"
}
```

**Output**

```json
{
  "output": {
    "judul": "Netizen Curiga! Skandal Azizah Salsha Hanya Pengalihan Isu Polemik Putusan MK!",
    "rangkuman": "Kasus dugaan perselingkuhan istri Pratama Arhan, Azizah Salsha, dengan pacar selebgram Rachel Vennya, Salim Nauderer, memancing spekulasi di ranah digital. Netizen memulai kampanye #KawalPutusanMK untuk menjaga fokus terhadap isu yang dinilai lebih krusial.",
    "gambar": "https://s.kaskus.id/images/2024/08/23/10600510_202408231058540652.jpg",
    "penulis": {
      "nama": "TS harrywjyy",
      "total_post": 3
    }
  }
}
```

## Technologies Used

- Web Scraping: Puppeteer
- Embedding: Cohere
- Langchain
- LLM: Gemini, Groq
- Vector Store: Upstash
- Development: TypeScript, Bun

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
