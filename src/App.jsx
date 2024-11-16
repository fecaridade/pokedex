import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [pokemons, setPokemons] = useState([])
  const [filteredPokemons, setFilteredPokemons] = useState([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const limit = 20

  useEffect(() => {
    fetchPokemons(page)
  }, [page])

  async function fetchPokemons(page) {
    setLoading(true)
    setError(null)
    try {
      const offset = (page - 1) * limit
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
      const pokemonData = await Promise.all(
        response.data.results.map(async (pokemon) => {
          const pokemonDetails = await axios.get(pokemon.url)
          return {
            name: pokemon.name,
            image: pokemonDetails.data.sprites.front_default,
            types: pokemonDetails.data.types.map(typeInfo => typeInfo.type.name)
          }
        })
      )
      setPokemons(pokemonData)
      setFilteredPokemons(pokemonData)
    } catch (error) {
      console.error('Erro ao buscar os pokémons:', error)
    }
    setLoading(false)
  }

  const handleSearch = async (e) => {
    setSearch(e.target.value)
    const searchLower = e.target.value.toLowerCase()

    if (searchLower === "") {
      setFilteredPokemons(pokemons)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchLower}`)
      const pokemon = response.data
      const pokemonData = {
        name: pokemon.name,
        image: pokemon.sprites.front_default,
        types: pokemon.types.map(typeInfo => typeInfo.type.name)
      }
      setFilteredPokemons([pokemonData])
      setError(null)
    } catch (error) {
      console.error('Erro ao buscar o Pokémon:', error)
      setFilteredPokemons([])
      setError("Pokémon não encontrado")
    }
    setLoading(false)
  }

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1)
    setSearch("") 
  }
  const handlePreviousPage = () => {
    setPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1))
    setSearch("")
  }

  // increase better visualization of the pokedex view (i dont have time now) sorry!.
  // foot on sand and 'caipirinha'
  return (
    <>
      <h1>Pokédex</h1>
      <input 
        type="text" 
        placeholder="Buscar Pokémon..." 
        value={search} 
        onChange={handleSearch}
      />
      <div className="pokemon-list">
        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          filteredPokemons.map((pokemon, index) => (
            <div key={index} className="pokemon-card">
              <img src={pokemon.image} alt={pokemon.name} />
              <h2>{pokemon.name}</h2>
              <p>Tipo: {pokemon.types.join(', ')}</p>
            </div>
          ))
        )}
      </div>
      {!search && (
        <div className="pagination">
          <button onClick={handlePreviousPage} disabled={page === 1}>
            Página Anterior
          </button>
          <span>Página {page}</span>
          <button onClick={handleNextPage} disabled={filteredPokemons.length < limit}>
            Próxima Página
          </button>
        </div>
      )}
    </>
  )
}

export default App
