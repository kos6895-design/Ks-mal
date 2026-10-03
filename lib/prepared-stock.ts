import type { Ingredient, State } from './bar';

export const PREPARED_STOCK_VERSION = 'prepared-dishes-2026-10-01';

// One complete prepared portion per dish, including the garnish in its name.
// No raw ingredient weights or actual quantities are inferred.
export function installPreparedStock(original: State): State {
  if (original.catalogUpdates?.includes(PREPARED_STOCK_VERSION)) return original;
  const state = structuredClone(original);
  const dishes = state.menu.filter(product => product.station === 'kitchen');
  const used = new Set<string>();
  for (const product of dishes) {
    const single = product.recipe.length === 1 && product.recipe[0].qty === 1
      ? state.ingredients.find(item => item.id === product.recipe[0].id) : undefined;
    let preparation: Ingredient | undefined = single && !used.has(single.id) &&
      (single.unit === 'шт' || single.unit === 'порц') &&
      (single.kind === 'prepared' || /заготовка/i.test(single.name)) ? single : undefined;
    if (!preparation) {
      const id = `prepared-${product.id}`;
      preparation = state.ingredients.find(item => item.id === id);
      if (!preparation) {
        preparation = { id, name: `${product.name} — заготовка`, unit: 'порц', qty: 0, kind: 'prepared' };
        state.ingredients.push(preparation);
      }
    }
    preparation.kind = 'prepared';
    // Existing piece-counted preparations already represent one complete portion.
    preparation.unit = 'порц';
    used.add(preparation.id);
    product.recipe = [{ id: preparation.id, qty: 1 }];
    delete product.recipeNote;
  }
  state.catalogUpdates = [...(state.catalogUpdates ?? []), PREPARED_STOCK_VERSION];
  state.logs.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), who: 'Настройка приготовления',
    text: `Бар и кухня объединены. Для ${dishes.length} блюд настроено списание одной порции заготовки. Новые остатки — 0; внесите фактический приход. Ранее созданные заказы сохраняют свои техкарты.`,
    shiftId: state.shifts.find(shift => !shift.closed)?.id });
  return state;
}
