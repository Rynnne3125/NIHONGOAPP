// CloudinaryConfig.ts - Upload ảnh lên Cloudinary

import axios from 'axios';

const CLOUD_NAME = 'ddjrbkhpx';
const API_KEY = '534297453884984';
const API_SECRET = '23OLY_AqI11rISnQ5EHl66OHahU';

export class CloudinaryConfig {
  /**
   * Tải ảnh lên Cloudinary
   * @param uri URI của ảnh (từ react-native-image-picker)
   * @param folder Thư mục trên Cloudinary (mặc định là "nihongo_app")
   * @returns URL của ảnh đã tải lên
   */
  static async uploadImage(uri: string, folder: string = 'nihongo_app'): Promise<string> {
    try {
      console.log('Starting image upload to Cloudinary');

      // Tạo FormData
      const formData = new FormData();

      // Lấy filename và type từ URI
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Append file vào FormData
      formData.append('file', {
        uri: uri,
        type: type,
        name: filename,
      } as any);

      // Tạo upload preset trên Cloudinary dashboard (Settings -> Upload -> Upload presets)
      // hoặc sử dụng API key/secret để upload
      formData.append('api_key', API_KEY);
      formData.append('folder', `${folder}/profile_images`);
      formData.append('resource_type', 'image');
      formData.append('unique_filename', 'true');

      // Tạo timestamp cho signature
      const timestamp = Math.floor(Date.now() / 1000).toString();
      formData.append('timestamp', timestamp);

      // Tạo signature (nên làm ở backend để bảo mật)
      // Đây là cách đơn giản nhất: sử dụng unsigned upload
      formData.append('upload_preset', 'nihongo_unsigned'); // Tạo unsigned preset trên Cloudinary

      console.log(`Uploading to cloud: ${CLOUD_NAME}, folder: ${folder}/profile_images`);

      // Upload lên Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const resultUrl = response.data.secure_url as string;
      console.log('Upload successful, URL:', resultUrl);

      return resultUrl;
    } catch (error) {
      console.error('Error uploading image', error);
      throw error;
    }
  }
}

// ========== HƯỚNG DẪN SETUP CLOUDINARY ==========
/*
1. Tạo Upload Preset trên Cloudinary Dashboard:
   - Vào Settings -> Upload -> Upload presets
   - Click "Add upload preset"
   - Đặt tên preset: "nihongo_unsigned"
   - Signing Mode: "Unsigned"
   - Folder: để trống hoặc đặt "nihongo_app"
   - Lưu lại

2. Hoặc sử dụng Signed Upload (Bảo mật hơn):
   - Cần tạo backend API để tạo signature
   - Backend sẽ generate signature từ API_SECRET
   - Client gửi file + signature lên Cloudinary

Ví dụ Signed Upload Backend (Node.js):
const crypto = require('crypto');

app.post('/get-cloudinary-signature', (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = req.body.folder || 'nihongo_app/profile_images';
  
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');
  
  res.json({ signature, timestamp });
});
*/