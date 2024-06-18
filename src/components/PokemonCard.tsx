import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@radix-ui/themes';
import { Skeleton } from '@/components/ui/skeleton';
import { Pokemon } from 'pokedex-promise-v2';

const PokemonCardFull = ({ pokemon }: { pokemon: Pokemon }) => (
  <Card>
    <CardHeader>
      <CardTitle>{pokemon.name}</CardTitle>
      <CardDescription>ID: {pokemon.id}</CardDescription>
    </CardHeader>
    <CardContent>
      {pokemon.sprites?.front_default && <img src={pokemon.sprites.front_default} alt={pokemon.name} />}
      {pokemon.height && <p>Height: {pokemon.height}</p>}
      {pokemon.weight && <p>Weight: {pokemon.weight}</p>}
      {pokemon.base_experience && <p>Base Experience: {pokemon.base_experience}</p>}
      {pokemon.types?.map((typeInfo) => (
        <Badge key={typeInfo.type.name} className={`mr-2 ${typeInfo.type.name}`}>
          {typeInfo.type.name}
        </Badge>
      ))}
    </CardContent>
  </Card>
);

const PokemonCardSkeleton = ({name}: {name?: string}) => (
  <Card>
    <CardHeader>
      <CardTitle>
        {name ? name : <Skeleton className="w-10 h-4" />}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton style={{ width: "150px", height: "150px" }} />
      <Skeleton style={{ width: "80px" }} />
      <Skeleton style={{ width: "80px" }} />
      <Skeleton style={{ width: "80px" }} />
    </CardContent>
  </Card>
);


const PokemonCard = ({ pokemon }: { pokemon: Pokemon | { name: string } }) => {
  if ('height' in pokemon) {
    return <PokemonCardFull pokemon={pokemon} />;
  }
  return <PokemonCardSkeleton name={pokemon.name} />;
};

export { PokemonCard, PokemonCardSkeleton, PokemonCardFull };
