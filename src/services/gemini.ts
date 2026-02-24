import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getBattleCommentary(heroName: string, monsterName: string, won: boolean) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一位传奇的奇幻游戏战斗解说员。
      英雄 ${heroName} 刚刚与怪物 ${monsterName} 进行了一场激战。
      结果是 ${won ? '胜利' : '败北'}。
      请提供一段简短、史诗感十足的单句中文评论。你可以结合一些奇幻文学或神话中的梗。`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return won ? "一场属于英雄的辉煌胜利！" : "黑暗暂时笼罩了大地...";
  }
}

export async function getHeroLore(heroName: string, rarity: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `为一位名为 ${heroName} 的 ${rarity} 等级奇幻RPG英雄写一段两句左右的神秘背景故事（中文）。
      你可以参考一些网络上流行的奇幻设定。`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "一位身份不明的战士，注定要成就非凡。";
  }
}
