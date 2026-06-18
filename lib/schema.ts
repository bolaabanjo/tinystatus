import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const monitors = pgTable('monitors', {
    id: uuid('id').defaultRandom().primaryKey(),
    url: text('url').notNull(),
    displayName: text('display_name').notNull(),
    slug: text('slug').unique().notNull(),
    userId: text('user_id'),
    checkInterval: integer('check_interval').default(30).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const checkResults = pgTable('check_results', {
    id: uuid('id').defaultRandom().primaryKey(),
    monitorId: uuid('monitor_id').references(() => monitors.id).notNull(),
    status: text('status', { enum: ['up', 'degraded', 'down'] }).notNull(),
    statusCode: integer('status_code'),
    latencyMs: integer('latency_ms'),
    region: text('region').notNull(),
    error: text('error'),
    checkedAt: timestamp('checked_at', { withTimezone: true }).defaultNow().notNull(),
});

export const incidents = pgTable('incidents', {
    id: uuid('id').defaultRandom().primaryKey(),
    monitorId: uuid('monitor_id').references(() => monitors.id).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    severity: text('severity', { enum: ['degraded', 'down'] }).notNull(),
    aiSummary: text('ai_summary'),
    rawData: jsonb('raw_data'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
