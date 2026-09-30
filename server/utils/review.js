export const intervalDays = { 2: 2, 3: 4, 4: 8, 5: 16 };

export function applyReview(card, rating, now = new Date()) {
  card.reviewCount += 1;
  card.lastReviewedAt = now;

  if (rating === 'easy') {
    card.easyCount += 1;
    card.box = Math.min(card.box + 1, 5);
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + intervalDays[card.box]);
    card.dueDate = dueDate;
    return;
  }

  if (rating === 'hard') {
    card.hardCount += 1;
    card.box = 1;
    card.dueDate = new Date(now.getTime() + 10 * 60 * 1000);
    return;
  }

  throw Object.assign(new Error('Rating must be easy or hard'), { status: 400 });
}

export function stageFor(card) {
  if (card.box === 5) return 'mastered';
  if (card.reviewCount === 0) return 'new';
  if (card.box <= 2) return 'learning';
  return 'reviewing';
}
