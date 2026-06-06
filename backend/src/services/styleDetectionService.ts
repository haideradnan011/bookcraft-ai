/**
 * Style Detection Service
 * Advanced AI-like style detection and matching
 */

export type WritingStyle =
  | 'philosophical'
  | 'academic'
  | 'literary'
  | 'novel'
  | 'reflective'
  | 'minimal'

export interface StyleProfile {
  style: WritingStyle
  confidence: number // 0-100
  indicators: string[]
  metrics: {
    sentenceAveragelength: number
    paragraphAverageLength: number
    vocabularyComplexity: number
    emotionalDensity: number
    narrationPace: number
  }
}

export class StyleDetectionService {
  /**
   * Comprehensive style detection
   */
  static detectStyle(text: string): StyleProfile {
    const metrics = this.analyzeTextMetrics(text)
    const vocabulary = this.analyzeVocabulary(text)
    const themes = this.detectThemes(text)
    const structure = this.analyzeStructure(text)

    return this.classifyStyle(metrics, vocabulary, themes, structure, text)
  }

  /**
   * Analyze text metrics
   */
  private static analyzeTextMetrics(text: string) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
    const words = text.split(/\s+/).filter(w => w.length > 0)

    const avgSentenceLength = words.length / Math.max(sentences.length, 1)
    const avgParagraphLength = words.length / Math.max(paragraphs.length, 1)
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length

