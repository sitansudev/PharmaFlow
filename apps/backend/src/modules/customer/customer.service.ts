import { Customer } from "@prisma/client";

import { customerRepository } from "./customer.repository.js";
import {
  CreateCustomerDTO,
  UpdateCustomerDTO,
} from "./customer.validation.js";

import { AppError } from "../../shared/errors/app-error.js";

export class CustomerService {
  async create(data: CreateCustomerDTO): Promise<Customer> {
    if (data.phone) {
      const existingPhone = await customerRepository.findByPhone(data.phone);

      if (existingPhone) {
        throw new AppError(409, "Phone number already exists");
      }
    }

    if (data.email) {
      const existingEmail = await customerRepository.findByEmail(data.email);

      if (existingEmail) {
        throw new AppError(409, "Email already exists");
      }
    }

    return customerRepository.create(data);
  }

  async findAll(): Promise<Customer[]> {
    return customerRepository.findAll();
  }

  async findById(id: string): Promise<Customer> {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new AppError(404, "Customer not found");
    }

    return customer;
  }

  async update(
    id: string,
    data: UpdateCustomerDTO
  ): Promise<Customer> {
    await this.findById(id);

    if (data.phone) {
      const existingPhone = await customerRepository.findByPhone(data.phone);

      if (existingPhone && existingPhone.id !== id) {
        throw new AppError(409, "Phone number already exists");
      }
    }

    if (data.email) {
      const existingEmail = await customerRepository.findByEmail(data.email);

      if (existingEmail && existingEmail.id !== id) {
        throw new AppError(409, "Email already exists");
      }
    }

    return customerRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    await customerRepository.delete(id);
  }
}

export const customerService = new CustomerService();