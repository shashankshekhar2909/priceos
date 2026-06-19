import { Layers, ShieldCheck, RefreshCw, Layers2, FileText, Database, Settings, HelpCircle, AlertTriangle, Monitor, Sparkles, Terminal } from "lucide-react";

export interface DocSection {
  id: string;
  title: string;
  category: string;
  icon: string;
  content: string;
  codeLanguage?: string;
  codeBlock?: string;
}

export const technicalDocs: DocSection[] = [
  {
    id: "architecture_overview",
    title: "1. Core System Architecture Overview",
    category: "System Design",
    icon: "Layers",
    content: `### PriceOS Enterprise Architecture Overview

PriceOS provides a modular, horizontally autoscaling price indexation and intelligence platform. 

The architecture bridges the high-velocity, low-latency requirements of Quick Commerce delivery (e.g., Blinkit, Zepto, targeting minutes) with the deep catalog index requirements of global e-commerce targets (e.g., Amazon, Flipkart, Ajio).

### Data Ingestion Pipeline:
1. **Scraper Workers (Crawl Agents)**: Node, Playwright, and Puppeteer threads crawl targeted websites to capture real-time prices, stock balances, and timelines.
2. **Ingest Bus (Message Broker)**: Raw listing snapshots are streamed to Redis-backed queues.
3. **Product Matching Engine (PME)**: Matches raw item titles across vendors based on text similarity and AI models, cataloging them under an immutable "Canonical Product" design.
4. **Relational Database**: PostgreSQL stores entities, subscriptions, and crawler metadata.
5. **Typesense Cluster**: Fast search server for near-milliseconds querying performance.
6. **Alert dispatchers**: Triggers email, telegram, and pushes dynamically upon detecting threshold breach.`,
    codeLanguage: "text",
    codeBlock: "PriceOS Pipeline flow overview:\n[Crawl Workers] ──> [Redis Ingestion Influx Bus] ──> [AI Matching Engine] ──> [PostgreSQL / Typesense Index]"
  },
  {
    id: "monorepo_layout",
    title: "2. Monorepo Folder Topology",
    category: "System Design",
    icon: "GitBranch",
    content: `### Monorepo Structure with pnpm Workspaces

PriceOS organizes components, packages, services, and web deployment layers in a workspace topology.

### Shared Workspace Directories:
- **apps/web**: High contrast client portal (Next.js 15, React, Recharts analytics).
- **apps/admin**: Real-time management console containing crawler dials and verified matching pipelines.
- **apps/api**: REST gateway built on database connection libraries (NestJS).
- **packages/database**: Database models, ORM mappings, and migrators (Drizzle/Drizzle Kit).
- **packages/types**: Consistent TypeScript interfaces (ProviderType, Product, Snapshots).
- **packages/providers**: Unified provider adapter plugins implementing scraper crawler contracts.
- **packages/llm**: Wrapper classes around Google Gemini API SDK.
- **services/crawler**: Playwright scraper cluster logic.
- **services/product-matcher**: Node.js worker handling textual normalization, NLP similarity, and catalog mergers.`,
    codeLanguage: "json",
    codeBlock: `{
  "name": "priceos-workspace",
  "private": true,
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ]
}`
  },
  {
    id: "database_schema",
    title: "3. PostgreSQL Relational Schema Design",
    category: "Database & Search",
    icon: "Database",
    content: `### PostgreSQL Relational Schema

Stores structured customer parameters, provider metadata, crawler sync schedules, active subscriber price thresholds, and historic price snap history.

### Table Relationships:
- **providers**: Stores target channels metadata and thread limits.
- **products**: Individual seller listings captured by scraper crawlers.
- **canonical_products**: Main normalized catalog structures.
- **price_history**: Timescaled snapshots of individual items.
- **alerts**: Price thresholds registered by user accounts.`,
    codeLanguage: "typescript",
    codeBlock: `import { pgTable, uuid, text, integer, doublePrecision, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// Canonical Products Table
export const canonicalProducts = pgTable("canonical_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Price Snapshot History Table
export const priceHistory = pgTable("price_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull(),
  price: doublePrecision("price").notNull(),
  availability: boolean("availability").default(true).notNull(),
  deliveryEta: text("delivery_eta"),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});`
  },
  {
    id: "typesense_spec",
    title: "4. Typesense Search Index Schema",
    category: "Database & Search",
    icon: "Search",
    content: `### Typesense High Performance Schema Design

Typesense handles lightning-quick faceted searches across catalog items. The indexed collections mirror Canonical Products and summarize price scales across providers.

### Schema Fields:
- **id**: Canonical Product uuid.
- **name**: Product title (indexed for text searches).
- **brand**: Brand filters (facet).
- **category**: Category segments (facet).
- **min_price**: Lower threshold for active buying.
- **max_price**: Upper target bounds.
- **providers**: String array of active sellers offering this SKU.`,
    codeLanguage: "json",
    codeBlock: `{
  "name": "canonical_products",
  "fields": [
    { "name": "id", "type": "string" },
    { "name": "name", "type": "string" },
    { "name": "brand", "type": "string", "facet": true },
    { "name": "category", "type": "string", "facet": true },
    { "name": "min_price", "type": "float" },
    { "name": "max_price", "type": "float" },
    { "name": "providers", "type": "string[]", "facet": true },
    { "name": "popularity_score", "type": "int32" }
  ],
  "default_sorting_field": "popularity_score"
}`
  },
  {
    id: "api_spec",
    title: "5. REST Gateway API Specification",
    category: "APIs & Webhooks",
    icon: "Terminal",
    content: `### REST API Reference Endpoints

Provides a secure, fully documented programmatic gateway to query products, request real-time comparisons, register alerts, and run model playgrounds.

### Key API Mappings:
- **GET /api/products/search**: Search items against the raw Typesense server.
- **GET /api/products/compare**: Compare side-by-side merchant prices.
- **POST /api/alerts/subscribe**: Save customer alert target thresholds.
- **POST /api/playground/prompt**: Probe LLM response times and tokens.
- **POST /api/cart/optimize**: Split grocery cart lists across optimized paths.`,
    codeLanguage: "json",
    codeBlock: `{
  "openapi": "3.0.0",
  "info": {
    "title": "PriceOS Core API Gateway",
    "version": "1.0.0"
  },
  "paths": {
    "/api/products/compare": {
      "get": {
        "summary": "Retrieve price variations across sellers",
        "parameters": [
          { "name": "canonicalId", "in": "query", "required": true }
        ],
        "responses": {
          "200": { "description": "Comparison listings array" }
        }
      }
    }
  }
}`
  },
  {
    id: "provider_sdk",
    title: "6. Provider Adapter SDK Design",
    category: "SDK & Integration",
    icon: "Cpu",
    content: `### SDK Plugin Contract Structure

Every crawl connector targeting external merchants is implemented as an isolated plugin wrapper implementing standard Adapter designs. 

### Crawl Connector Lifecycle:
1. **Initialize**: Logins, proxy assignments, and session negotiations.
2. **Execute**: Evaluates page categories via headless automation parameters.
3. **Parse**: Maps targeted CSS selectors into structured TypeScript objects.
4. **Transform**: Formats custom units into consistent numbers.`,
    codeLanguage: "typescript",
    codeBlock: `export interface ScrapedProduct {
  providerId: string;
  sku: string;
  name: string;
  category: string;
  url: string;
  imageUrl: string;
  currentPrice: number;
  originalPrice: number;
  inStock: boolean;
}

export interface ProviderAdapter {
  providerId: string;
  crawlLimitPerMinute: number;
  testConnection(): Promise<boolean>;
  scrapeCategory(category: string): Promise<ScrapedProduct[]>;
}`
  },
  {
    id: "queues_events",
    title: "7. Queue & Event Broker Architecture",
    category: "APIs & Webhooks",
    icon: "Network",
    content: `### Queue & Event Broker Topology

PriceOS utilizes a high-performance, background asynchronous payload topology powered by **BullMQ** on Redis. 

### BullMQ Job Queues:
1. **Crawl Queue**: Dispatches triggers pointing to target sellers. Split geographically to evade rate-blocks.
2. **Ingest Queue**: Processes raw catalog arrays extracted by worker scrapers. Parses elements individually.
3. **Matching Queue**: Receives raw lists, triggering string normalization, vector hashing, and Gemini validation calls.
4. **Alert Queue**: Triggered when listings detect drops compared to target price filters. Handles fast retries on connection failures.`,
    codeLanguage: "typescript",
    codeBlock: `// Redis Queue Connector Design Example
import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const crawlerQueue = new Queue("crawl-dispatch-queue", { connection });

export const ingesterWorker = new Worker(
  "listings-ingest-queue",
  async (job: Job) => {
    const { providerId, listingsArray } = job.data;
    console.log("Ingest Worker processing task from: " + providerId);
    // Push listings parsing pipeline
  },
  { connection }
);`
  },
  {
    id: "deployment_configs",
    title: "8. Docker Deployment Infrastructure Setup",
    category: "Infrastructure Deployment",
    icon: "Layers2",
    content: `### Production Multi-Container Orchestration (Docker Compose Spec)

PriceOS is deployed natively utilizing Docker and Docker Compose. This declarative file provisions PostgreSQL indices, Redis memory layers, decoupled microservice nodes, and Typesense clusters fully synchronized with reverse proxy layers.`,
    codeLanguage: "yaml",
    codeBlock: `version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: priceos-postgres
    environment:
      POSTGRES_DB: priceos
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: SecretProductionDbPassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: priceos-redis
    ports:
      - "6379:6379"

  typesense:
    image: typesense/typesense:26.0
    container_name: priceos-typesense
    ports:
      - "8108:8108"

volumes:
  pgdata:
  typesensestruct:`
  },
  {
    id: "cicd_pipelines",
    title: "9. CI/CD GitHub Execution Pipeline",
    category: "Infrastructure Deployment",
    icon: "Settings",
    content: `### Enterprise CI/CD Pipeline Configuration (GitHub Actions Runner)

This pipeline establishes complete test execution covering NestJS endpoints, followed by automated multi-target Docker image packaging and continuous rollouts to multi-region Cloud Run container nodes.`,
    codeLanguage: "yaml",
    codeBlock: `name: PriceOS Continuous Integration & Deployment

on:
  push:
    branches: [ main ]

jobs:
  validate-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source code
        uses: actions/checkout@v4

      - name: Setup Node.js v20 Env
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run Global Code Linter Tests
        run: npm run lint`
  },
  {
    id: "roadmap_plan",
    title: "10. Development Roadmap & Phases",
    category: "Roadmap & Implementation",
    icon: "HelpCircle",
    content: `### Phase-wise Implementation Strategy

PriceOS is structured across four phases to go from initial architectural designs to production rollouts supporting massive indices safely.

### Phase Milestones Summary:

#### Phase 1: Core Portal Architecture (Weeks 1-4)
- Initialize Workspace layout. Configure monorepo modules using 'pnpm'.
- Design PostgreSQL schema and provision baseline containers.
- Implement Public Search Engine UI containing side-by-side providers.

#### Phase 2: Crawler Orchestration & Search Indexing (Weeks 5-8)
- Implement Crawler package. Stand up Puppeteer scraper clusters.
- Wire Crawlers to run inside cron scheduler handlers using standard loops.
- Configure Typesense schemas, routing crawl updates straight into Typese-indexed data.

#### Phase 3: AI Product Matching & Automated Alerts (Weeks 9-12)
- Deploy Cosine Similarity Engine inside matcher pipelines processing incoming listings.
- Wire Gemini models to run validation checks validating equivalence candidates.
- Build Redis BullMQ queues dispatching automated price price notifications.

#### Phase 4: Elasticity & Optimization (Weeks 13-16)
- Build full-stack grocery cart split optimizations across sellers.
- Stand up production Prometheus monitors and metrics counters.
- Rollout production Docker compose configurations. Add API Gateway layers.`,
    codeLanguage: "text",
    codeBlock: "Milestones checklist:\n[✓] Architecture blueprints finalized\n[✓] Relational DB schema formatted\n[ ] Alpha Workspace deploy (In Progress)\n[ ] Active headless crawl dispatchers setup\n[ ] Vector matching evaluation tests\n[ ] Final cluster releases"
  }
];
