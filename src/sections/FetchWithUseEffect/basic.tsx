import { useEffect, useState } from "react";
import type { Pokemon, APIResourceList } from 'pokedex-promise-v2';
import { PokemonCard, PokemonCardSkeleton } from "@/components/PokemonCard";
import { PokemonTypesSummary } from "@/components/PokemonTypesSummary";
import { getTypeCounts } from "@/utils/typeCounts";
import { Heading } from "@radix-ui/themes";

const basic = () => {
  const [pokemonList, setPokemonList] = useState<Partial<Pokemon>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {

        // wait 3 seconds
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 3000);
        });

        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const { results }: APIResourceList = await response.json();
        const names = (results as unknown as { name: string }[]).map((pokemon) => ({
          name: pokemon.name
        }))
        console.log("names", names)
        setPokemonList(names);
        setLoading(false);

        // wait 10 seconds
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 10000);
        })

        // fetch details
        const detailedPokemonPromises = results.map((pokemon: { url: string }) =>
          fetch(pokemon.url).then(res => {
            if (!res.ok) {
              throw new Error('Network response was not ok');
            }
            return res.json();
          })
        );

        const detailedPokemonData: Pokemon[] = await Promise.all(detailedPokemonPromises);

        setPokemonList(detailedPokemonData);

      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const completePokemonList = pokemonList.filter(
    (pokemon): pokemon is Pokemon => pokemon.abilities !== undefined && pokemon.types !== undefined
  );

  const typeCounts = getTypeCounts(completePokemonList);

  return (
    <>
      <PokemonTypesSummary typeCounts={typeCounts} />
      <Heading size="4" className="pb-2 mb-4">Pokémon Cards ({pokemonList.length})</Heading>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pokemonList.map((pokemon) => {
          // pokemon is only a name show skeleton else show card
          if (pokemon.abilities !== undefined && pokemon.types !== undefined) {
            const _pokemonList = pokemonList.filter((pokemon): pokemon is Pokemon => pokemon.abilities !== undefined && pokemon.types !== undefined)
            return _pokemonList.map((pokemon) => (
              <li key={pokemon.name}>
                <PokemonCard pokemon={pokemon} />
              </li>
            ))
          } else {
            return <PokemonCardSkeleton key={pokemon.name} name={pokemon.name} />
          }
        })}
      </ul>
    </>
  );
};

export default basic;
