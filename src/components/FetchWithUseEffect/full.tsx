import { useEffect, useState } from "react";
import type {Pokemon, APIResourceList } from 'pokedex-promise-v2';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton'
import {Badge, Heading} from '@radix-ui/themes';


const FetchWithUseEffect = () => {
  const [pokemonList, setPokemonList] = useState<Partial<Pokemon & {url: string}>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState<number>(pokemonList.length);

  const fetchPokemon = async (offset: number) => {
    try {
      const remaining = 150 - pokemonList.length
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

  const getTypeCounts = (pokemonList: Pokemon[]) => {
    const typeCounts: { [key: string]: number } = {};
    pokemonList.forEach(pokemon => {
      pokemon.types?.forEach(typeInfo => {
        const type = typeInfo.type.name;
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    });
    return typeCounts;
  };

  const completePokemonList = pokemonList.filter((pokemon): pokemon is Pokemon => 
    pokemon.abilities !== undefined && 
    pokemon.types !== undefined
  );

  const typeCounts = getTypeCounts(completePokemonList);

  const typeEmojiColorMap: { [key: string]: { emoji: string, color: string } } = {
    grass: { emoji: '🌿', color: 'text-green-500' },
    poison: { emoji: '☠️', color: 'text-purple-500' },
    fire: { emoji: '🔥', color: 'text-red-500' },
    flying: { emoji: '🕊️', color: 'text-blue-300' },
    water: { emoji: '💧', color: 'text-blue-500' },
    bug: { emoji: '🐛', color: 'text-green-700' },
    normal: { emoji: '⚪', color: 'text-gray-500' },
    electric: { emoji: '⚡', color: 'text-yellow-500' },
    ground: { emoji: '🌍', color: 'text-brown-500' },
    fairy: { emoji: '✨', color: 'text-pink-500' },
    fighting: { emoji: '🥊', color: 'text-red-700' },
    psychic: { emoji: '🔮', color: 'text-purple-300' },
    rock: { emoji: '🪨', color: 'text-gray-700' },
    steel: { emoji: '🔩', color: 'text-gray-400' },
    ice: { emoji: '❄️', color: 'text-blue-200' },
    ghost: { emoji: '👻', color: 'text-purple-700' },
    dragon: { emoji: '🐉', color: 'text-red-900' },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="px-4">
      <Heading size="8" className="pb-4 mt-4">Pokémon List</Heading>
      <div className="type-dashboard mb-4">
        <Heading size="4" className="pb-2">Pokémon Types</Heading>
        <div>
          {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
            const { emoji, color } = typeEmojiColorMap[type] || { emoji: '', color: '' };
            return (
              <Badge key={type} className={`mr-2 ${color}`}>
                {emoji} {type} ({count})
              </Badge>
            );
          })}
        </div>
      </div>
      <Heading size="4" className="pb-2 mb-4">Pokémon Cards</Heading>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <li key={index}>
              <Card>
                <CardHeader>
                  <CardTitle><Skeleton className="w-10 h-4" /></CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton style={{ width: "150px", height: "150px" }} />
                  <p><Skeleton style={{ width: "80px" }} /></p>
                  <p><Skeleton style={{ width: "80px" }} /></p>
                  <p><Skeleton style={{ width: "80px" }} /></p>
                </CardContent>
              </Card>
            </li>
          ))
        ) : (
          pokemonList.map((pokemon) => (
            <li key={`${pokemon.id}-${offset}`}>
              <Card>
                <CardHeader>
                  <CardTitle>{pokemon.name}</CardTitle>
                  <CardDescription>{pokemon.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  {pokemon.sprites?.front_default && <img src={pokemon.sprites.front_default} alt={pokemon.name} />}
                  {pokemon.height && <p>Height: {pokemon.height}</p>}
                  {pokemon.weight && <p>Weight: {pokemon.weight}</p>}
                  {pokemon.base_experience && <p>Base Experience: {pokemon.base_experience}</p>}
                  {pokemon.types?.map((typeInfo) => {
                    const { emoji, color } = typeEmojiColorMap[typeInfo.type.name] || { emoji: '', color: '' };
                    return (
                      <Badge key={typeInfo.type.name} className={`mr-2 ${color}`}>
                        {emoji} {typeInfo.type.name}
                      </Badge>
                    );
                  })}
                </CardContent>
              </Card>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default FetchWithUseEffect;
