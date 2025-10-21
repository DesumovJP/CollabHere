const fs = require('fs').promises;
const path = require('path');

module.exports = {
  async upload(ctx) {
    console.log('📤 Avatar upload called');
    
    if (!ctx.state.user) {
      return ctx.unauthorized('You must be logged in to upload avatar');
    }

    const files = ctx.request.files?.files;
    if (!files) {
      return ctx.badRequest('No file provided');
    }

    const file = Array.isArray(files) ? files[0] : files;
    
    console.log('📝 File info:', {
      name: file.name,
      size: file.size,
      type: file.type,
      path: file.path
    });

    try {
      // Генеруємо унікальне ім'я файлу
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = path.extname(file.name);
      const newFileName = `avatar_${timestamp}_${randomStr}${ext}`;
      
      // Шлях до папки uploads
      const uploadDir = path.join(strapi.dirs.static.public, 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      
      const newFilePath = path.join(uploadDir, newFileName);
      
      console.log('📁 Copying file to:', newFilePath);
      
      // Просто копіюємо файл БЕЗ обробки
      await fs.copyFile(file.path, newFilePath);
      
      console.log('✅ File copied successfully');
      
      // Створюємо запис в БД
      const fileData = {
        name: file.name,
        alternativeText: file.name,
        caption: `Avatar for user ${ctx.state.user.username}`,
        width: null,
        height: null,
        formats: null,
        hash: `${timestamp}_${randomStr}`,
        ext: ext,
        mime: file.type || file.mimetype,
        size: (file.size / 1000).toFixed(2), // KB
        url: `/uploads/${newFileName}`,
        previewUrl: null,
        provider: 'local',
        provider_metadata: null,
        createdBy: ctx.state.user.id,
        updatedBy: ctx.state.user.id,
      };
      
      console.log('💾 Creating DB entry...');
      
      const uploadedFile = await strapi.entityService.create('plugin::upload.file', {
        data: fileData,
      });
      
      console.log('✅ Avatar uploaded:', uploadedFile.id);
      
      ctx.send(uploadedFile);
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      return ctx.internalServerError(`Upload failed: ${error.message}`);
    }
  },
};


