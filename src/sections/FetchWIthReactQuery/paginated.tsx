import { useInfiniteQuery } from '@tanstack/react-query';
import type { Pokemon, APIResourceList } from 'pokedex-promise-v2';
import { Heading } from '@radix-ui/themes';
import { PokemonCard } from "@/components/PokemonCard";
import { getTypeCounts } from "@/utils/typeCounts";
import { PokemonTypesSummary } from "@/components/PokemonTypesSummary";
import { useEffect, useState } from 'react';

const LIMIT = 150;

const fetchPokemon = async ({ pageParam = 0 }: { pageParam?: number }) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${pageParam}&limit=50`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const fetchPokemonDetails = async (url: string): Promise<Pokemon> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const PaginatedWithReactQuery = () => {
  const [detailedPokemonData, setDetailedPokemonData] = useState<Pokemon[]>([]);
  const [hasFetchDetails, setHasFetchDetails] = useState(false);

  const {
    data,
    error,
    fetchNextPage,
    status,
  } = useInfiniteQuery<APIResourceList, Error>({
    queryKey: ['pokemonList'],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('pageParam', pageParam);
      return fetchPokemon({ pageParam: pageParam as number});
    },
    getNextPageParam: (_lastPage, _pages, lastPageParam) => {
      return (lastPageParam as number) + 1;
    },
    initialPageParam: 0,
  });

  useEffect(() => {
    setHasFetchDetails(false);
    const fetchDetails = async () => {
      if (data) {
        const pokemonList = data.pages.flatMap(page => page.results) || [];
        const details = await Promise.all(
          pokemonList.map(pokemon => fetchPokemonDetails(pokemon.url))
        );
        setDetailedPokemonData(details);
        setHasFetchDetails(true);
      }
    };
    fetchDetails();
  }, [data]);

  useEffect(() => {
    if (hasFetchDetails && detailedPokemonData.length < LIMIT) {
      fetchNextPage()
    }
  }, [hasFetchDetails]);



  const typeCounts = getTypeCounts(detailedPokemonData);

  if (status === 'pending') return <div>Loading...</div>;
  if (status === 'error' && error instanceof Error) return <div>Error: {error.message}</div>;

  return (
    <>
      <PokemonTypesSummary typeCounts={typeCounts} />
      <Heading size="4" className="pb-2 mb-4">Pokémon Cards</Heading>
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

export default PaginatedWithReactQuery;