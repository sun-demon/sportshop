import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Локальные картинки, которые раздаются product-сервисом */
function localImage(filename: string): string {
  return `/products/assets/products/${filename}`;
}

const products = [
  { name: 'Гантели разборные, комплект 2×20 кг (пара)', description: 'Стальные диски и хромированный гриф для домашних силовых тренировок.', price: 12990, stock: 12, category: 'Сила', imageUrl: localImage('custom/product-01.webp') },
  { name: 'Гиря 16 кг', description: 'Чугунная гиря с матовым покрытием и удобной ручкой.', price: 3490, stock: 25, category: 'Сила', imageUrl: localImage('custom/product-02.jpg') },
  { name: 'Скакалка скоростная (speed rope)', description: 'Подшипники и стальной трос в ПВХ-оплетке для кардио и кроссфита.', price: 1890, stock: 40, category: 'Кардио', imageUrl: localImage('custom/product-03.webp') },
  { name: 'Коврик для йоги, толщина 6 мм', description: 'TPE-материал, нескользящая поверхность, комфорт для занятий дома и в студии.', price: 2490, stock: 30, category: 'Йога', imageUrl: localImage('custom/product-04.jpg') },
  { name: 'Эспандеры, набор 5 шт', description: 'Пять уровней сопротивления для разминки, силовых и реабилитационных упражнений.', price: 990, stock: 50, category: 'Сила', imageUrl: localImage('custom/product-05.jpg') },
  { name: 'Мяч футбольный, размер 5', description: 'Стандартный взрослый размер №5, машинная сшивка, износостойкое покрытие.', price: 4590, stock: 18, category: 'Командные', imageUrl: localImage('custom/product-06.jpg') },
  { name: 'Бутылка спортивная 750 мл', description: 'Tritan без BPA, удобный спортивный клапан, подходит для тренировок и прогулок.', price: 790, stock: 80, category: 'Аксессуары', imageUrl: localImage('custom/product-07.jpg') },
  { name: 'Пояс для тяжёлой атлетики', description: 'Усиленная поддержка поясницы, ширина 10 см, плотная застежка.', price: 4290, stock: 15, category: 'Сила', imageUrl: localImage('custom/product-08.jpg') },
  { name: 'Штанга олимпийская 20 кг', description: 'Гриф 220 см, надежные втулки, расчетная нагрузка до 350 кг.', price: 18990, stock: 6, category: 'Сила', imageUrl: localImage('custom/product-09.webp') },
  { name: 'Велотренажёр магнитный', description: '8 уровней нагрузки, базовый бортовой компьютер и датчики пульса.', price: 24990, stock: 4, category: 'Кардио', imageUrl: localImage('custom/product-10.webp') },
  { name: 'Наколенники волейбольные, размер M (пара)', description: 'Амортизирующие вставки и эластичная фиксация для игровых тренировок.', price: 1190, stock: 35, category: 'Командные', imageUrl: localImage('custom/product-11.jpg') },
  { name: 'Перчатки для зала', description: 'Дышащая сетка, противоскользящая ладонь и фиксация на липучке.', price: 1490, stock: 45, category: 'Аксессуары', imageUrl: localImage('custom/product-12.webp') },
  { name: 'Ролик для пресса', description: 'Широкое колесо и мягкие рукояти для безопасной тренировки кора.', price: 2190, stock: 22, category: 'Функционал', imageUrl: localImage('custom/product-13.jpg') },
  { name: 'Массажный ролл 45 см', description: 'Пена высокой плотности для миофасциального релиза и восстановления мышц.', price: 2790, stock: 20, category: 'Восстановление', imageUrl: localImage('custom/product-14.webp') },
  { name: 'Степ-платформа', description: 'Регулируемая высота и нескользящее покрытие для кардио-тренировок.', price: 3990, stock: 10, category: 'Кардио', imageUrl: localImage('custom/product-15.jpg') },
  { name: 'Медбол 8 кг', description: 'Резиновая поверхность с цепким рельефом для функциональных комплексов.', price: 3290, stock: 14, category: 'Функционал', imageUrl: localImage('custom/product-16.webp') },
  { name: 'Ленты сопротивления, набор', description: '5 уровней сопротивления, крепления в комплекте, удобный чехол.', price: 1790, stock: 28, category: 'Сила', imageUrl: localImage('custom/product-17.jpeg') },
  { name: 'Щит груди для ММА', description: 'Синтетическая кожа, усиленная амортизация для отработки ударов.', price: 6590, stock: 8, category: 'Единоборства', imageUrl: localImage('custom/product-18.webp') },
  { name: 'Боксёрские перчатки 12 oz', description: 'Пена тройной плотности и надежная фиксация на липучке.', price: 4990, stock: 16, category: 'Единоборства', imageUrl: localImage('custom/product-19.webp') },
  { name: 'Турник в дверной проём', description: 'Нагрузка до 120 кг, мягкие неопреновые ручки, быстрый монтаж.', price: 2190, stock: 24, category: 'Сила', imageUrl: localImage('custom/product-20.jpg') },
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
