import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'events',
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Allowed MIME types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only Images, PDF and Docs are allowed',
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    return new Promise((resolve, reject) => {
      const isImage = file.mimetype.startsWith('image/');
      const resourceType = isImage ? 'image' : 'raw';

      const options: any = {
        folder: folder,
        resource_type: resourceType,
      };

      // Apply transformations only for images
      if (isImage) {
        options.transformation = [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ];
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            reject(new BadRequestException(`Upload failed: ${error.message}`));
          } else {
            resolve(result.secure_url);
          }
        },
      );

    });
  }

  /**
   * Transforms a Cloudinary URL to include optimization parameters (f_auto, q_auto)
   * if they are not already present.
   */
  getOptimizedUrl(url: string): string {
    if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) return url;

    const parts = url.split('/upload/');
    const baseUrl = parts[0];
    const rest = parts[1];

    // If it's already optimized, don't do anything
    if (rest.includes('f_auto') && rest.includes('q_auto')) return url;

    // Check if there are existing transformations
    // Transformations are segments before the first 'v' (version) followed by numbers or before the first folder if no version
    const segments = rest.split('/');
    let newRest = '';

    const firstSegment = segments[0];
    const isVersion = /^v\d+$/.test(firstSegment);
    const isTransformation = firstSegment.includes('_') || (firstSegment.includes(',') && !isVersion);

    if (isTransformation) {
      // Existing transformation found
      let transformations = segments[0];
      if (!transformations.includes('f_auto')) transformations += ',f_auto';
      if (!transformations.includes('q_auto')) transformations += ',q_auto';
      newRest = [transformations, ...segments.slice(1)].join('/');
    } else {
      // No explicit transformation, or it's a version/folder
      newRest = ['f_auto,q_auto', ...segments].join('/');
    }

    return `${baseUrl}/upload/${newRest}`;
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }
}
