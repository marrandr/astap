import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class CloudinaryService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  uploadPrivate(file: UploadedFile, folder = 'journalist-proofs'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, type: 'authenticated', resource_type: 'image' },
        (error, result) => (error || !result ? reject(error) : resolve(result)),
      );
      Readable.from(file.buffer).pipe(stream);
    });
  }

  getSignedUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      type: 'authenticated',
      sign_url: true,
      secure: true,
    });
  }

  delete(publicId: string) {
    return cloudinary.uploader.destroy(publicId, { type: 'authenticated' });
  }
}
