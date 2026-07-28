import { Request, Response, NextFunction } from "express";

import { customerService } from "./customer.service.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.validation.js";

export class CustomerController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCustomerSchema.parse(req.body);

      const customer = await customerService.create(data);

      res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await customerService.findAll();

      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const customer = await customerService.findById(req.params.id);

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

  async update(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const data = updateCustomerSchema.parse(req.body);

    const customer = await customerService.update(req.params.id, data);

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

  async delete(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    await customerService.delete(req.params.id);

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
}

export const customerController = new CustomerController();