import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface UploadResult {
  original: string;
  cloudinary_url: string;
  public_id: string;
}

// Локальные изображения специалистов
const localImages = [
  'young-bearded-man-with-striped-shirt_273609-5677.jpg',
  'confident-attractive-caucasian-guy-beige-pullon-smiling-broadly-while-standing-against-gray_176420-44508.jpg',
  'portrait-white-man-isolated_53876-40306.jpg',
  'smiling-brunette-woman-with-crossed-arms-looking-camera-gray_171337-987.jpg',
  'young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair_285396-896.jpg',
];

// URL изображений для услуг (Unsplash)
const serviceImages = [
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
  'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80',
  'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80',
  'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80',
  'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
  'https://images.unsplash.com/photo-1631217868264-e6641e0e2055?w=800&q=80',
  'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&q=80',
  'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
  'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
  'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80',
];

async function uploadLocalImage(filename: string): Promise<UploadResult> {
  const filePath = path.join(process.cwd(), 'public', filename);

  console.log(`Uploading local: ${filename}...`);

  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'smartmedical/specialists',
    public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
    overwrite: true,
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });

  return {
    original: `/${filename}`,
    cloudinary_url: result.secure_url,
    public_id: result.public_id,
  };
}

async function uploadFromUrl(url: string, index: number): Promise<UploadResult> {
  console.log(`Uploading from URL: service_${index}...`);

  const result = await cloudinary.uploader.upload(url, {
    folder: 'smartmedical/services',
    public_id: `service_${index}`,
    overwrite: true,
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });

  return {
    original: url,
    cloudinary_url: result.secure_url,
    public_id: result.public_id,
  };
}

async function main() {
  console.log('Starting Cloudinary upload...\n');

  const results: {
    specialists: UploadResult[];
    services: UploadResult[];
  } = {
    specialists: [],
    services: [],
  };

  // Upload local specialist images
  console.log('=== Uploading Specialist Images ===\n');
  for (const filename of localImages) {
    try {
      const result = await uploadLocalImage(filename);
      results.specialists.push(result);
      console.log(`✓ ${filename} -> ${result.cloudinary_url}\n`);
    } catch (error) {
      console.error(`✗ Failed to upload ${filename}:`, error);
    }
  }

  // Upload service images from URLs
  console.log('\n=== Uploading Service Images ===\n');
  for (let i = 0; i < serviceImages.length; i++) {
    try {
      const result = await uploadFromUrl(serviceImages[i], i + 1);
      results.services.push(result);
      console.log(`✓ service_${i + 1} -> ${result.cloudinary_url}\n`);
    } catch (error) {
      console.error(`✗ Failed to upload service_${i + 1}:`, error);
    }
  }

  // Save results to JSON for updating seed
  const outputPath = path.join(process.cwd(), 'scripts', 'cloudinary-urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log('\n=== Upload Complete ===');
  console.log(`Results saved to: ${outputPath}`);
  console.log(`\nSpecialists uploaded: ${results.specialists.length}`);
  console.log(`Services uploaded: ${results.services.length}`);

  // Generate seed update code
  console.log('\n=== Specialist URL Mapping ===\n');
  results.specialists.forEach((r) => {
    console.log(`'${r.original}' -> '${r.cloudinary_url}'`);
  });

  console.log('\n=== Service URL Mapping ===\n');
  results.services.forEach((r) => {
    console.log(`'${r.original}' -> '${r.cloudinary_url}'`);
  });
}

main().catch(console.error);
