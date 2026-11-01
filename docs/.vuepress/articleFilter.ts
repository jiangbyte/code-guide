/** 与 SEO isArticle、Blog 文章过滤共用的「算文章」规则。 */

const ARTICLE_PREFIXES = [
  'posts/',
  'projects/',
  'source-reading/',
  'kaoyan/',
  'soft-exam/',
  'database/',
  'career/',
] as const

/**
 * 是否计入 Blog / SEO article。
 * 排除各目录 README 与站点根 README。
 */
export function isSiteArticle(filePathRelative: string | null | undefined): boolean {
  if (!filePathRelative) return false
  if (filePathRelative.endsWith('/README.md') || filePathRelative === 'README.md') {
    return false
  }
  return ARTICLE_PREFIXES.some((prefix) => filePathRelative.startsWith(prefix))
}
