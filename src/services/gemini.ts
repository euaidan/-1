export async function getBattleCommentary(heroName: string, monsterName: string, won: boolean) {
  return won ? "一场属于英雄的辉煌胜利！" : "黑暗暂时笼罩了大地...";
}

export async function getHeroLore(heroName: string, rarity: string) {
  return "一位身份不明的战士，注定要成就非凡。";
}
