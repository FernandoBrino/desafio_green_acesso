import { Card } from "@/components/Home/Card";
import { Pagination } from "@/components/Pagination";
import { api } from "@/lib/axios";
import { CardsContainer, FilterButton, HomeContainer, SearchInput } from "@/styles/pages/home";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useTheme } from 'styled-components'
import { BiSearchAlt } from 'react-icons/bi';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BsFilter } from "react-icons/bs";
import { DropdownFilter } from "@/components/Home/DropdownFilter";
import Head from "next/head";

type CharactersApi = {
  info: {
    count: number;
  }
  results: CharacterType[]
}

type CharacterType =  {
  id: number;
  name: string;
  status: string;
  species: string;
  origin: {
    name: string;
  };
  location: {
    name: string;
  };
  image: string;
}

type StatusTypes = "Alive" | "Dead" | "Unknown" | ""

type GenderTypes = "Male" | "Female" | "Genderless" | "Unknown" | ""

type FiltersType = {
    status: StatusTypes;
    gender: GenderTypes
}

const searchCharacter = z.object({
  query: z.string(),
})

type SearchCharacterData = z.infer<typeof searchCharacter>

export default function Home() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dropdownIsActive, setDropdownIsActive] = useState<boolean>(false);
  const [filtersList, setFiltersList] = useState<FiltersType>({} as FiltersType);

  const {green300} = useTheme();

  const { register, watch } = useForm<SearchCharacterData>({
    resolver: zodResolver(searchCharacter),
    defaultValues: {
      query: ''
    }
  });

  const userSearch = watch("query");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [currentPage])

  const characters = useQuery(["characters", currentPage, userSearch, filtersList], () => {
    return api.get<CharactersApi>(`character?page=${currentPage}&${userSearch && `name=${userSearch}&`}${filtersList.status && `status=${filtersList.status}&`}${filtersList.gender && `gender=${filtersList.gender}&`}`,).then(response => response.data)
  })

  function handleChangeCurrentPage(page: number) {
    setCurrentPage(page);
  }

  function handleOpenDropdownFilter() {
    setDropdownIsActive(!dropdownIsActive)
  }

  function handleSetCharactersFilter(filters: FiltersType) {
    setFiltersList(filters);
  }

  const charactersPerPage = 20;
  const totalCharacters = characters.data?.info.count

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
    

      <HomeContainer>
        <div className="searchFilters">
          <SearchInput>
            <input type="text" {...register("query")} placeholder="Enter character's name"/>
            <BiSearchAlt size={24} color={green300}/>
          </SearchInput>

          <FilterButton isActive={dropdownIsActive}>
            <button onClick={handleOpenDropdownFilter}>
              <BsFilter size={18}/>
            </button>

            <DropdownFilter isActive={dropdownIsActive} handleSetCharactersFilter={handleSetCharactersFilter}/>
          </FilterButton>
        </div>
      
        <CardsContainer>
          {
            !characters.isLoading && characters.data?.results.map(character =>
              <Card character={character} key={character.id} /> 
            )
          }
        </CardsContainer>
        
        
        <Pagination 
          totalCharacters={totalCharacters} 
          charactersPerPage={charactersPerPage} 
          currentPage={currentPage}
          handleChangeCurrentPage={handleChangeCurrentPage}
        />
        
      </HomeContainer>
    </>
  )
}
