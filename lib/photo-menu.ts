import type { Ingredient, Product, State } from './bar';

export const PHOTO_MENU_VERSION = 'photo-menu-IMG3600-2026-10-01';
const foodNote = 'Уточните ингредиенты и их расход на одну порцию. До заполнения техкарты продажа недоступна.';
const hotDrinkNote = 'Уточните количество чая, кофе, молока и других ингредиентов на одну порцию. До заполнения техкарты продажа недоступна.';

// Prices transcribed from the owner's menu photo. Recipes are not on the photo.
export function photoMenu(): { menu: Product[]; ingredients: Ingredient[] } {
  const food: [string, string, number][] = [
    ['solyanka', 'Суп «Солянка мясная»', 500],
    ['pumpkin', 'Суп «Тыквенный»', 500],
    ['chicken-chop', 'Куриная отбивная с картофелем фри', 600],
    ['pork-chop', 'Свиная отбивная с картофелем фри', 600],
    ['cheese-platter', 'Нарезка сырная', 500],
    ['meat-platter', 'Нарезка мясная', 500],
    ['fish-platter', 'Нарезка рыбная', 500],
    ['salmon-sandwich', 'Сэндвич с лососем', 500],
    ['chicken-sandwich', 'Сэндвич с курицей', 500],
    ['beef-salad', 'Салат с говядиной', 500],
    ['chicken-mushroom-salad', 'Салат с курицей и грибами', 500],
    ['nuggets', 'Наггетсы', 500],
    ['bites', 'Байтсы', 500],
  ];
  const menu: Product[] = food.map(([slug, name, price]) => ({
    id: `food-${slug}`, name, price, station: 'kitchen', active: true, recipe: [], recipeNote: foodNote,
  }));
  const hot: [string, string, number][] = [
    ['black-tea-400', 'Чай чёрный — 400 мл', 200],
    ['black-tea-800', 'Чай чёрный — 800 мл', 300],
    ['green-tea-400', 'Чай зелёный — 400 мл', 200],
    ['green-tea-800', 'Чай зелёный — 800 мл', 300],
    ['espresso', 'Кофе эспрессо', 100],
    ['americano', 'Кофе американо', 150],
    ['cappuccino', 'Кофе капучино', 200],
  ];
  menu.push(...hot.map(([slug, name, price]): Product => ({
    id: `hot-${slug}`, name, price, station: 'bar', active: true, recipe: [], recipeNote: hotDrinkNote,
  })));
  const ingredients: Ingredient[] = [];
  for (const [slug, name] of [['sprite', 'Спрайт'], ['cola', 'Кола'], ['fanta', 'Фанта']]) {
    const ingredientId = `glass-stock-${slug}`;
    const fullName = `${name} — 0,5 л, стекло`;
    ingredients.push({ id: ingredientId, name: fullName, qty: 0, unit: 'шт' });
    menu.push({ id: `glass-${slug}`, name: fullName, price: 200, station: 'bar', active: true,
      recipe: [{ id: ingredientId, qty: 1 }] });
  }
  return { menu, ingredients };
}

export function installPhotoMenu(original: State): State {
  if (original.catalogUpdates?.includes(PHOTO_MENU_VERSION)) return original;
  const state = structuredClone(original);
  const additions = photoMenu();
  for (const item of additions.ingredients) {
    if (!state.ingredients.some(existing => existing.id === item.id)) state.ingredients.push(item);
  }
  for (const product of additions.menu) {
    if (!state.menu.some(existing => existing.id === product.id)) state.menu.push(product);
  }

  // Reuse the current SKU and its stock/recipe. Old orders keep their snapshots.
  const fries = state.menu.find(item => item.id === 'f') ?? state.menu.find(item => item.name === 'Картофель фри');
  if (fries) fries.price = 200;
  else state.menu.push({ id: 'food-fries', name: 'Картофель фри', price: 200, station: 'kitchen',
    active: true, recipe: [], recipeNote: foodNote });

  for (const [id, name, price] of [
    ['bar-water', 'Вода — 0,5 л, стекло', 200],
    ['bar-borjomi', 'Боржоми — 0,5 л, стекло', 300],
    ['bar-energy', 'Энергетический напиток', 200],
  ] as const) {
    const existing = state.menu.find(item => item.id === id);
    if (existing) { existing.name = name; existing.price = price; }
  }
  // The general soda placeholder is superseded by the three named drinks.
  // Keep its inventory intact: allocation between brands needs an actual count.
  const soda = state.menu.find(item => item.id === 'bar-soda');
  if (soda?.name === 'Газировка' && soda.price === 200 &&
      JSON.stringify(soda.recipe) === JSON.stringify([{ id: 'bar-stock-soda', qty: 1 }])) soda.active = false;

  state.catalogUpdates = [...(state.catalogUpdates ?? []), PHOTO_MENU_VERSION];
  state.logs.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), who: 'Обновление меню',
    text: 'Добавлено меню с фотографии: блюда, чай 400/800 мл, кофе, спрайт, кола и фанта. Картофель фри — 200 ₽. Цены существующих заказов сохранены.',
    shiftId: state.shifts.find(shift => !shift.closed)?.id });
  return state;
}
