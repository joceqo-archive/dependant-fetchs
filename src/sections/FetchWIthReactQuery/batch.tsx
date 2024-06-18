import { useQuery, useQueries } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Heading } from '@radix-ui/themes';
import { PokemonCard } from "@/components/PokemonCard";
import { getTypeCounts } from "@/utils/typeCounts";
import { PokemonTypesSummary } from "@/components/PokemonTypesSummary";
import type { Pokemon, APIResourceList } from 'pokedex-promise-v2';

const LIMIT = 150;


const batchedWithReactQuery = () => {
  const [pokemonList, setPokemonList] = useState<Partial<Pokemon & { url: string }>[]>([]);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    console.log('vrevrev', offset)
  }, [offset])

  const { data: { results } = { results: [] }, isLoading, error } = useQuery<APIResourceList>({
    queryKey: ['batchedWithReactQuery', offset],
    queryFn: async () => {
      const remaining = LIMIT - pokemonList.length;
      const limit = remaining > 50 ? 100 : remaining;
      console.log("limit", limit, remaining);
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }
  });

  const detailedPokemonQueries = useQueries({
    queries: results.map((pokemon: { url: string }) => ({
      queryKey: ['pokemonDetails', pokemon.url],
      queryFn: async () => {
        const response = await fetch(pokemon.url);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      },
    })) || []
  });

  const allQueriesSettled = detailedPokemonQueries.every(query => query.isSuccess || query.isError)


  useEffect(() => {
    if (pokemonList.length < 150) {

      if (allQueriesSettled) {
        const detailedPokemonData = detailedPokemonQueries.map(query => query.data) as Pokemon[];
        const uniqDetailedPokemonData = detailedPokemonData.filter((pokemon) => {
          const match = pokemonList.find(x => x.id === pokemon.id);
          return !match;
        });

        const newOffset = pokemonList.length + uniqDetailedPokemonData.length

        setPokemonList((prev) => [...prev, ...uniqDetailedPokemonData]);

        if (newOffset < 150) {
          console.log('not here', newOffset)
          setOffset(newOffset);
        }
      }
    }
  }, [allQueriesSettled, pokemonList.length]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const completePokemonList = pokemonList.filter((pokemon): pokemon is Pokemon =>
    pokemon.abilities !== undefined &&
    pokemon.base_experience !== undefined &&
    pokemon.forms !== undefined &&
    pokemon.game_indices !== undefined &&
    pokemon.height !== undefined &&
    pokemon.held_items !== undefined &&
    pokemon.id !== undefined &&
    pokemon.is_default !== undefined &&
    pokemon.location_area_encounters !== undefined &&
    pokemon.moves !== undefined &&
    pokemon.name !== undefined &&
    pokemon.order !== undefined &&
    pokemon.species !== undefined &&
    pokemon.sprites !== undefined &&
    pokemon.stats !== undefined &&
    pokemon.types !== undefined &&
    pokemon.weight !== undefined
  );

  const typeCounts = getTypeCounts(completePokemonList);

  if (!results && isLoading && !pokemonList.length) {
    return <div>Loading...</div>;
  }

  const _pokemonList = pokemonList
  .filter((pokemon): pokemon is Pokemon =>
    pokemon.abilities !== undefined &&
    pokemon.base_experience !== undefined &&
    pokemon.forms !== undefined &&
    pokemon.game_indices !== undefined &&
    pokemon.height !== undefined &&
    pokemon.held_items !== undefined &&
    pokemon.id !== undefined &&
    pokemon.is_default !== undefined &&
    pokemon.location_area_encounters !== undefined &&
    pokemon.moves !== undefined &&
    pokemon.name !== undefined &&
    pokemon.order !== undefined &&
    pokemon.species !== undefined &&
    pokemon.sprites !== undefined &&
    pokemon.stats !== undefined &&
    pokemon.types !== undefined &&
    pokemon.weight !== undefined
  )

  const _pokemons = _pokemonList ?? results

  return (
    <>
      <PokemonTypesSummary typeCounts={typeCounts} />
      <Heading size="4" className="pb-2 mb-4">Pokémon Cards ({pokemonList.length})</Heading>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {_pokemons.map((pokemon) => (
          <li key={pokemon.id}>
            <PokemonCard pokemon={pokemon} />
          </li>
        ))}
      </ul>
    </>
  );
};

export default batchedWithReactQuery;