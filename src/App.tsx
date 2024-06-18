import { Simple, Full } from "@/sections/FetchWithUseEffect"
import { Button, Heading } from "@radix-ui/themes";
import { useState } from "react";

type Section = {
  name: string;
  description: string;
  component: JSX.Element;
};

const App = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const sectionList: { [key: number]: Section } = {
    0: {
      name: 'simple',
      description: 'here we look for the url of 150 pokemons, then for each we fetch the data',
      component: <Simple />
    },
    1: {
      name: 'full',
      description: 'here we fetch 100 pokemons, fetch the details, then 50 more to have all of the first, gen. This is more likely what you will encounter with regulars apis',
      component: <Full />
    }
  }

  const selectedSection = sectionList[selectedIndex];

  return (
    <div className="px-4">
      <div className="flex items-center justify-between pb-4 mt-4">
        <Heading size="8">Pokémon List</Heading>
        <div className="flex gap-4">
          {Object.entries(sectionList).map(([index, section]) => (
            <Button key={index} onClick={() => setSelectedIndex(Number(index))} variant={selectedIndex === Number(index) ? 'outline' : 'classic'}>{section.name}</Button>
          ))}
        </div>
      </div>
      <div>{selectedSection.description}</div>
      {selectedSection.component}
    </div>
  )
}

export default App
