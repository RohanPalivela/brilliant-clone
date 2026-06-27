import type { KnapsackParams } from '../reviewBuilders';

// 0/1 knapsack practice bank. Each problem supplies only items + capacity +
// prose; the app derives the optimal value from the same DP engine it grades
// against, so these never carry a hand-entered answer that could drift.
//
// Greedy-trap notes (where the naive choice loses):
//   rb-knap-campsite  -> "grab the flashiest item" (highest value) loses.
//   rb-knap-heist     -> "best value-per-weight first" loses.
//   rb-knap-trailpack -> "grab the flashiest item" loses.
//   rb-knap-vault     -> "grab the flashiest item" loses.
export const knapsackProblems: KnapsackParams[] = [
  {
    id: 'rb-knap-campsite',
    prompt:
      'Your pack holds 7 kg of camp gear. Choose the loot that maximizes total usefulness without going over the 7 kg limit.',
    hint: 'Walk item by item: does taking this piece, plus the best you can do with the weight that remains, beat just leaving it behind?',
    explanation:
      "The bulky tent is the single most useful item, but it eats the whole 7 kg by itself. Skipping it frees room for the stove and lantern together, which fit exactly and total more. Grabbing the flashiest item isn't the move when two lighter items can share the budget and out-score it.",
    items: [
      { label: 'Tent', weight: 7, value: 10 },
      { label: 'Stove', weight: 4, value: 6 },
      { label: 'Lantern', weight: 3, value: 5 },
    ],
    capacity: 7,
  },
  {
    id: 'rb-knap-heist',
    prompt:
      'Your bag fits 6 kg of loot before the alarm trips. Pick the haul with the greatest total worth that still fits.',
    hint: 'The richest-per-kilo item feels obvious to grab first — but check whether taking it leaves you unable to fit a better pair.',
    explanation:
      'The trinket has the best worth-per-weight, so a ratio-greedy thief snatches it first and then crams in scraps. But spending the whole 6 kg on the goblet and idol — neither the best ratio — fits exactly and beats that. The densest item first is a tempting rule that quietly loses here.',
    items: [
      { label: 'Trinket', weight: 1, value: 6 },
      { label: 'Goblet', weight: 3, value: 12 },
      { label: 'Idol', weight: 3, value: 12 },
      { label: 'Tiara', weight: 2, value: 5 },
    ],
    capacity: 6,
  },
  {
    id: 'rb-knap-grocery',
    prompt:
      'You can carry 8 kg of groceries home in one trip. Fill the basket to maximize total value within that weight.',
    hint: 'For each item on the shelf, weigh taking it against skipping it — judged by what the leftover capacity could still hold.',
    explanation:
      "Not everything fits in 8 kg, so some favorite has to be left on the shelf. The trick is comparing each item's value against what the same weight could buy elsewhere, instead of just packing until you run out of room. Filling the most kilos is not the same as carrying the most value.",
    items: [
      { label: 'Milk', weight: 3, value: 4 },
      { label: 'Bread', weight: 2, value: 3 },
      { label: 'Eggs', weight: 2, value: 5 },
      { label: 'Cheese', weight: 4, value: 7 },
      { label: 'Apples', weight: 3, value: 4 },
    ],
    capacity: 8,
  },
  {
    id: 'rb-knap-trailpack',
    prompt:
      'Your trail pack carries 8 kg for the weekend. Choose the gear that maximizes usefulness without exceeding 8 kg.',
    hint: 'Try each item: is it worth more taken (plus the best use of the remaining space) than skipped?',
    explanation:
      "The sleeping bag is the most useful single item, but at 7 kg it leaves room for almost nothing else. Skip it and the jacket, boots, and map fill the 8 kg exactly for a higher total. Cramming in the heaviest prize blocks the lighter combo that wins.",
    items: [
      { label: 'Sleeping Bag', weight: 7, value: 11 },
      { label: 'Jacket', weight: 4, value: 7 },
      { label: 'Boots', weight: 3, value: 6 },
      { label: 'Map', weight: 1, value: 2 },
    ],
    capacity: 8,
  },
  {
    id: 'rb-knap-vault',
    prompt:
      'The treasure chest you carry holds 6 kg. Select the jewels worth the most that still fit in the chest.',
    hint: 'Before reaching for the biggest prize, ask whether the weight it costs could instead hold several gems worth more combined.',
    explanation:
      'The scepter is the heaviest, priciest single piece, so it looks like the obvious grab — but it leaves room for almost nothing. The ruby, emerald, and pearl together fill the same 6 kg and total more. The shiniest item isn\'t always worth the space it demands.',
    items: [
      { label: 'Ruby', weight: 2, value: 8 },
      { label: 'Emerald', weight: 3, value: 9 },
      { label: 'Pearl', weight: 1, value: 4 },
      { label: 'Scepter', weight: 5, value: 10 },
    ],
    capacity: 6,
  },
  {
    id: 'rb-knap-picnic',
    prompt:
      'Your picnic basket fits 7 kg of food. Pack the spread that maximizes total enjoyment within the weight limit.',
    hint: 'Go snack by snack: compare bringing it (plus the best of the leftover room) with leaving it home.',
    explanation:
      "Everything looks tasty, but 7 kg can't hold it all, so some treat gets cut. Score each choice by what the freed-up weight could otherwise carry rather than just topping off the basket. A fuller basket isn't automatically the tastier one.",
    items: [
      { label: 'Sandwich', weight: 4, value: 6 },
      { label: 'Juice', weight: 2, value: 3 },
      { label: 'Cookies', weight: 2, value: 4 },
      { label: 'Banana', weight: 1, value: 2 },
      { label: 'Chips', weight: 3, value: 5 },
    ],
    capacity: 7,
  },
];
