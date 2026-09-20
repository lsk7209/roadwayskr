import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchFestivalDetail } from '../lib/tourapi/client';

test('empty or mismatched detail success envelopes cannot reach the importer', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.TOUR_API_SERVICE_KEY;
  process.env.TOUR_API_SERVICE_KEY = 'offline-test';
  try {
    for (const scenario of ['empty', 'empty-common', 'empty-intro', 'wrong-id', 'wrong-type', 'identity-only-common', 'identity-only-intro', 'whitespace-only', 'unknown-only', 'valid']) {
      globalThis.fetch = async input => {
        const intro = String(input).includes('/detailIntro2');
        const identityOnly = scenario === (intro ? 'identity-only-intro' : 'identity-only-common') || scenario === 'unknown-only';
        const fields = scenario === 'whitespace-only' ? (intro ? {eventplace:' \t '} : {title:' \n '}) : intro ? {eventstartdate:'20261001',eventenddate:'20261005'} : {title:'test'};
        const item = { contentid: scenario === 'wrong-id' ? '999' : '229054', contenttypeid: scenario === 'wrong-type' ? '12' : '15', ...(identityOnly ? {unknownMetadata:'ignored'} : fields) };
        const empty = scenario === 'empty' || scenario === (intro ? 'empty-intro' : 'empty-common');
        return Response.json({response:{header:{resultCode:'0000',resultMsg:'OK'},body:{items:empty ? '' : {item:[item]},totalCount:empty ? 0 : 1}}});
      };
      if (scenario === 'valid') assert.equal((await fetchFestivalDetail('229054')).intro.eventstartdate, '20261001');
      else await assert.rejects(fetchFestivalDetail('229054'), /detail|identity|type/i, scenario);
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TOUR_API_SERVICE_KEY;
    else process.env.TOUR_API_SERVICE_KEY = originalKey;
  }
});
