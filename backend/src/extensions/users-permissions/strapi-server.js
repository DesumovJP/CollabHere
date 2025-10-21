module.exports = (plugin) => {
  // Додаємо GraphQL resolvers напряму до users-permissions плагіна
  const graphqlPlugin = strapi.plugin('graphql');
  
  if (graphqlPlugin) {
    const extensionService = graphqlPlugin.service('extension');
    
    // Реєструємо custom типи та мутації
    extensionService.shadowCRUD('plugin::users-permissions.user').field('slug', { type: 'String' });
    extensionService.shadowCRUD('plugin::users-permissions.user').field('location', { type: 'String' });
    extensionService.shadowCRUD('plugin::users-permissions.user').field('phoneNumber', { type: 'Long' });
    extensionService.shadowCRUD('plugin::users-permissions.user').field('avatar', { type: 'UploadFileEntityResponse' });
    
    // Додаємо custom мутацію updateMe
    extensionService.use(({ nexus }) => ({
      types: [
        nexus.extendType({
          type: 'Mutation',
          definition(t) {
            t.field('updateMe', {
              type: 'UsersPermissionsMe',
              args: {
                username: nexus.stringArg(),
                email: nexus.stringArg(),
                location: nexus.stringArg(),
                phoneNumber: nexus.stringArg(),
                avatar: nexus.intArg(),
              },
              async resolve(parent, args, context) {
                const { id } = context.state?.user || {};
                
                if (!id) {
                  throw new Error('You must be authenticated to update your profile');
                }
                
                // Підготовка даних для оновлення
                const updateData = {};
                
                if (args.username !== undefined) updateData.username = args.username;
                if (args.email !== undefined) updateData.email = args.email;
                if (args.location !== undefined) updateData.location = args.location;
                if (args.phoneNumber !== undefined) updateData.phoneNumber = args.phoneNumber;
                if (args.avatar !== undefined) updateData.avatar = args.avatar;
                
                // Оновлюємо користувача
                const updatedUser = await strapi.query('plugin::users-permissions.user').update({
                  where: { id },
                  data: updateData,
                  populate: ['avatar', 'role'],
                });
                
                if (!updatedUser) {
                  throw new Error('Failed to update user');
                }
                
                return {
                  id: updatedUser.id,
                  username: updatedUser.username,
                  email: updatedUser.email,
                  confirmed: updatedUser.confirmed,
                  blocked: updatedUser.blocked,
                  role: updatedUser.role,
                };
              },
            });
          },
        }),
      ],
    }));
  }
  
  // Додаємо REST API endpoint для updateMe
  plugin.controllers.user.updateMe = async (ctx) => {
    const userId = ctx.state?.user?.id;

    console.log('📝 updateMe called, userId:', userId);
    console.log('📝 ctx.state.user:', ctx.state?.user);

    if (!userId) {
      console.log('❌ No userId found in ctx.state.user');
      return ctx.unauthorized('You must be authenticated to update your profile');
    }

    const { username, email, location, phoneNumber, avatar, slug } = ctx.request.body;
    
    console.log('📝 Request body:', { username, email, location, phoneNumber, avatar, slug });

    try {
      // Спочатку перевіримо чи користувач існує
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: userId },
      });
      
      console.log('📝 Existing user found:', existingUser ? 'Yes' : 'No');
      
      if (!existingUser) {
        console.log('❌ User not found with id:', userId);
        return ctx.notFound('User not found');
      }
      
      const updateData = {};
      
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (location !== undefined) updateData.location = location;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (slug !== undefined) updateData.slug = slug;
      if (avatar !== undefined) updateData.avatar = avatar;

      console.log('📝 Updating user with data:', updateData);

      const updatedUser = await strapi.query('plugin::users-permissions.user').update({
        where: { id: userId },
        data: updateData,
        populate: ['avatar', 'role'],
      });

      console.log('✅ User updated successfully:', updatedUser ? 'Yes' : 'No');

      if (!updatedUser) {
        console.log('❌ Update returned null');
        return ctx.badRequest('Failed to update user');
      }

      // Повертаємо дані без пароля
      const sanitizedUser = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        slug: updatedUser.slug,
        location: updatedUser.location,
        phoneNumber: updatedUser.phoneNumber,
        avatar: updatedUser.avatar,
        confirmed: updatedUser.confirmed,
        blocked: updatedUser.blocked,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      console.log('✅ Sending sanitized user:', sanitizedUser);
      ctx.send(sanitizedUser);
    } catch (error) {
      console.error('❌ Error in updateMe:', error);
      ctx.badRequest('Error updating user', { error: error.message });
    }
  };

  // Додаємо роут для updateMe
  if (!plugin.routes['content-api']) {
    plugin.routes['content-api'] = { routes: [] };
  }
  
  plugin.routes['content-api'].routes.push({
    method: 'PUT',
    path: '/users/me',
    handler: 'user.updateMe',
    config: {
      prefix: '',
      policies: [],
      auth: {
        scope: ['plugin::users-permissions.user.me'],
      },
    },
  });

  console.log('✅ Custom route registered: PUT /api/users/me');
  console.log('📝 Total content-api routes:', plugin.routes['content-api'].routes.length);

  return plugin;
};

