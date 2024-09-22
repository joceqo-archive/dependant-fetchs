import { useEffect, useState } from "react";
import type {Pokemon, APIResourceList } from 'pokedex-promise-v2';
import { Heading} from '@radix-ui/themes';
import { PokemonCard, PokemonCardSkeleton } from "@/components/PokemonCard";
import { getTypeCounts } from "@/utils/typeCounts";
import { PokemonTypesSummary } from "@/components/PokemonTypesSummary";

const LIMIT = 150; // 150 is the total number of pokemons of the first generation

const batch = () => {
  const [pokemonList, setPokemonList] = useState<Partial<Pokemon & {url: string}>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState<number>(pokemonList.length);

  const fetchPokemon = async (offset: number) => {
    try {
      const remaining = LIMIT - pokemonList.length
      const limit =  remaining > 50 ? 100 : remaining;
      console.log("pokemonList.length", pokemonList.length);
      console.log("remaining", remaining);
      console.log("limit", limit); 
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const { results }: APIResourceList = await response.json();

      const pokemons = (results as unknown as {name:string, url:string}[]).map((pokemon) => ({
       name: pokemon.name,
       id: Number(pokemon.url.split('/').at(-2)),
       url: pokemon.url
      })) 

      setPokemonList((prev) => [...prev, ...pokemons]);  
      setLoading(false);

      const detailedPokemonPromises = results.map((pokemon: { url: string }) =>
        fetch(pokemon.url).then(res => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
      );

      const detailedPokemonData: Pokemon[] = await Promise.all(detailedPokemonPromises);
      const detailedPokemons = detailedPokemonData.map((_pokemon) => {
        const match = pokemonList.find(x => x.id === _pokemon.id)
        return {
          ..._pokemon,
          url: match?.url ?? ''
        }
      })

      setPokemonList((prev) => {
        console.log("prev", prev);
        const detailPrev = prev.map(x => {

          const match = detailedPokemons.find(pokemon => pokemon.id === x.id)

          if(match) {
            return match
          }
          return x;
        })

        return detailPrev
      });

      if(pokemonList.length < 150) {
        console.log("here", pokemonList.length);
        setOffset(pokemonList.length);
      }
  
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pokemonList.length < 150) {
      fetchPokemon(pokemonList.length);
    }
  }, [pokemonList.length]);



  const completePokemonList = pokemonList.filter((pokemon): pokemon is Pokemon => 
    pokemon.abilities !== undefined && 
    pokemon.types !== undefined
  );

  const typeCounts = getTypeCounts(completePokemonList);


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>      
      <PokemonTypesSummary typeCounts={typeCounts} />
      <Heading size="4" className="pb-2 mb-4">Pokémon Cards ({pokemonList.length})</Heading>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <li key={index}>
             <PokemonCardSkeleton />
            </li>
          ))
        ) : (
          pokemonList
            .filter((pokemon): pokemon is Pokemon => pokemon.abilities !== undefined && pokemon.types !== undefined)
            .map((pokemon) => (
              <li key={`${pokemon.id}-${offset}`}>
                <PokemonCard pokemon={pokemon} />
              </li>
            ))
        )}
      </ul>
    </>
  );
};

export default batch;
