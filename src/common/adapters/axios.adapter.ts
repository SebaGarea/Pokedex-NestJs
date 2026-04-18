import { Injectable } from '@nestjs/common';
import { HttpAdapter } from '../interfaces/http-adapter.interface.js';
import axios, { AxiosInstance } from 'axios';
@Injectable() //decorador que indica que esta clase es un servicio inyectable en NestJS
export class AxiosAdapter implements HttpAdapter {
  private axios: AxiosInstance = axios;
  async get<T>(url: string): Promise<T> {
    try {
      const { data } = await this.axios.get<T>(url);
      return data;
    } catch (error) {
      throw new Error(`Error fetching data from ${url}: ${error.message}`);
    }
  }
}
