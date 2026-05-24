export const HEALTH_IMPROVEMENTS = [
  { title: 'Пульс нормализуется', description: 'Частота сердечных сокращений начинает снижаться', timeRequired: 0.33 },
  { title: 'Уровень CO в норме', description: 'Уровень угарного газа в крови возвращается к норме', timeRequired: 12 },
  { title: 'Кровообращение улучшается', description: 'Циркуляция крови начинает улучшаться', timeRequired: 48 },
  { title: 'Вкус и обоняние', description: 'Нервные окончания восстанавливаются', timeRequired: 72 },
  { title: 'Дыхание легче', description: 'Бронхи расслабляются, объём лёгких растёт', timeRequired: 336 },
  { title: 'Энергия растёт', description: 'Общая выносливость и энергия заметно возрастают', timeRequired: 720 },
  { title: 'Кашель уходит', description: 'Кашель курильщика значительно уменьшается', timeRequired: 2160 },
  { title: 'Риск ИБС -50%', description: 'Риск ишемической болезни сердца снижается вдвое', timeRequired: 8760 },
  { title: 'Риск рака лёгких -50%', description: 'Риск рака лёгких снижается наполовину', timeRequired: 87600 },
] as const;

export const MAX_CRAVING_LEVEL = 10;
export const MAX_MOOD_LEVEL = 5;
