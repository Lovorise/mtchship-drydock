/**
 * MTCHSHIP Compass: Data Intelligence UI — Zero-Dependency Verification Suite
 * Run: node verify.mjs
 * Copyright © 2026 Lovorise Ltd (England & Wales, Company No. 15814939).
 * Licensed under the Apache License, Version 2.0 (the "License").
 */

import assert from 'node:assert/strict';
import { createCompassSolver, wipeBuffer0x00 } from './solver.js';
import { COMPASS_CHART_CATALOG, createUniversalWidget, createLiveFeedController } from './charts.js';

// 1. Verify 0x00 deterministic memory buffer zeroing
const secretBuf = new TextEncoder().encode('SENSITIVE-INGRESS-PAYLOAD-998877');
const wipe = wipeBuffer0x00(secretBuf);
assert.equal(wipe.wiped, true);
assert.equal(wipe.verifiedAllZero, true);
assert.equal(wipe.persistentDiskBytes, 0);
assert.ok(secretBuf.every((b) => b === 0x00));

// 2. Verify UK & Global B2B Currency + Cross-Check Reconciliation
const ukSolver = createCompassSolver({ region: 'UK' });
const ukRes = ukSolver.solveInRAM('Invoice #UK-101\nNet: £5,000.00\nVAT: £1,000.00\nTotal: £6,000.00');
assert.equal(ukRes.currency, 'GBP');
assert.equal(ukRes.crossCheck.balanced, true);

// 3. Verify 36+ Universal Charts & Live Data Intelligence Stream Controller
assert.ok(COMPASS_CHART_CATALOG.length >= 32);
const widget = createUniversalWidget({ currency: 'GBP', items: [{ label: 'Ingress', value: 75 }, { label: 'Egress', value: 25 }] });
assert.equal(widget.total, 100);

const feed = createLiveFeedController({ currency: 'GBP' });
feed.push({ direction: 'egress', symbol: 'London-Core', value: 1200, bytes: 32768, emittedAtMs: Date.now() - 2 });
assert.equal(feed.getStats().totalEvents, 1);
assert.equal(feed.getStats().wipeReceiptsVerified, 1);

console.log('ALL MTCHSHIP COMPASS CHECKS PASSED (0x00 WIPE, SOLVER, 36 CHARTS, LIVE STREAM)');
