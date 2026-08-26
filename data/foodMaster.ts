// data/foodMaster.ts

/**
 * 食品カテゴリー
 */
export type FoodCategory =
  | "rice"
  | "bread"
  | "noodle"
  | "meat"
  | "fish"
  | "egg"
  | "dairy"
  | "vegetable"
  | "fruit"
  | "soy"
  | "drink"
  | "supplement"
  | "other";

/**
 * 食品マスター1件分
 *
 * calories / protein / fat / carbohydrate は
 * baseAmount あたりの栄養価
 */
export type FoodMasterItem = {
  id: string;

  /**
   * 食品名
   */
  name: string;

  /**
   * 食品カテゴリー
   */
  category: FoodCategory;

  /**
   * 栄養価計算の基準量
   *
   * 基本は100g
   * 卵などは1個単位でもOK
   */
  baseAmount: number;

  /**
   * 単位
   *
   * g / ml / 個 / 枚 など
   */
  unit: string;

  /**
   * 基準量あたりのカロリー
   */
  calories: number;

  /**
   * 基準量あたりのタンパク質
   */
  protein: number;

  /**
   * 基準量あたりの脂質
   */
  fat: number;

  /**
   * 基準量あたりの炭水化物
   */
  carbohydrate: number;

  /**
   * 初期入力値
   *
   * 食品選択時に最初から表示する量
   */
  defaultAmount?: number;
};

/**
 * 食品カテゴリー表示名
 */
export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  rice: "ご飯・穀類",
  bread: "パン",
  noodle: "麺類",
  meat: "肉類",
  fish: "魚介類",
  egg: "卵",
  dairy: "乳製品",
  vegetable: "野菜",
  fruit: "果物",
  soy: "大豆製品",
  drink: "飲み物",
  supplement: "サプリ・プロテイン",
  other: "その他",
};

/**
 * 食品マスター
 */