    return {
      totalWords: words.length,
      totalSentences: sentences.length,
      totalParagraphs: paragraphs.length,
      avgSentenceLength,
      avgParagraphLength,
      avgWordLength,
      sentenceVariance: this.calculateVariance(
        sentences.map(s => s.split(/\s+/).length)
      ),
      paragraphVariance: this.calculateVariance(
        paragraphs.map(p => p.split(/\s+/).length)
      )
    }
  }

  /**
   * Analyze vocabulary and word patterns
   */
  private static analyzeVocabulary(text: string) {
    const words = text.split(/\s+/).filter(w => w.length > 2)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()))

    const vocabularyDiversity = uniqueWords.size / words.length
    const longWords = words.filter(w => w.length > 8).length / words.length

    // Emotional words
    const emotionalKeywords = [
      'يشعر',
      'حب',
      'كره',
      'جميل',
      'قبيح',
      'فرح',
      'حزن',
      'خوف',
      'أمل',
      'يألم',
      'يعاني'
    ]
    const emotionalCount = words.filter(w =>
      emotionalKeywords.some(k => w.includes(k))
    ).length

    return {
      vocabularyDiversity,
      longWords,
      emotionalDensity: emotionalCount / words.length,
      uniqueWordRatio: uniqueWords.size
    }
  }

  /**
   * Detect themes and topics
   */
  private static detectThemes(text: string) {
    const themes = {
      philosophical: [
        'فلسفة',
        'حقيقة',
        'معنى',
        'وجود',
        'جوهر',
        'نظرية',
        'مبدأ',
        'فكرة',
        'نفسية',
        'عقل'
      ],
      academic: [
        'بحث',
        'دراسة',
        'تحليل',
        'نتيجة',
        'استنتاج',
        'فرضية',
        'دليل',
        'معادلة',
        'نسبة',
        'تجربة'
      ],
      literary: [
        'شعر',
        'قصة',
        'رواية',
        'خيال',
        'تصوير',
        'رمز',
        'استعارة',
        'جمال',
        'أسلوب',
        'فن'
      ],
      novel: [
        'شخصية',
        'حوار',
        'أحداث',
        'سرد',
        'قصة',
        'بطل',
        'صراع',
        'حل',
        'مؤامرة',
        'درامي'
      ],
      reflective: [
        'تأمل',
        'تفكير',
        'حكمة',
        'درس',
        'عبرة',
        'تذكر',
        'ذكرى',
        'فهم',
        'إدراك',
        'وعي'
      ]
    }

    const scores: Record<string, number> = {}

    for (const [style, keywords] of Object.entries(themes)) {
      const lowerText = text.toLowerCase()
      const count = keywords.filter(k => lowerText.includes(k)).length
      scores[style] = count
    }

    return scores
  }

  /**
   * Analyze text structure
   */
  private static analyzeStructure(text: string) {
    const lines = text.split('\n')
    const hasHeadings = lines.filter(l => l.match(/^#+\s|^[A-Z]+\s/)).length
    const hasDialogue = text.match(/"[^"]*"|\«[^»]*»/g)?.length || 0
    const hasQuotes = text.match(/قال|يقول|قالت/g)?.length || 0
    const paragraphs = text.split(/\n\n+/).length

    return {
      hasHeadings: hasHeadings > 0,
      dialoguePercentage: hasDialogue / Math.max(lines.length, 1),
      quotePercentage: hasQuotes / Math.max(lines.length, 1),
      paragraphCount: paragraphs,
      hasStructure: hasHeadings > 0
    }
  }

  /**
   * Classify style based on analysis
   */
  private static classifyStyle(
    metrics: any,
    vocabulary: any,
    themes: Record<string, number>,
    structure: any,
    text: string
  ): StyleProfile {
    const scores: Record<WritingStyle, number> = {
      philosophical: 0,
      academic: 0,
      literary: 0,
      novel: 0,
      reflective: 0,
      minimal: 0
    }

    // Theme-based scoring
    Object.entries(themes).forEach(([style, count]: [string, any]) => {
      if (style in scores) {
        scores[style as WritingStyle] += count * 2
      }
    })

    // Metrics-based scoring
    if (metrics.avgSentenceLength > 20) {
      scores.philosophical += 10
      scores.academic += 5
    }
    if (metrics.avgSentenceLength < 12) {
      scores.novel += 10
      scores.minimal += 5
    }

    if (vocabulary.emotionalDensity > 0.15) {
      scores.literary += 15
      scores.reflective += 10
    }

    if (metrics.sentenceVariance > 50) {
      scores.literary += 10
      scores.novel += 5
    }

    if (metrics.sentenceVariance < 20) {
      scores.academic += 10
      scores.minimal += 5
    }

    // Structure-based scoring
    if (structure.dialoguePercentage > 0.1) {
      scores.novel += 15
    }
    if (structure.hasHeadings) {
      scores.academic += 10
    }

    if (structure.paragraphCount > 50) {
      scores.novel += 5
    }
    if (structure.paragraphCount < 10) {
      scores.reflective += 10
    }

    // Find top style
    const topStyle = Object.entries(scores).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0] as WritingStyle

    const maxScore = Math.max(...Object.values(scores))
    const confidence = Math.min(
      100,
      (maxScore / (Object.keys(scores).length * 10)) * 100
    )

    return {
      style: topStyle,
      confidence: Math.round(confidence),
      indicators: this.getIndicators(topStyle, text),
      metrics: {
        sentenceAveragelength: metrics.avgSentenceLength,
        paragraphAverageLength: metrics.avgParagraphLength,
        vocabularyComplexity: vocabulary.vocabularyDiversity,
        emotionalDensity: vocabulary.emotionalDensity,
        narrationPace: 1 / metrics.avgParagraphLength
      }
    }
  }

  /**
   * Get specific indicators for detected style
   */
  private static getIndicators(style: WritingStyle, text: string): string[] {
    const indicators: string[] = []

    const lowerText = text.toLowerCase()

    switch (style) {
      case 'philosophical':
        if (lowerText.includes('فلسفة') || lowerText.includes('حقيقة')) {
          indicators.push('مواضيع فلسفية')
        }
        indicators.push('جمل طويلة ومعقدة')
        break

      case 'academic':
        if (lowerText.includes('بحث') || lowerText.includes('دراسة')) {
          indicators.push('لغة أكاديمية')
        }
        indicators.push('هيكل منظم')
        break

      case 'literary':
        indicators.push('لغة أدبية عالية')
        indicators.push('استخدام الاستعارات والرموز')
        if (lowerText.match(/جميل|خيال|فن/)) {
          indicators.push('مواضيع فنية')
        }
        break

      case 'novel':
        indicators.push('سرد قصصي')
        if (text.match(/"[^"]*"|«[^»]*»/)) {
          indicators.push('حوارات')
        }
        indicators.push('تطور أحداث')
        break

      case 'reflective':
        indicators.push('نص تأملي')
        indicators.push('فقرات قصيرة وموحية')
        if (lowerText.match(/حكمة|درس|عبرة/)) {
          indicators.push('دروس وحكم')
        }
        break

      case 'minimal':
        indicators.push('أسلوب بسيط وواضح')
        indicators.push('جمل قصيرة')
        break
    }

    return indicators
  }

  /**
   * Calculate variance of an array
   */
  private static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  /**
   * Get recommendations based on style
   */
  static getStyleRecommendations(style: WritingStyle): {
    fontSize: number
    lineHeight: number
    margin: { top: number; right: number; bottom: number; left: number }
    spacing: number
  } {
    const recommendations: Record<
      WritingStyle,
      {
        fontSize: number
        lineHeight: number
        margin: { top: number; right: number; bottom: number; left: number }
        spacing: number
      }
    > = {
      philosophical: {
        fontSize: 13,
        lineHeight: 2.2,
        margin: { top: 30, right: 30, bottom: 30, left: 30 },
        spacing: 40
      },
      academic: {
        fontSize: 12,
        lineHeight: 1.5,
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        spacing: 20
      },
      literary: {
        fontSize: 15,
        lineHeight: 1.9,
        margin: { top: 25, right: 25, bottom: 25, left: 25 },
        spacing: 30
      },
      novel: {
        fontSize: 14,
        lineHeight: 1.8,
        margin: { top: 25, right: 25, bottom: 25, left: 25 },
        spacing: 25
      },
      reflective: {
        fontSize: 13,
        lineHeight: 2.0,
        margin: { top: 35, right: 35, bottom: 35, left: 35 },
        spacing: 50
      },
      minimal: {
        fontSize: 14,
        lineHeight: 1.8,
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        spacing: 20
      }
    }

    return recommendations[style]
  }
}
