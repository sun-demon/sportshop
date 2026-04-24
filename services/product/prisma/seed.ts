import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  // ── Футбол ─────────────────────────────────────────────────────
  {
    name: 'Футбольный мяч Adidas Tiro League',
    description: 'Официальный тренировочный мяч FIFA. Термосклеенные панели, устойчивость к влаге.',
    price: 2490,
    stock: 45,
    category: 'Футбол',
    imageUrl: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=400',
  },
  {
    name: 'Бутсы Nike Phantom GX',
    description: 'Профессиональные бутсы для натурального газона. Верх Gripknit для точного контакта.',
    price: 12990,
    stock: 18,
    category: 'Футбол',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  },
  {
    name: 'Футбольная форма сборной России',
    description: 'Реплика домашней формы. Технология Dri-FIT, быстрое высыхание.',
    price: 4990,
    stock: 30,
    category: 'Футбол',
    imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400',
  },
  {
    name: 'Вратарские перчатки Reusch Attrakt',
    description: 'Профессиональный уровень. Пена G:Grip для максимального сцепления в любую погоду.',
    price: 5490,
    stock: 12,
    category: 'Футбол',
    imageUrl: null,
  },

  // ── Бег ────────────────────────────────────────────────────────
  {
    name: 'Кроссовки Nike Air Zoom Pegasus 40',
    description: 'Универсальные беговые кроссовки. Подошва React + воздушный мешок Zoom Air.',
    price: 11990,
    stock: 25,
    category: 'Бег',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
  },
  {
    name: 'Беговые шорты Asics Silver',
    description: 'Лёгкие и дышащие шорты для бега. Встроенная сетчатая подкладка.',
    price: 1990,
    stock: 50,
    category: 'Бег',
    imageUrl: null,
  },
  {
    name: 'Спортивные часы Garmin Forerunner 265',
    description: 'GPS-часы для бегунов. AMOLED-дисплей, мониторинг ЧСС, VO2max, план тренировок.',
    price: 34990,
    stock: 8,
    category: 'Бег',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  },
  {
    name: 'Компрессионные гольфы CEP Run',
    description: 'Улучшают кровообращение и снижают усталость мышц. Степень компрессии 20–30 мм рт. ст.',
    price: 2990,
    stock: 40,
    category: 'Бег',
    imageUrl: null,
  },

  // ── Тренажёрный зал ────────────────────────────────────────────
  {
    name: 'Гантели разборные Reebok 2–24 кг',
    description: 'Набор регулируемых гантелей. Заменяют 8 пар стандартных. Удобный замок-поворот.',
    price: 18990,
    stock: 10,
    category: 'Тренажёрный зал',
    imageUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400',
  },
  {
    name: 'Штанга олимпийская 20 кг',
    description: 'Олимпийский гриф 2200 мм, диаметр 50 мм. Хромированные втулки, вращение 360°.',
    price: 14990,
    stock: 5,
    category: 'Тренажёрный зал',
    imageUrl: null,
  },
  {
    name: 'Атлетический пояс Harbinger',
    description: 'Кожаный пояс 10 см для тяжёлых подъёмов. Поддержка поясницы, металлическая пряжка.',
    price: 3490,
    stock: 20,
    category: 'Тренажёрный зал',
    imageUrl: null,
  },
  {
    name: 'Коврик для йоги и фитнеса 6 мм',
    description: 'TPE-материал, антискользящий, экологичный. Размер 183×61 см. С ремнём для переноски.',
    price: 1490,
    stock: 60,
    category: 'Тренажёрный зал',
    imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400',
  },

  // ── Плавание ───────────────────────────────────────────────────
  {
    name: 'Очки для плавания Speedo Fastskin',
    description: 'Соревновательные очки. Низкопрофильная оправа, линзы с зеркальным покрытием.',
    price: 3990,
    stock: 35,
    category: 'Плавание',
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400',
  },
  {
    name: 'Плавательная шапочка TYR Silicone',
    description: 'Силиконовая шапочка. Не тянет волосы, плотно прилегает. Универсальный размер.',
    price: 890,
    stock: 70,
    category: 'Плавание',
    imageUrl: null,
  },
  {
    name: 'Плавки Arena Powerskin ST Next',
    description: 'Соревновательные плавки с компрессионным эффектом. Ткань Powerskin.',
    price: 5990,
    stock: 15,
    category: 'Плавание',
    imageUrl: null,
  },

  // ── Велоспорт ──────────────────────────────────────────────────
  {
    name: 'Велошлем Giro Syntax MIPS',
    description: 'Шлем с защитой MIPS. Система Roc Loc 5 Air для идеальной посадки. 25 каналов вентиляции.',
    price: 8990,
    stock: 12,
    category: 'Велоспорт',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
  {
    name: 'Велоперчатки Castelli Arenberg',
    description: 'Перчатки для шоссейного велоспорта. Ладонь из кожи Clarino, гель в зонах давления.',
    price: 2490,
    stock: 28,
    category: 'Велоспорт',
    imageUrl: null,
  },
  {
    name: 'Велокомпьютер Wahoo ELEMNT Bolt',
    description: 'GPS-компьютер с цветным AMOLED-дисплеем. Совместим со Strava, Garmin, Wahoo.',
    price: 22990,
    stock: 6,
    category: 'Велоспорт',
    imageUrl: null,
  },
];

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Очищаем таблицу перед заполнением
  await prisma.product.deleteMany();
  console.log('🗑  Старые товары удалены');

  const created = await prisma.product.createMany({ data: products });
  console.log(`✅ Добавлено ${created.count} товаров`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