export const FOOD_MASTER: FoodMasterItem[] = [
  // ==============================
  // ご飯・穀類
  // ==============================
  {
    id: "white-rice",
    name: "白米",
    category: "rice",
    baseAmount: 100,
    unit: "g",
    calories: 156,
    protein: 2.5,
    fat: 0.3,
    carbohydrate: 37.1,
    defaultAmount: 150,
  },
  {
    id: "brown-rice",
    name: "玄米",
    category: "rice",
    baseAmount: 100,
    unit: "g",
    calories: 152,
    protein: 2.8,
    fat: 1,
    carbohydrate: 35.6,
    defaultAmount: 150,
  },
  {
    id: "oatmeal",
    name: "オートミール",
    category: "rice",
    baseAmount: 100,
    unit: "g",
    calories: 350,
    protein: 13.7,
    fat: 5.7,
    carbohydrate: 69.1,
    defaultAmount: 30,
  },

  // ==============================
  // パン
  // ==============================
  {
    id: "white-bread",
    name: "食パン",
    category: "bread",
    baseAmount: 100,
    unit: "g",
    calories: 248,
    protein: 8.9,
    fat: 4.1,
    carbohydrate: 46.4,
    defaultAmount: 60,
  },
  {
    id: "bread-roll",
    name: "ロールパン",
    category: "bread",
    baseAmount: 100,
    unit: "g",
    calories: 309,
    protein: 10.1,
    fat: 9,
    carbohydrate: 48.6,
    defaultAmount: 30,
  },

  // ==============================
  // 麺類
  // ==============================
  {
    id: "udon-boiled",
    name: "うどん",
    category: "noodle",
    baseAmount: 100,
    unit: "g",
    calories: 95,
    protein: 2.6,
    fat: 0.4,
    carbohydrate: 21.6,
    defaultAmount: 200,
  },
  {
    id: "soba-boiled",
    name: "そば",
    category: "noodle",
    baseAmount: 100,
    unit: "g",
    calories: 130,
    protein: 4.8,
    fat: 1,
    carbohydrate: 26,
    defaultAmount: 200,
  },
  {
    id: "pasta-boiled",
    name: "パスタ",
    category: "noodle",
    baseAmount: 100,
    unit: "g",
    calories: 150,
    protein: 5.8,
    fat: 0.9,
    carbohydrate: 32.2,
    defaultAmount: 200,
  },

  // ==============================
  // 肉類
  // ==============================
  {
    id: "chicken-breast-skinless",
    name: "鶏むね肉（皮なし）",
    category: "meat",
    baseAmount: 100,
    unit: "g",
    calories: 105,
    protein: 23.3,
    fat: 1.9,
    carbohydrate: 0.1,
    defaultAmount: 150,
  },
  {
    id: "chicken-thigh-skinless",
    name: "鶏もも肉（皮なし）",
    category: "meat",
    baseAmount: 100,
    unit: "g",
    calories: 113,
    protein: 19,
    fat: 5,
    carbohydrate: 0,
    defaultAmount: 150,
  },
  {
    id: "pork-loin",
    name: "豚ロース",
    category: "meat",
    baseAmount: 100,
    unit: "g",
    calories: 248,
    protein: 19.3,
    fat: 19.2,
    carbohydrate: 0.2,
    defaultAmount: 100,
  },
  {
    id: "pork-tenderloin",
    name: "豚ヒレ肉",
    category: "meat",
    baseAmount: 100,
    unit: "g",
    calories: 118,
    protein: 22.2,
    fat: 3.7,
    carbohydrate: 0.2,
    defaultAmount: 100,
  },
  {
    id: "beef-round",
    name: "牛もも肉",
    category: "meat",
    baseAmount: 100,
    unit: "g",
    calories: 182,
    protein: 21.2,
    fat: 10.7,
    carbohydrate: 0.5,
    defaultAmount: 100,
  },

  // ==============================
  // 魚介類
  // ==============================
  {
    id: "salmon",
    name: "鮭",
    category: "fish",
    baseAmount: 100,
    unit: "g",
    calories: 124,
    protein: 22.3,
    fat: 4.1,
    carbohydrate: 0.1,
    defaultAmount: 100,
  },
  {
    id: "tuna-red",
    name: "まぐろ赤身",
    category: "fish",
    baseAmount: 100,
    unit: "g",
    calories: 115,
    protein: 26.4,
    fat: 1.4,
    carbohydrate: 0.1,
    defaultAmount: 100,
  },
  {
    id: "mackerel",
    name: "さば",
    category: "fish",
    baseAmount: 100,
    unit: "g",
    calories: 211,
    protein: 20.6,
    fat: 16.8,
    carbohydrate: 0.3,
    defaultAmount: 100,
  },

  // ==============================
  // 卵
  // ==============================
  {
    id: "egg",
    name: "卵",
    category: "egg",
    baseAmount: 1,
    unit: "個",
    calories: 71,
    protein: 6.1,
    fat: 5.1,
    carbohydrate: 0.2,
    defaultAmount: 1,
  },

  // ==============================
  // 乳製品
  // ==============================
  {
    id: "milk",
    name: "牛乳",
    category: "dairy",
    baseAmount: 100,
    unit: "ml",
    calories: 61,
    protein: 3.3,
    fat: 3.8,
    carbohydrate: 4.8,
    defaultAmount: 200,
  },
  {
    id: "low-fat-milk",
    name: "低脂肪乳",
    category: "dairy",
    baseAmount: 100,
    unit: "ml",
    calories: 42,
    protein: 3.8,
    fat: 1,
    carbohydrate: 5.5,
    defaultAmount: 200,
  },
  {
    id: "plain-yogurt",
    name: "プレーンヨーグルト",
    category: "dairy",
    baseAmount: 100,
    unit: "g",
    calories: 56,
    protein: 3.6,
    fat: 3,
    carbohydrate: 4.9,
    defaultAmount: 100,
  },

  // ==============================
  // 野菜
  // ==============================
  {
    id: "broccoli",
    name: "ブロッコリー",
    category: "vegetable",
    baseAmount: 100,
    unit: "g",
    calories: 37,
    protein: 5.4,
    fat: 0.6,
    carbohydrate: 6.6,
    defaultAmount: 100,
  },
  {
    id: "cabbage",
    name: "キャベツ",
    category: "vegetable",
    baseAmount: 100,
    unit: "g",
    calories: 23,
    protein: 1.3,
    fat: 0.2,
    carbohydrate: 5.2,
    defaultAmount: 100,
  },
  {
    id: "lettuce",
    name: "レタス",
    category: "vegetable",
    baseAmount: 100,
    unit: "g",
    calories: 11,
    protein: 0.6,
    fat: 0.1,
    carbohydrate: 2.8,
    defaultAmount: 50,
  },
  {
    id: "tomato",
    name: "トマト",
    category: "vegetable",
    baseAmount: 100,
    unit: "g",
    calories: 20,
    protein: 0.7,
    fat: 0.1,
    carbohydrate: 4.7,
    defaultAmount: 100,
  },

  // ==============================
  // 果物
  // ==============================
  {
    id: "banana",
    name: "バナナ",
    category: "fruit",
    baseAmount: 100,
    unit: "g",
    calories: 93,
    protein: 1.1,
    fat: 0.2,
    carbohydrate: 22.5,
    defaultAmount: 100,
  },
  {
    id: "apple",
    name: "りんご",
    category: "fruit",
    baseAmount: 100,
    unit: "g",
    calories: 53,
    protein: 0.2,
    fat: 0.3,
    carbohydrate: 15.5,
    defaultAmount: 150,
  },

  // ==============================
  // 大豆製品
  // ==============================
  {
    id: "natto",
    name: "納豆",
    category: "soy",
    baseAmount: 100,
    unit: "g",
    calories: 184,
    protein: 16.5,
    fat: 10,
    carbohydrate: 12.1,
    defaultAmount: 45,
  },
  {
    id: "tofu",
    name: "木綿豆腐",
    category: "soy",
    baseAmount: 100,
    unit: "g",
    calories: 73,
    protein: 7,
    fat: 4.9,
    carbohydrate: 1.5,
    defaultAmount: 150,
  },

  // ==============================
  // 飲み物
  // ==============================
  {
    id: "orange-juice",
    name: "オレンジジュース",
    category: "drink",
    baseAmount: 100,
    unit: "ml",
    calories: 45,
    protein: 0.7,
    fat: 0.1,
    carbohydrate: 10.7,
    defaultAmount: 200,
  },

  // ==============================
  // サプリ・プロテイン
  // ==============================
  {
    id: "whey-protein",
    name: "ホエイプロテイン",
    category: "supplement",
    baseAmount: 30,
    unit: "g",
    calories: 120,
    protein: 22,
    fat: 2,
    carbohydrate: 3,
    defaultAmount: 30,
  },
];

/**
 * IDから食品を取得
 */
export function findFoodById(id: string) {
  return FOOD_MASTER.find((food) => food.id === id);
}

/**
 * 食品名から検索
 *
 * 部分一致
 */
export function searchFoods(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return FOOD_MASTER;
  }

  return FOOD_MASTER.filter((food) =>
    food.name.toLowerCase().includes(normalizedKeyword)
  );
}

/**
 * カテゴリー別に食品を取得
 */
export function getFoodsByCategory(category: FoodCategory) {
  return FOOD_MASTER.filter((food) => food.category === category);
}

/**
 * 摂取量に応じて栄養価を計算
 */
export function calculateFoodNutrition(food: FoodMasterItem, amount: number) {
  if (amount <= 0 || food.baseAmount <= 0) {
    return {
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrate: 0,
    };
  }

  const ratio = amount / food.baseAmount;

  return {
    calories: Math.round(food.calories * ratio),
    protein: roundOne(food.protein * ratio),
    fat: roundOne(food.fat * ratio),
    carbohydrate: roundOne(food.carbohydrate * ratio),
  };
}

/**
 * 小数第1位まで丸める
 */
function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}
