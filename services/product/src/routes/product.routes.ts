import { FastifyInstance } from 'fastify';

import { createProduct, getProducts, getProduct, updateProduct, deleteProduct } from '../services/product.service';
import { IProductCreate } from '@sportshop/shared-types';

export default async function productRoutes(fastify: FastifyInstance) {
  // Public: List of products
  fastify.get('/', {
    schema: {
      description: 'Get all products',
      tags: ['Products'],
      response: {
        200: {
          description: 'List of all products',
          type: 'array',
          items: { $ref: 'Product#' },
        },
      },
    },
  }, async () => {
    return getProducts();
  });

  // Public: one product
  fastify.get('/:id', {
    schema: {
      description: 'Get a product by ID',
      tags: ['Products'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Product ID' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'Product details',
          content: {
            'application/json': {
              schema: { $ref: 'Product#' },
            },
          },
        },
        404: {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const product = await getProduct(Number(id));
    if (!product) {
      return reply.status(404).send({ message: 'Product not found' });
    }
    return product;
  });

  // Protected: Product creation (admin only)
  fastify.post<{ Body: IProductCreate }>('/', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Create a new product',
      tags: ['Products'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string', maxLength: 200, description: 'Product name' },
          description: { type: 'string', maxLength: 1000, description: 'Product description' },
          price: { type: 'number', minimum: 0, description: 'Product price' },
          stock: { type: 'integer', minimum: 0, default: 0, description: 'Available stock quantity' },
          category: { type: 'string', maxLength: 100, description: 'Product category' },
          imageUrl: { type: 'string', maxLength: 500, description: 'Product image URL' },
        },
      },
      response: {
        201: {
          description: 'Product created successfully',
          content: {
            'application/json': {
              schema: { $ref: 'Product#' },
            },
          },
        },
        401: {
          description: 'Unauthorized (JWT token required)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
        403: {
          description: 'Forbidden (admin role required)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const user = request.user;
    if (user?.role !== 'admin') {
      return reply.status(403).send({ message: 'Forbidden' });
    }
    const product = await createProduct(request.body);
    return reply.status(201).send(product);
  });

  // Protected: update (admin only)
  fastify.put<{ Params: { id: string }; Body: Partial<IProductCreate> }>('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Update a product',
      tags: ['Products'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Product ID' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 200 },
          description: { type: 'string', maxLength: 1000 },
          price: { type: 'number', minimum: 0 },
          stock: { type: 'integer', minimum: 0 },
          category: { type: 'string', maxLength: 100 },
          imageUrl: { type: 'string', maxLength: 500 },
        },
      },
      response: {
        200: {
          description: 'Product updated successfully',
          content: {
            'application/json': {
              schema: { $ref: 'Product#' },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
        403: {
          description: 'Forbidden (admin only)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
        404: {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const user = request.user;
    if (user?.role !== 'admin') {
      return reply.status(403).send({ message: 'Forbidden' });
    }
    const { id } = request.params;
    const product = await updateProduct(Number(id), request.body);
    if (!product) {
      return reply.status(404).send({ message: 'Product not found' });
    }
    return product;
  });

  // Protected: deletion (admin only)
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Delete a product',
      tags: ['Products'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Product ID' },
        },
        required: ['id'],
      },
      response: {
        204: {
          description: 'Product deleted successfully',
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
        403: {
          description: 'Forbidden (admin only)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
        404: {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { message: { type: 'string' } },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const user = request.user;
    if (user?.role !== 'admin') {
      return reply.status(403).send({ message: 'Forbidden' });
    }
    const { id } = request.params;
    const deleted = await deleteProduct(Number(id));
    if (!deleted) {
      return reply.status(404).send({ message: 'Product not found' });
    }
    return reply.status(204).send();
  });
}
