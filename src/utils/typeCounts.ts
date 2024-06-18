import { Pokemon } from "pokedex-promise-v2";

export const getTypeCounts = (pokemonList: Pokemon[]) => {
  const typeCounts: { [key: string]: number } = {};
  pokemonList.forEach(pokemon => {
    pokemon.types?.forEach(typeInfo => {
      const type = typeInfo.type.name;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
  });
  return typeCounts;
};