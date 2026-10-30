/** 与 SEO isArticle、时间线共用的「算文章」规则。 */

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
 * 是否计入全站文章时间线 / SEO article。
 * 排除各目录 README 与站点根 README。
 */
export function isSiteArticle(filePathRelative: string | null | undefined): boolean {
  if (!filePathRelative) return false
  if (filePathRelative.endsWith('/README.md') || filePathRelative === 'README.md') {
    return false
  }
  return ARTICLE_PREFIXES.some((prefix) => filePathRelative.startsWith(prefix))
}
