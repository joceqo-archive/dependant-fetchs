import { useInfiniteQuery } from '@tanstack/react-query';
import type { Pokemon, APIResourceList } from 'pokedex-promise-v2';
import { Heading } from '@radix-ui/themes';
import { PokemonCard } from "@/components/PokemonCard";
import { getTypeCounts } from "@/utils/typeCounts";
import { PokemonTypesSummary } from "@/components/PokemonTypesSummary";
import { useEffect } from 'react';
import { useQueries } from '@tanstack/react-query';
import {_fetch} from '@/customFetch';

const LIMIT = 150;
const OFFSET = 50;

const fetchPokemon = async ({ pageParam = 0 }: { pageParam?: number }) => {
  const offset = pageParam * OFFSET;
  const response = await _fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=50`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const fetchPokemonDetails = async (url: string): Promise<Pokemon> => {
  const response = await _fetch(url);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const PaginatedWithReactQuery = () => {
  const {
    data,
    error,
    fetchNextPage,
    status,
  } = useInfiniteQuery<APIResourceList, Error>({
    queryKey: ['pokemonListPaginated'],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchPokemon({ pageParam: pageParam as number })
    },
    getNextPageParam: (_lastPage, _pages, lastPageParam) => {
      const itemsLength = _pages?.length ? _pages.flatMap(page => page.results).length : 0;
      if (itemsLength >= LIMIT) {
        return null;
      }
      return (lastPageParam as number) + 1;
    },
    initialPageParam: 0,
  });

  const detailedPokemonQueries = useQueries({
    queries: (data?.pages.flatMap(page => page.results) || []).map((pokemon) => ({
      queryKey: ['pokemonDetails', pokemon.url],
      queryFn: () => fetchPokemonDetails(pokemon.url),
    })),
  });

  const detailedPokemonData = detailedPokemonQueries.map(query => query.data).filter(Boolean) as Pokemon[];
  const isDetailedPokemonFoo = detailedPokemonData.every(query => query.status !== 'loading');

  useEffect(() => {
    console.log('isDetailedPokemonFoo', isDetailedPokemonFoo);
    console.log('detailedPokemonData.length', detailedPokemonData.length);
    if (isDetailedPokemonFoo && detailedPokemonData.length <= LIMIT) {
      fetchNextPage();
    }
  }, [detailedPokemonData.length, isDetailedPokemonFoo]);

  const typeCounts = getTypeCounts(detailedPokemonData);

  if (status === 'pending') return <div>Loading...</div>;
  if (status === 'error' && error instanceof Error) return <div>Error: {error.message}</div>;

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

export default PaginatedWithReactQuery;