import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface.js';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from '../pokemon/entities/pokemon.entity.js';
import { Model } from 'mongoose';
import { AxiosAdapter } from '../common/adapters/axios.adapter.js';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name) //con inject model le indicamos a Nest que queremos inyectar el modelo/schema de Pokemon
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,//inyeccion del servicio http para hacer peticiones a la pokeapi
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    const pokemonToInsert = data.results.map(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      return { name, no }; // 👈 map necesita el return
    });

    await this.pokemonModel.insertMany(pokemonToInsert);
    return `Seed executed successfully`;
  }
}
