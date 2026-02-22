import type { ViralCategory } from "./types";

export const VIRAL_CATEGORIES: Record<string, ViralCategory> = {
  brainTeaser: { id: "brainTeaser", icon: "🧩", labelKey: "viral.category.brainTeaser" },
  aiIdentity: { id: "aiIdentity", icon: "🤖", labelKey: "viral.category.aiIdentity" },
  creative: { id: "creative", icon: "✍️", labelKey: "viral.category.creative" },
  coding: { id: "coding", icon: "💻", labelKey: "viral.category.coding" },
  advice: { id: "advice", icon: "🎯", labelKey: "viral.category.advice" },
  knowledge: { id: "knowledge", icon: "📚", labelKey: "viral.category.knowledge" },
  hotTake: { id: "hotTake", icon: "⚖️", labelKey: "viral.category.hotTake" },
  fun: { id: "fun", icon: "🎭", labelKey: "viral.category.fun" },
};
