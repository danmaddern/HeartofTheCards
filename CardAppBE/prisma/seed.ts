import { PrismaClient, Brand, ProductType, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const pokemonCategory = await prisma.category.upsert({
    where: { slug: 'pokemon' },
    update: {},
    create: {
      name: 'Pokémon',
      slug: 'pokemon',
      description: 'Pokémon Trading Card Game products',
      imageUrl: 'https://images.unsplash.com/photo-1605979257913-1704eb7b6246?w=400',
    },
  });

  const onePieceCategory = await prisma.category.upsert({
    where: { slug: 'one-piece' },
    update: {},
    create: {
      name: 'One Piece',
      slug: 'one-piece',
      description: 'One Piece Trading Card Game products',
      imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400',
    },
  });

  const accessoriesCategory = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Card sleeves, binders, deck boxes and more',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    },
  });

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@heartofthecards.com.au' },
    update: {},
    create: {
      email: 'admin@heartofthecards.com.au',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });
  console.log('👤 Admin user:', admin.email);

  // Create demo customer
  const customerPasswordHash = await bcrypt.hash('Customer123!', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'demo@heartofthecards.com.au' },
    update: {},
    create: {
      email: 'demo@heartofthecards.com.au',
      passwordHash: customerPasswordHash,
      firstName: 'Demo',
      lastName: 'Customer',
      role: Role.CUSTOMER,
      phone: '0412 345 678',
    },
  });
  console.log('👤 Demo customer:', customer.email);

  // Dev bypass admin (quick access, no real password needed in production)
  const devPasswordHash = await bcrypt.hash('dev', 10);
  await prisma.user.upsert({
    where: { email: 'dev@heartofthecards.dev' },
    update: {},
    create: {
      email: 'dev@heartofthecards.dev',
      passwordHash: devPasswordHash,
      firstName: 'Dev',
      lastName: 'Admin',
      role: Role.ADMIN,
    },
  });
  console.log('👤 Dev bypass: dev@heartofthecards.dev / dev');

  // Admin accounts — link automatically when signing in with Google
  const ownerPasswordHash = await bcrypt.hash(process.env.OWNER_PASSWORD || 'ChangeMe123!', 10);
  await prisma.user.upsert({
    where: { email: 'dan.maddern@gmail.com' },
    update: { role: Role.ADMIN },
    create: {
      email: 'dan.maddern@gmail.com',
      passwordHash: ownerPasswordHash,
      firstName: 'Dan',
      lastName: 'Maddern',
      role: Role.ADMIN,
    },
  });
  console.log('👤 Admin: dan.maddern@gmail.com');

  await prisma.user.upsert({
    where: { email: 'cochranemitchell.2000@gmail.com' },
    update: { role: Role.ADMIN },
    create: {
      email: 'cochranemitchell.2000@gmail.com',
      passwordHash: ownerPasswordHash,
      firstName: 'Mitchell',
      lastName: 'Cochrane',
      role: Role.ADMIN,
    },
  });
  console.log('👤 Admin: cochranemitchell.2000@gmail.com');

  // Pokémon booster boxes
  const pokemonProducts = [
    {
      name: 'Pokémon Scarlet & Violet - Prismatic Evolutions Booster Box',
      slug: 'pokemon-sv-prismatic-evolutions-booster-box',
      description:
        'The Pokémon TCG: Scarlet & Violet—Prismatic Evolutions expansion features dazzling Pokémon in an array of special illustrations. Each booster box contains 36 packs of 10 cards each, giving you the best chance at pulling rare Eevee evolutions and powerful ex Pokémon. A must-have for collectors and competitive players alike.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '249.95',
      compareAtPrice: '279.95',
      stockQuantity: 15,
      imageUrls: [
        'https://d1i787aglh9bmb.cloudfront.net/assets/img/sv-expansions/sv8dot5/collections/en-us/sv8pt5-booster-bundle-en.png',
      ],
      isFeatured: true,
      sku: 'PKM-SV-PE-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Scarlet & Violet - Stellar Crown Booster Box',
      slug: 'pokemon-sv-stellar-crown-booster-box',
      description:
        'Pokémon TCG: Scarlet & Violet—Stellar Crown introduces new Stellar Tera-type Pokémon and exciting special art cards. Each booster box contains 36 booster packs. Hunt for rare Stellar Crown Special Illustration Rares and Crown-type Pokémon ex cards.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '219.95',
      compareAtPrice: null,
      stockQuantity: 20,
      imageUrls: [
        'https://d1i787aglh9bmb.cloudfront.net/assets/img/sv-expansions/sv07/collections/en-us/sv07-booster-display-en.png',
      ],
      isFeatured: true,
      sku: 'PKM-SV-SC-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Scarlet & Violet - Twilight Masquerade Booster Box',
      slug: 'pokemon-sv-twilight-masquerade-booster-box',
      description:
        'Enter the world of Pokémon TCG: Scarlet & Violet—Twilight Masquerade. Featuring Ancient and Future Pokémon, as well as exciting new Pokémon ex. Each booster box contains 36 packs of 10 cards. Perfect for those chasing the elusive Teal Mask Ogerpon or Cornerstone Mask Ogerpon ex.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '199.95',
      compareAtPrice: '229.95',
      stockQuantity: 8,
      imageUrls: [
        'https://d1i787aglh9bmb.cloudfront.net/assets/img/sv-expansions/sv06/collections/en-us/p9505-sv06-3d-booster-display-36ct-right-en.png',
      ],
      isFeatured: false,
      sku: 'PKM-SV-TM-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Sword & Shield - Crown Zenith Elite Trainer Box',
      slug: 'pokemon-swsh-crown-zenith-etb',
      description:
        "The Pokémon TCG: Crown Zenith Elite Trainer Box contains 10 booster packs from the Crown Zenith set, 65 card sleeves featuring Regieleki & Regidrago VSTAR, 45 Pokémon TCG Energy cards, and more. The perfect collector's item featuring the Hisui region's most iconic Pokémon.",
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '89.95',
      compareAtPrice: '99.95',
      stockQuantity: 25,
      imageUrls: [
        'https://static-assets.pokemon.com/content-assets/cms2/img/trading-card-game/series/incrementals/swsh125-elite-trainer-box/swsh125-elite-trainer-box-169-en.png',
      ],
      isFeatured: false,
      sku: 'PKM-SWSH-CZ-ETB-001',
      categoryId: pokemonCategory.id,
    },
  ];

  // One Piece booster boxes
  const onePieceProducts = [
    {
      name: 'One Piece Card Game - Kingdoms of Intrigue [OP-04] Booster Box',
      slug: 'one-piece-op04-kingdoms-of-intrigue-booster-box',
      description:
        'The One Piece Card Game: Kingdoms of Intrigue [OP-04] booster box contains 24 packs of 12 cards each. Featuring powerful new leaders from the Wano Country arc including Kaido and Yamato. Chase the rare Secret Rare cards and full art leaders for your collection or competitive deck.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '149.95',
      compareAtPrice: '169.95',
      stockQuantity: 30,
      imageUrls: [
        'https://en.onepiece-cardgame.com/images/products/boosters/op04/mv_01.jpg',
      ],
      isFeatured: true,
      sku: 'OP-OP04-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Awakening of the New Era [OP-05] Booster Box',
      slug: 'one-piece-op05-awakening-of-the-new-era-booster-box',
      description:
        "Awakening of the New Era [OP-05] introduces characters from the Egghead Island arc including Dr. Vegapunk and the Seraphim. Each booster box contains 24 packs of 12 cards. Don't miss out on the chance to pull the iconic Nika Luffy Secret Rare or powerful leader cards.",
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '159.95',
      compareAtPrice: null,
      stockQuantity: 18,
      imageUrls: [
        'https://en.onepiece-cardgame.com/images/products/boosters/op05/mv_01.jpg',
      ],
      isFeatured: true,
      sku: 'OP-OP05-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Wings of the Captain [OP-06] Booster Box',
      slug: 'one-piece-op06-wings-of-the-captain-booster-box',
      description:
        'Wings of the Captain [OP-06] focuses on the Straw Hat Pirates and their powerful allies. Each booster box contains 24 packs of 12 cards. Features new leader cards including Monkey D. Luffy and powerful crew members across all the factions.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '154.95',
      compareAtPrice: '179.95',
      stockQuantity: 12,
      imageUrls: [
        'https://en.onepiece-cardgame.com/images/products/boosters/op06/mv_01.jpg',
      ],
      isFeatured: false,
      sku: 'OP-OP06-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - 500 Years in the Future [OP-07] Booster Box',
      slug: 'one-piece-op07-500-years-future-booster-box',
      description:
        '500 Years in the Future [OP-07] delves into the mysteries of the Void Century. Each booster box contains 24 packs of 12 cards. Features powerful new cards with never-before-seen mechanics and stunning artwork from the latest One Piece story arcs.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '164.95',
      compareAtPrice: null,
      stockQuantity: 5,
      imageUrls: [
        'https://en.onepiece-cardgame.com/images/products/boosters/op07/mv_01.jpg',
      ],
      isFeatured: true,
      sku: 'OP-OP07-BB-001',
      categoryId: onePieceCategory.id,
    },
  ];

  // Individual cards
  const individualCards = [
    {
      name: 'Charizard ex - Special Illustration Rare (Obsidian Flames)',
      slug: 'charizard-ex-sir-obsidian-flames',
      description:
        "One of the most sought-after cards in the Pokémon TCG Scarlet & Violet era. This Special Illustration Rare Charizard ex features stunning full-art landscape artwork by Takumi Wada. Near Mint condition, pulled from Obsidian Flames. The crown jewel of any Pokémon collection. Grading quality: NM/M (Near Mint to Mint).",
      brand: Brand.POKEMON,
      productType: ProductType.INDIVIDUAL_CARD,
      price: '149.95',
      compareAtPrice: '179.95',
      stockQuantity: 3,
      imageUrls: [
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600',
        'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=600',
      ],
      isFeatured: true,
      sku: 'PKM-IND-CHARZEX-SIR-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Umbreon VMAX - Alternate Art (Evolving Skies)',
      slug: 'umbreon-vmax-alternate-art-evolving-skies',
      description:
        "The iconic Umbreon VMAX Alternate Art from Evolving Skies is one of the most beloved cards in the modern Pokémon TCG. Features breathtaking artwork of Umbreon standing in a moonlit forest. A cornerstone card for any serious Pokémon TCG collection. Condition: Near Mint.",
      brand: Brand.POKEMON,
      productType: ProductType.INDIVIDUAL_CARD,
      price: '89.95',
      compareAtPrice: '109.95',
      stockQuantity: 5,
      imageUrls: ['https://images.unsplash.com/photo-1605979257913-1704eb7b6246?w=600'],
      isFeatured: false,
      sku: 'PKM-IND-UMBVMAX-AA-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Monkey D. Luffy - Secret Rare Leader (One Piece OP-01)',
      slug: 'monkey-d-luffy-secret-rare-op01',
      description:
        "The legendary Secret Rare Monkey D. Luffy leader card from the inaugural One Piece Card Game set. Features stunning alternate artwork and holographic foiling. An essential card for One Piece TCG collectors and competitive players. Condition: Near Mint. This is the Don!! version with 5 Don!! power.",
      brand: Brand.ONE_PIECE,
      productType: ProductType.INDIVIDUAL_CARD,
      price: '79.95',
      compareAtPrice: null,
      stockQuantity: 7,
      imageUrls: ['https://images.unsplash.com/photo-1519682577862-22b62b24cb37?w=600'],
      isFeatured: true,
      sku: 'OP-IND-LUFFY-SR-OP01-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'Roronoa Zoro - Parallel Art (One Piece OP-02)',
      slug: 'roronoa-zoro-parallel-op02',
      description:
        "The premium Parallel Art version of Roronoa Zoro from One Piece Card Game Memorial Collection [OP-02]. Features stunning foil treatment across the entire card face with detailed artwork. One of the most popular character cards for One Piece TCG players. Condition: Near Mint to Mint.",
      brand: Brand.ONE_PIECE,
      productType: ProductType.INDIVIDUAL_CARD,
      price: '34.95',
      compareAtPrice: '44.95',
      stockQuantity: 12,
      imageUrls: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'],
      isFeatured: false,
      sku: 'OP-IND-ZORO-PA-OP02-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'Pikachu ex - Special Illustration Rare (Paldea Evolved)',
      slug: 'pikachu-ex-sir-paldea-evolved',
      description:
        'The adorable and highly collectible Pikachu ex Special Illustration Rare from Paldea Evolved. Features Pikachu in a charming landscape with vibrant artwork. A fan-favourite card that sells out quickly. Perfect gift for any Pokémon fan. Condition: Near Mint.',
      brand: Brand.POKEMON,
      productType: ProductType.INDIVIDUAL_CARD,
      price: '44.95',
      compareAtPrice: '54.95',
      stockQuantity: 8,
      imageUrls: ['https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=600'],
      isFeatured: false,
      sku: 'PKM-IND-PIKEX-SIR-001',
      categoryId: pokemonCategory.id,
    },
  ];

  const allProducts = [...pokemonProducts, ...onePieceProducts, ...individualCards];

  for (const product of allProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        price: product.price as any,
        compareAtPrice: product.compareAtPrice as any,
      },
    });
  }

  console.log(`✅ Created ${allProducts.length} products`);
  console.log('🎉 Seed complete!');
  console.log('');
  console.log('Admin credentials:');
  console.log('  Email: admin@heartofthecards.com.au');
  console.log('  Password: Admin123!');
  console.log('');
  console.log('Demo customer credentials:');
  console.log('  Email: demo@heartofthecards.com.au');
  console.log('  Password: Customer123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
