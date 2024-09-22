import { useQuery, useQueries } from '@tanstack/react-query';
import type { Pokemon, APIResourceList } from 'pokedex-promise-v2';
import { PokemonCard } from "@/components/PokemonCard";
import { PokemonTypesSummary } from "@/components/PokemonTypesSummary";
import { getTypeCounts } from "@/utils/typeCounts";
import { Heading } from '@radix-ui/themes';

const fetchPokemonList = async () => {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150');
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const fetchPokemonDetails = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const BasicWithReactQuery = () => {
  const { data: pokemonList, isLoading, error } = useQuery<APIResourceList, Error>({
    queryKey: ['pokemonListBasic'],
    queryFn: fetchPokemonList
  });

  console.log('pokemonList', pokemonList);
  const detailedPokemonQueries = useQueries({
    queries: pokemonList?.results?.map((pokemon) => ({
      queryKey: ['pokemonDetails', pokemon.url],
      queryFn: () => fetchPokemonDetails(pokemon.url),
    })) || []
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const detailedPokemonData = detailedPokemonQueries.map(query => query.data).filter(Boolean) as Pokemon[];

  const completePokemonList = detailedPokemonData.filter(
    (pokemon): pokemon is Pokemon => pokemon.abilities !== undefined && pokemon.types !== undefined
  );

  const typeCounts = getTypeCounts(completePokemonList);

  return (
    <>
      <PokemonTypesSummary typeCounts={typeCounts} />
      <Heading size="4" className="pb-2 mb-4">Pokémon Cards ({detailedPokemonData.length})</Heading>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {detailedPokemonData.map((pokemon) => (
          <li key={pokemon.name}>
            <PokemonCard pokemon={pokemon} />
          </li>
        ))}
      </ul>
    </>
  );
};

export default BasicWithReactQuery;
