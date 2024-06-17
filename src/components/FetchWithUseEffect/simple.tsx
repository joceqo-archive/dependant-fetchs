import { useEffect, useState } from "react";
import type {Pokemon, APIResourceList } from 'pokedex-promise-v2';


const FetchWithUseEffect = () => {
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

        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const { results }: APIResourceList = await response.json();
        const names = (results as unknown as {name:string}[]).map((pokemon) => ({
         name: pokemon.name
        })) 
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

  return (
    <div>
      <h1>Pokémon List</h1>
      <ul>
        {pokemonList.map((pokemon, index) => (
          <li key={pokemon.id ?? index}>
            <h2>{pokemon.name}</h2>
            {pokemon.sprites?.front_default && <img src={pokemon.sprites.front_default} alt={pokemon.name} />}
            {pokemon.height && <p>Height: {pokemon.height}</p>}
            {pokemon.weight && <p>Weight: {pokemon.weight}</p>}
            {pokemon.base_experience && <p>Base Experience: {pokemon.base_experience}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FetchWithUseEffect;
