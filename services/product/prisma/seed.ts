import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Локальные картинки, которые раздаются product-сервисом */
function localImage(filename: string): string {
  return `/products/assets/products/${filename}`;
}

const products = [
  { name: 'Гантели разборные, комплект 2×20 кг (пара)', description: 'Стальные диски и хромированный гриф для домашних силовых тренировок.', price: 12990, stock: 12, category: 'Сила', imageUrl: localImage('product-01.png') },
  { name: 'Гиря 16 кг', description: 'Чугунная гиря с матовым покрытием и удобной ручкой.', price: 3490, stock: 25, category: 'Сила', imageUrl: localImage('product-02.png') },
  { name: 'Скакалка скоростная (speed rope)', description: 'Подшипники и стальной трос в ПВХ-оплетке для кардио и кроссфита.', price: 1890, stock: 40, category: 'Кардио', imageUrl: localImage('product-03.png') },
  { name: 'Коврик для йоги, толщина 6 мм', description: 'TPE-материал, нескользящая поверхность, комфорт для занятий дома и в студии.', price: 2490, stock: 30, category: 'Йога', imageUrl: localImage('product-04.png') },
  { name: 'Эспандеры, набор 5 шт', description: 'Пять уровней сопротивления для разминки, силовых и реабилитационных упражнений.', price: 990, stock: 50, category: 'Сила', imageUrl: localImage('product-05.png') },
  { name: 'Мяч футбольный, размер 5', description: 'Стандартный взрослый размер №5, машинная сшивка, износостойкое покрытие.', price: 4590, stock: 18, category: 'Командные', imageUrl: localImage('product-06.png') },
  { name: 'Бутылка спортивная 750 мл', description: 'Tritan без BPA, удобный спортивный клапан, подходит для тренировок и прогулок.', price: 790, stock: 80, category: 'Аксессуары', imageUrl: localImage('product-07.png') },
  { name: 'Пояс для тяжёлой атлетики', description: 'Усиленная поддержка поясницы, ширина 10 см, плотная застежка.', price: 4290, stock: 15, category: 'Сила', imageUrl: localImage('product-08.png') },
  { name: 'Штанга олимпийская 20 кг', description: 'Гриф 220 см, надежные втулки, расчетная нагрузка до 350 кг.', price: 18990, stock: 6, category: 'Сила', imageUrl: localImage('product-09.png') },
  { name: 'Велотренажёр магнитный', description: '8 уровней нагрузки, базовый бортовой компьютер и датчики пульса.', price: 24990, stock: 4, category: 'Кардио', imageUrl: localImage('product-10.png') },
  { name: 'Наколенники волейбольные, размер M (пара)', description: 'Амортизирующие вставки и эластичная фиксация для игровых тренировок.', price: 1190, stock: 35, category: 'Командные', imageUrl: localImage('product-11.png') },
  { name: 'Перчатки для зала', description: 'Дышащая сетка, противоскользящая ладонь и фиксация на липучке.', price: 1490, stock: 45, category: 'Аксессуары', imageUrl: localImage('product-12.png') },
  { name: 'Ролик для пресса', description: 'Широкое колесо и мягкие рукояти для безопасной тренировки кора.', price: 2190, stock: 22, category: 'Функционал', imageUrl: localImage('product-13.png') },
  { name: 'Массажный ролл 45 см', description: 'Пена высокой плотности для миофасциального релиза и восстановления мышц.', price: 2790, stock: 20, category: 'Восстановление', imageUrl: localImage('product-14.png') },
  { name: 'Степ-платформа', description: 'Регулируемая высота и нескользящее покрытие для кардио-тренировок.', price: 3990, stock: 10, category: 'Кардио', imageUrl: localImage('product-15.png') },
  { name: 'Медбол 8 кг', description: 'Резиновая поверхность с цепким рельефом для функциональных комплексов.', price: 3290, stock: 14, category: 'Функционал', imageUrl: localImage('product-16.png') },
  { name: 'Ленты сопротивления, набор', description: '5 уровней сопротивления, крепления в комплекте, удобный чехол.', price: 1790, stock: 28, category: 'Сила', imageUrl: localImage('product-17.png') },
  { name: 'Щит груди для ММА', description: 'Синтетическая кожа, усиленная амортизация для отработки ударов.', price: 6590, stock: 8, category: 'Единоборства', imageUrl: localImage('product-18.png') },
  { name: 'Боксёрские перчатки 12 oz', description: 'Пена тройной плотности и надежная фиксация на липучке.', price: 4990, stock: 16, category: 'Единоборства', imageUrl: localImage('product-19.png') },
  { name: 'Турник в дверной проём', description: 'Нагрузка до 120 кг, мягкие неопреновые ручки, быстрый монтаж.', price: 2190, stock: 24, category: 'Сила', imageUrl: localImage('product-20.png') },
];

async function main() {
  await prisma.product.deleteMany();
  await prisma.product.createMany({ data: products });
  // eslint-disable-next-line no-console
  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
