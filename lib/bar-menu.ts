import type { Ingredient, Product, State } from './bar';

// User-supplied prices and serving sizes, 1 October 2026.
export const BAR_CARD_VERSION = 'bar-card-2026-10-01';
const bottleNote = 'Уточните объём бутылки и расход по техкарте. До заполнения техкарты продажа недоступна.';
const cocktailNote = 'Уточните марку алкоголя и количество каждого ингредиента. До заполнения техкарты продажа недоступна.';

export function barCard(): { menu: Product[]; ingredients: Ingredient[] } {
  const menu: Product[] = [];
  const ingredients: Ingredient[] = [];
  const spirits: [string, string, number, number, number][] = [
    ['wine', 'Вино', 150, 500, 2500],
    ['ford', 'Виски Форд скотч', 50, 200, 4000],
    ['jack', 'Виски Джек Дэниэлс', 50, 500, 7500],
    ['chivas', 'Виски Чивас', 50, 500, 7500],
    ['tsarskaya', 'Водка Царская', 50, 200, 2000],
    ['rosy', 'Водка Чистые Росы', 50, 400, 4000],
    ['askaneli', 'Коньяк Асканели', 50, 200, 2000],
    ['camus', 'Коньяк Камю', 50, 1000, 10000],
    ['punta', 'Ром Пунта кана', 50, 200, 3000],
    ['don-papa', 'Ром Дон папа', 50, 1000, 15000],
    ['gin', 'Джин', 50, 200, 3000],
  ];
  for (const [slug, name, serving, glassPrice, bottlePrice] of spirits) {
    const ingredientId = `bar-stock-${slug}`;
    // Keep the user's grams as grams. Do not silently convert mass to volume.
    ingredients.push({ id: ingredientId, name, unit: 'г', qty: 0 });
    menu.push({ id: `bar-${slug}-portion`, name: `${name} — ${serving} г`, price: glassPrice,
      station: 'bar', active: true, recipe: [{ id: ingredientId, qty: serving }] });
    menu.push({ id: `bar-${slug}-bottle`, name: `${name} — 1 бутылка`, price: bottlePrice,
      station: 'bar', active: true, recipe: [], recipeNote: bottleNote });
  }
  const packaged: [string, string, number][] = [
    ['water', 'Вода (кроме Боржоми)', 200],
    ['borjomi', 'Боржоми — 0,5 л', 300],
    ['soda', 'Газировка', 200],
    ['energy', 'Энергетик', 200],
    ['tarkos', 'Пиво Таркос', 200],
    ['corona', 'Пиво Корона', 300],
    ['staropramen', 'Пиво Старопрамен', 300],
  ];
  for (const [slug, name, price] of packaged) {
    const ingredientId = `bar-stock-${slug}`;
    ingredients.push({ id: ingredientId, name, unit: 'шт', qty: 0 });
    menu.push({ id: `bar-${slug}`, name, price, station: 'bar', active: true,
      recipe: [{ id: ingredientId, qty: 1 }] });
  }
  for (const [slug, name] of [['whisky-cola', 'Виски + кола'], ['rum-cola', 'Ром + кола'], ['gin-tonic', 'Джин + тоник']]) {
    menu.push({ id: `bar-${slug}`, name, price: 300, station: 'bar', active: true,
      recipe: [], recipeNote: cocktailNote });
  }
  return { menu, ingredients };
}

// One-time content upgrade. It never rewrites orders, quantities, shifts, or later edits.
export function installBarCard(original: State): State {
  if (original.catalogUpdates?.includes(BAR_CARD_VERSION)) return original;
  const state = structuredClone(original);
  const card = barCard();
  for (const ingredient of card.ingredients) {
    if (!state.ingredients.some(item => item.id === ingredient.id)) state.ingredients.push(ingredient);
  }
  const demoDrinks = [
    { id: 'rc', name: 'Ром-кола', price: 450, recipe: [{ id: 'rum', qty: 50 }, { id: 'cola', qty: 150 }] },
    { id: 'mr', name: 'Malina Rum', price: 550, recipe: [{ id: 'rum', qty: 50 }, { id: 'puree', qty: 30 }, { id: 'lemon', qty: 20 }] },
    { id: 'c', name: 'Кола', price: 200, recipe: [{ id: 'cola', qty: 250 }] },
  ];
  for (const demo of demoDrinks) {
    const item = state.menu.find(item => item.id === demo.id);
    if (item?.name === demo.name && item.price === demo.price && JSON.stringify(item.recipe) === JSON.stringify(demo.recipe)) item.active = false;
  }
  state.menu = [...card.menu.filter(item => !state.menu.some(existing => existing.id === item.id)), ...state.menu];
  state.catalogUpdates = [...(state.catalogUpdates ?? []), BAR_CARD_VERSION];
  state.logs.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), who: 'Обновление меню',
    text: 'Добавлена барная карта: 32 позиции с ценами владельца. Для бутылок алкоголя и коктейлей требуется заполнить техкарты.',
    shiftId: state.shifts.find(shift => !shift.closed)?.id });
  return state;
}
