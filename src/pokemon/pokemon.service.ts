import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePokemonDto, UpdatePokemonDto } from './dto/index.js';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity.js';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) //con inject model le indicamos a Nest que queremos inyectar el modelo/schema de Pokemon
    private readonly pokemonModel: Model<Pokemon>,
  ) { }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase(); //convertimos el nombre del pokemon a minusculas para evitar problemas de mayusculas/minusculas
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto); //creamos un nuevo pokemon en la base de datos utilizando el modelo/schema de Pokemon
      return pokemon; //devolvemos el pokemon creado
    } catch (error) {
      this.handleExpceptions(error);
    }
  }

  async findAll() {
    const pokemons = await this.pokemonModel.find().sort({ no: 1 }).exec(); //obtenemos todos los pokemons de la base de datos y los ordenamos por número de pokedex 
    try {
      if (pokemons.length === 0) {
        throw new NotFoundException(`No pokemons found in the database`);
      }
      return pokemons;
    } catch (error) {
      this.handleExpceptions(error);
    }
    return pokemons;
  }

  async findOne(term: string) {
    // VERSION OPTIMIZADA - una sola consulta a la BD usando $or de MongoDB
    // El nombre siempre se incluye porque cualquier string puede ser un nombre
    const conditions: object[] = [{ name: term.toLowerCase() }];

    // Si term es un número, agrega la condición por número de pokedex
    if (!isNaN(+term)) conditions.push({ no: +term });

    // Si term es un MongoID válido, agrega la condición por _id
    if (isValidObjectId(term)) conditions.push({ _id: term });

    // MongoDB busca el primer documento que cumpla CUALQUIERA de las condiciones
    const pokemon = await this.pokemonModel.findOne({ $or: conditions });

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with term "${term}" not found`);
    }

    return pokemon;
  }

  private handleExpceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists: ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException(
      `Can't update pokemon - Check server logs`,
    );
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term); // reutiliza la lógica de búsqueda por nombre, número o MongoID
    try {
      await pokemon.updateOne(updatePokemonDto);
    } catch (error) {
      this.handleExpceptions(error);
    }
    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if (deletedCount === 0) {
      throw new NotFoundException(`Pokemon with id "${id}" not found`);
    }
    return { message: `Pokemon with id "${id}" has been removed` };
  }

  // async remove(id: string) {
  //   const ObjectIdValido = isValidObjectId(id);

  //   if (!ObjectIdValido) {
  //     throw new BadRequestException(`"${id}" is not a valid MongoID`);
  //   }
  //   const pokemonEliminado = await this.pokemonModel.findByIdAndDelete(id);

  //   if (!pokemonEliminado) {
  //     throw new NotFoundException(`Pokemon with id "${id}" not found`);
  //   }
  //   return {
  //     message: `Pokemon with id "${id}" has been removed`,
  //     pokemon: pokemonEliminado,
  //   };
  // }
}
