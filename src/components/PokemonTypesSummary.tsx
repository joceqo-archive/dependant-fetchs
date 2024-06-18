import { typeEmojiColorMap } from "@/utils/typeEmojiColorMap";
import { Badge, Heading } from "@radix-ui/themes";


export const PokemonTypesSummary = ({typeCounts}: {typeCounts: { [key: string]: number }}) => {
  return (
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
  )
}