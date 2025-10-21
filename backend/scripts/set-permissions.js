'use strict';

async function setPublicPermissions() {
  try {
    // Find the ID of the public role
    const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: {
        type: 'public',
      },
    });

    if (!publicRole) {
      console.log('Public role not found');
      return;
    }

    console.log('Setting permissions for public role...');

    // Define permissions for all content types
    const permissions = {
      article: ['find', 'findOne'],
      category: ['find', 'findOne'],
      author: ['find', 'findOne'],
      global: ['find', 'findOne'],
      about: ['find', 'findOne'],
      product: ['find', 'findOne'],
    };

    // Add user permissions for authenticated users
    const userPermissions = {
      user: ['find', 'findOne', 'update'],
      article: ['find', 'findOne'],
      category: ['find', 'findOne'],
      author: ['find', 'findOne'],
      global: ['find', 'findOne'],
      about: ['find', 'findOne'],
      product: ['find', 'findOne'],
    };

    // Create permissions for public role
    for (const [controller, actions] of Object.entries(permissions)) {
      for (const action of actions) {
        try {
          await strapi.query('plugin::users-permissions.permission').create({
            data: {
              action: `api::${controller}.${controller}.${action}`,
              role: publicRole.id,
            },
          });
          console.log(`✓ Created permission: ${controller}.${action}`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`- Permission already exists: ${controller}.${action}`);
          } else {
            console.error(`✗ Error creating permission ${controller}.${action}:`, error.message);
          }
        }
      }
    }

    // Create permissions for authenticated role
    const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: {
        type: 'authenticated',
      },
    });

    if (authenticatedRole) {
      console.log('Setting permissions for authenticated role...');
      for (const [controller, actions] of Object.entries(userPermissions)) {
        for (const action of actions) {
          try {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action: `api::${controller}.${controller}.${action}`,
                role: authenticatedRole.id,
              },
            });
            console.log(`✓ Created authenticated permission: ${controller}.${action}`);
          } catch (error) {
            if (error.message.includes('already exists')) {
              console.log(`- Authenticated permission already exists: ${controller}.${action}`);
            } else {
              console.error(`✗ Error creating authenticated permission ${controller}.${action}:`, error.message);
            }
          }
        }
      }
    }

    console.log('✅ Permissions set successfully!');
  } catch (error) {
    console.error('❌ Error setting permissions:', error);
  }
}

async function createTestProducts() {
  try {
    console.log('Creating test products...');
    
    const testProducts = [
      {
        title: "Fashion T-Shirt",
        description: "Comfortable cotton t-shirt with modern design",
        price: 29.99,
        slug: "fashion-t-shirt",
        publishedAt: new Date(),
      },
      {
        title: "Designer Jeans", 
        description: "Premium denim jeans with perfect fit",
        price: 89.99,
        slug: "designer-jeans",
        publishedAt: new Date(),
      },
      {
        title: "Elegant Dress",
        description: "Beautiful evening dress for special occasions", 
        price: 149.99,
        slug: "elegant-dress",
        publishedAt: new Date(),
      },
      {
        title: "Casual Sneakers",
        description: "Comfortable sneakers for everyday wear",
        price: 79.99,
        slug: "casual-sneakers", 
        publishedAt: new Date(),
      }
    ];

    for (const product of testProducts) {
      try {
        await strapi.documents('api::product.product').create({
          data: product,
        });
        console.log(`✓ Created product: ${product.title}`);
      } catch (error) {
        console.error(`✗ Error creating product ${product.title}:`, error.message);
      }
    }

    console.log('✅ Test products created!');
  } catch (error) {
    console.error('❌ Error creating products:', error);
  }
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await setPublicPermissions();
  await createTestProducts();
  
  await app.destroy();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
