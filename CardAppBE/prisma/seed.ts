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

  await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Card sleeves, binders, deck boxes and more',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    },
  });

  // Admin accounts
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
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

  const customerPasswordHash = await bcrypt.hash('Customer123!', 10);
  await prisma.user.upsert({
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

  // Pokémon booster boxes (10 sets, all with locally hosted images)
  const pokemonProducts = [
    {
      name: 'Pokémon Scarlet & Violet - Prismatic Evolutions Booster Box',
      slug: 'pokemon-sv-prismatic-evolutions-booster-box',
      description: 'The Pokémon TCG: Scarlet & Violet—Prismatic Evolutions expansion features dazzling Eevee evolutions in stunning prismatic illustrations. Each booster box contains 36 packs of 10 cards each. A must-have for collectors and competitive players alike.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '249.95',
      compareAtPrice: '279.95',
      stockQuantity: 15,
      imageUrls: ['/products/pkm-prismatic-evolutions.png'],
      isFeatured: true,
      sku: 'PKM-SV8PT5-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Scarlet & Violet - Stellar Crown Booster Box',
      slug: 'pokemon-sv-stellar-crown-booster-box',
      description: 'Pokémon TCG: Scarlet & Violet—Stellar Crown introduces new Stellar Tera-type Pokémon and exciting special art cards. Each booster box contains 36 booster packs. Hunt for rare Crown-type Pokémon ex cards.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '219.95',
      compareAtPrice: null,
      stockQuantity: 20,
      imageUrls: ['/products/pkm-stellar-crown.png'],
      isFeatured: true,
      sku: 'PKM-SV7-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Scarlet & Violet - Surging Sparks Booster Box',
      slug: 'pokemon-sv-surging-sparks-booster-box',
      description: 'Pokémon TCG: Scarlet & Violet—Surging Sparks crackles with electric energy featuring Pikachu ex and powerful new Pokémon. Each booster box contains 36 packs. Don\'t miss the stunning Special Illustration Rares.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '229.95',
      compareAtPrice: '249.95',
      stockQuantity: 10,
      imageUrls: ['/products/pkm-surging-sparks.png'],
      isFeatured: true,
      sku: 'PKM-SV8-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Scarlet & Violet - Twilight Masquerade Booster Box',
      slug: 'pokemon-sv-twilight-masquerade-booster-box',
      description: 'Enter the world of Pokémon TCG: Scarlet & Violet—Twilight Masquerade. Featuring Ancient and Future Pokémon and exciting new Pokémon ex. Each booster box contains 36 packs of 10 cards.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '199.95',
      compareAtPrice: '229.95',
      stockQuantity: 8,
      imageUrls: ['/products/pkm-twilight-masquerade.png'],
      isFeatured: false,
      sku: 'PKM-SV6-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Scarlet & Violet - Temporal Forces Booster Box',
      slug: 'pokemon-sv-temporal-forces-booster-box',
      description: 'Pokémon TCG: Scarlet & Violet—Temporal Forces features Ancient and Future Pokémon with brand-new ACE SPEC cards. Each booster box contains 36 packs. Hunt for the powerful Walking Wake ex and Iron Leaves ex.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '189.95',
      compareAtPrice: '209.95',
      stockQuantity: 12,
      imageUrls: ['/products/pkm-temporal-forces.png'],
      isFeatured: false,
      sku: 'PKM-SV5-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Scarlet & Violet - Paradox Rift Booster Box',
      slug: 'pokemon-sv-paradox-rift-booster-box',
      description: 'Pokémon TCG: Scarlet & Violet—Paradox Rift features Ancient and Future Pokémon unleashed from time. Each booster box contains 36 packs. Chase the ancient Roaring Moon ex and future Iron Valiant ex Special Illustration Rares.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '179.95',
      compareAtPrice: '199.95',
      stockQuantity: 6,
      imageUrls: ['/products/pkm-paradox-rift.jpg'],
      isFeatured: false,
      sku: 'PKM-SV4-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Scarlet & Violet - Obsidian Flames Booster Box',
      slug: 'pokemon-sv-obsidian-flames-booster-box',
      description: 'Pokémon TCG: Scarlet & Violet—Obsidian Flames burns with the power of Charizard ex Tera-type. Each booster box contains 36 packs. The Charizard ex Special Illustration Rare is one of the most coveted cards in the modern Pokémon TCG.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '174.95',
      compareAtPrice: '189.95',
      stockQuantity: 4,
      imageUrls: ['/products/pkm-obsidian-flames.jpg'],
      isFeatured: false,
      sku: 'PKM-SV3-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Scarlet & Violet - Paldea Evolved Booster Box',
      slug: 'pokemon-sv-paldea-evolved-booster-box',
      description: 'Pokémon TCG: Scarlet & Violet—Paldea Evolved brings new Paldean Pokémon to life. Each booster box contains 36 packs. Features fan favourites like Pikachu ex SIR and powerful Eeveelution ex cards.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '169.95',
      compareAtPrice: '189.95',
      stockQuantity: 9,
      imageUrls: ['/products/pkm-paldea-evolved.jpg'],
      isFeatured: false,
      sku: 'PKM-SV2-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Scarlet & Violet Base Set Booster Box',
      slug: 'pokemon-sv-base-booster-box',
      description: 'The inaugural Pokémon TCG: Scarlet & Violet set introduces the new ex mechanic and Tera Pokémon. Each booster box contains 36 packs. Features Koraidon ex, Miraidon ex, and the beloved Pikachu ex.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '159.95',
      compareAtPrice: '179.95',
      stockQuantity: 5,
      imageUrls: ['/products/pkm-scarlet-violet.jpg'],
      isFeatured: false,
      sku: 'PKM-SV1-BB-001',
      categoryId: pokemonCategory.id,
    },
    {
      name: 'Pokémon Scarlet & Violet - Journey Together Booster Box',
      slug: 'pokemon-sv-journey-together-booster-box',
      description: 'Pokémon TCG: Scarlet & Violet—Journey Together celebrates the bond between Trainers and Pokémon. Each booster box contains 36 packs. Features exciting new Pokémon ex and stunning full-art illustration cards.',
      brand: Brand.POKEMON,
      productType: ProductType.BOOSTER_BOX,
      price: '239.95',
      compareAtPrice: null,
      stockQuantity: 18,
      imageUrls: ['/products/pkm-journey-together.jpg'],
      isFeatured: true,
      sku: 'PKM-SV9-BB-001',
      categoryId: pokemonCategory.id,
    },
  ];

  // One Piece booster boxes (OP-01 through OP-13)
  const onePieceProducts = [
    {
      name: 'One Piece Card Game - Romance Dawn [OP-01] Booster Box',
      slug: 'one-piece-op01-romance-dawn-booster-box',
      description: 'The inaugural One Piece Card Game set — Romance Dawn [OP-01] introduces the core mechanics with iconic Straw Hat Pirates. Each booster box contains 24 packs of 12 cards. Chase the legendary Monkey D. Luffy Secret Rare leader.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '199.95',
      compareAtPrice: '219.95',
      stockQuantity: 8,
      imageUrls: ['/products/op-01.jpg'],
      isFeatured: false,
      sku: 'OP-OP01-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Paramount War [OP-02] Booster Box',
      slug: 'one-piece-op02-paramount-war-booster-box',
      description: 'Paramount War [OP-02] unleashes the chaos of Marineford with Whitebeard, Ace, and the Marine forces. Each booster box contains 24 packs of 12 cards. Features powerful new leader cards and striking parallel art foils.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '189.95',
      compareAtPrice: '209.95',
      stockQuantity: 10,
      imageUrls: ['/products/op-02.jpg'],
      isFeatured: false,
      sku: 'OP-OP02-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Pillars of Strength [OP-03] Booster Box',
      slug: 'one-piece-op03-pillars-of-strength-booster-box',
      description: 'Pillars of Strength [OP-03] focuses on the powerhouses of the One Piece world. Each booster box contains 24 packs of 12 cards. Features Kaido, Big Mom, and their powerful crews with devastating new mechanics.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '169.95',
      compareAtPrice: '189.95',
      stockQuantity: 14,
      imageUrls: ['/products/op-03.jpg'],
      isFeatured: false,
      sku: 'OP-OP03-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Kingdoms of Intrigue [OP-04] Booster Box',
      slug: 'one-piece-op04-kingdoms-of-intrigue-booster-box',
      description: 'Kingdoms of Intrigue [OP-04] features powerful new leaders from the Wano Country arc including Kaido and Yamato. Each booster box contains 24 packs of 12 cards. Chase the rare Secret Rare cards and full art leaders.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '149.95',
      compareAtPrice: '169.95',
      stockQuantity: 30,
      imageUrls: ['/products/op-04.jpg'],
      isFeatured: true,
      sku: 'OP-OP04-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Awakening of the New Era [OP-05] Booster Box',
      slug: 'one-piece-op05-awakening-of-the-new-era-booster-box',
      description: 'Awakening of the New Era [OP-05] introduces characters from the Egghead Island arc including Dr. Vegapunk and the Seraphim. Each booster box contains 24 packs of 12 cards. Pull the iconic Nika Luffy Secret Rare.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '159.95',
      compareAtPrice: null,
      stockQuantity: 18,
      imageUrls: ['/products/op-05.jpg'],
      isFeatured: true,
      sku: 'OP-OP05-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Wings of the Captain [OP-06] Booster Box',
      slug: 'one-piece-op06-wings-of-the-captain-booster-box',
      description: 'Wings of the Captain [OP-06] focuses on the Straw Hat Pirates and their powerful allies. Each booster box contains 24 packs of 12 cards. Features new leader cards including Monkey D. Luffy and crew members across all factions.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '154.95',
      compareAtPrice: '179.95',
      stockQuantity: 12,
      imageUrls: ['/products/op-06.jpg'],
      isFeatured: false,
      sku: 'OP-OP06-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - 500 Years in the Future [OP-07] Booster Box',
      slug: 'one-piece-op07-500-years-future-booster-box',
      description: '500 Years in the Future [OP-07] delves into the mysteries of the Void Century. Each booster box contains 24 packs of 12 cards. Features powerful new cards with never-before-seen mechanics and stunning artwork.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '164.95',
      compareAtPrice: null,
      stockQuantity: 5,
      imageUrls: ['/products/op-07.jpg'],
      isFeatured: true,
      sku: 'OP-OP07-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Two Legends [OP-08] Booster Box',
      slug: 'one-piece-op08-two-legends-booster-box',
      description: 'Two Legends [OP-08] pits the greatest pirate legends against each other. Each booster box contains 24 packs of 12 cards. Features Roger and Whitebeard in breathtaking new artwork with powerful game mechanics.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '169.95',
      compareAtPrice: '189.95',
      stockQuantity: 20,
      imageUrls: ['/products/op-08.jpg'],
      isFeatured: false,
      sku: 'OP-OP08-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Emperors in the New World [OP-09] Booster Box',
      slug: 'one-piece-op09-emperors-new-world-booster-box',
      description: 'Emperors in the New World [OP-09] showcases the Four Emperors ruling the seas. Each booster box contains 24 packs of 12 cards. Features Yonko-focused deck strategies and spectacular Secret Rare pulls.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '174.95',
      compareAtPrice: null,
      stockQuantity: 15,
      imageUrls: ['/products/op-09.jpg'],
      isFeatured: false,
      sku: 'OP-OP09-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Royal Blood [OP-10] Booster Box',
      slug: 'one-piece-op10-royal-blood-booster-box',
      description: 'Royal Blood [OP-10] explores the noble bloodlines and royal families of the One Piece world. Each booster box contains 24 packs of 12 cards. New powerful Don!! mechanics and stunning throne room artwork.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '179.95',
      compareAtPrice: '199.95',
      stockQuantity: 22,
      imageUrls: ['/products/op-10.jpg'],
      isFeatured: true,
      sku: 'OP-OP10-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - A Fist of Divine Speed [OP-11] Booster Box',
      slug: 'one-piece-op11-fist-divine-speed-booster-box',
      description: 'A Fist of Divine Speed [OP-11] features the fastest and most powerful warriors of the Grand Line. Each booster box contains 24 packs of 12 cards. Chase the incredible Special Art and Secret Rare cards.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '184.95',
      compareAtPrice: null,
      stockQuantity: 16,
      imageUrls: ['/products/op-11.jpg'],
      isFeatured: false,
      sku: 'OP-OP11-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Legacy of the Master [OP-12] Booster Box',
      slug: 'one-piece-op12-legacy-master-booster-box',
      description: 'Legacy of the Master [OP-12] honours the teacher-student bonds that shape the greatest pirates. Each booster box contains 24 packs of 12 cards. Featuring legendary master-student duos in epic artwork.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '189.95',
      compareAtPrice: '209.95',
      stockQuantity: 10,
      imageUrls: ['/products/op-12.jpg'],
      isFeatured: false,
      sku: 'OP-OP12-BB-001',
      categoryId: onePieceCategory.id,
    },
    {
      name: 'One Piece Card Game - Carrying On His Will [OP-13] Booster Box',
      slug: 'one-piece-op13-carrying-on-his-will-booster-box',
      description: 'Carrying On His Will [OP-13] celebrates the inherited will that drives the greatest pirates forward. Each booster box contains 24 packs of 12 cards. A landmark anniversary set with breathtaking art commemorating the Three Brothers.',
      brand: Brand.ONE_PIECE,
      productType: ProductType.BOOSTER_BOX,
      price: '199.95',
      compareAtPrice: null,
      stockQuantity: 25,
      imageUrls: ['/products/op-13.jpg'],
      isFeatured: true,
      sku: 'OP-OP13-BB-001',
      categoryId: onePieceCategory.id,
    },
  ];

  const allProducts = [...pokemonProducts, ...onePieceProducts];

  for (const product of allProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        imageUrls: product.imageUrls,
        stockQuantity: product.stockQuantity,
        price: product.price as any,
        compareAtPrice: product.compareAtPrice as any,
        isFeatured: product.isFeatured,
      },
      create: {
        ...product,
        price: product.price as any,
        compareAtPrice: product.compareAtPrice as any,
      },
    });
  }

  console.log(`✅ Seeded ${allProducts.length} products (${pokemonProducts.length} Pokémon + ${onePieceProducts.length} One Piece)`);
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
