import test from 'node:test';
import assert from 'node:assert/strict';
import { applyReview } from '../utils/review.js';

function card(box) {
  return { box, reviewCount: 0, easyCount: 0, hardCount: 0, dueDate: new Date(0), lastReviewedAt: null };
}

const now = new Date('2026-09-26T12:00:00.000Z');

test('Easy advances boxes with the specified intervals', () => {
  const intervals = [2, 4, 8, 16, 16];
  intervals.forEach((days, index) => {
    const reviewed = card(index + 1);
    applyReview(reviewed, 'easy', now);
    assert.equal(reviewed.box, Math.min(index + 2, 5));
    assert.equal(reviewed.dueDate.getTime() - now.getTime(), days * 86400000);
    assert.equal(reviewed.easyCount, 1);
    assert.equal(reviewed.reviewCount, 1);
    assert.equal(reviewed.lastReviewedAt, now);
  });
});

test('Hard resets any box and schedules review in ten minutes', () => {
  for (let box = 1; box <= 5; box += 1) {
    const reviewed = card(box);
    applyReview(reviewed, 'hard', now);
    assert.equal(reviewed.box, 1);
    assert.equal(reviewed.dueDate.getTime() - now.getTime(), 600000);
    assert.equal(reviewed.hardCount, 1);
    assert.equal(reviewed.reviewCount, 1);
  }
});

test('Unsupported ratings are rejected', () => {
  assert.throws(() => applyReview(card(1), 'again', now), { status: 400 });
});
