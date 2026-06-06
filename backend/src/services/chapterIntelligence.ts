/**
 * Chapter Intelligence Service
 * Intelligent chapter detection and splitting
 */

export interface ChapterStructure {
  title: string
  content: string
  startIndex: number
  endIndex: number
  wordCount: number
  paragraphCount: number
}

export interface ChapterAnalysis {
  chapters: ChapterStructure[]
  totalChapters: number
  averageChapterSize: number
  suggestedBreaks: number[]
}

export class ChapterIntelligence {
  /**
   * Detect chapter markers in text
   * Looks for common patterns: "الفصل", "Chapter", numbered markers, etc.
   */
  static detectChapterMarkers(text: string): Array<{ index: number; title: string }> {
    const markers: Array<{ index: number; title: string }> = []

    // Arabic chapter patterns
    const arabicPatterns = [
      /الفصل\s+(\d+)\s*[:：]\s*(.+?)(?=\n|$)/gi,
      /الفصل\s+(\d+)\s*\n\s*(.+?)(?=\n|$)/gi,
      /^(الفصل\s+[\u0660-\u0669]+.*?)$/gm,
      /^(فصل\s+[\u0660-\u0669]+.*?)$/gm
    ]

    // English chapter patterns
    const englishPatterns = [
      /Chapter\s+(\d+)\s*[:：]\s*(.+?)(?=\n|$)/gi,
      /CHAPTER\s+(\d+)\s*\n\s*(.+?)(?=\n|$)/gi
    ]

    // Combined patterns
    const allPatterns = [...arabicPatterns, ...englishPatterns]

    for (const pattern of allPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        markers.push({
          index: match.index,
          title: match[0].trim()
        })
      }
    }

    // Remove duplicates and sort
    return markers
      .filter((m, i, arr) => i === 0 || arr[i - 1].index !== m.index)
      .sort((a, b) => a.index - b.index)
  }

  /**
   * Analyze text and suggest chapter breaks
   * Uses NLP-like approach to detect natural breaks
   */
  static analyzeForChapterBreaks(text: string): ChapterAnalysis {
    const markers = this.detectChapterMarkers(text)

    // If explicit markers found, use them
    if (markers.length > 0) {
      return this.splitByMarkers(text, markers)
    }

    // Otherwise, use intelligent analysis
    return this.intelligentChapterDetection(text)
  }

  /**
   * Split text by detected chapter markers
   */
  private static splitByMarkers(
    text: string,
    markers: Array<{ index: number; title: string }>
  ): ChapterAnalysis {
    const chapters: ChapterStructure[] = []

    for (let i = 0; i < markers.length; i++) {
      const startIndex = markers[i].index
      const endIndex = i < markers.length - 1 ? markers[i + 1].index : text.length
      const content = text.substring(startIndex, endIndex).trim()

      if (content.length > 50) {
        // Only include substantial chapters
        chapters.push({
          title: markers[i].title,
          content,
          startIndex,
          endIndex,
          wordCount: content.split(/\s+/).length,
          paragraphCount: content.split(/\n\n+/).length
        })
      }
    }

    return {
      chapters,
      totalChapters: chapters.length,
      averageChapterSize: chapters.reduce((sum, c) => sum + c.wordCount, 0) / chapters.length,
      suggestedBreaks: chapters.map(c => c.startIndex)
    }
  }

  /**
   * Intelligent chapter detection without explicit markers
   * Uses paragraph analysis and content structure
   */
  private static intelligentChapterDetection(text: string): ChapterAnalysis {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
    const chapters: ChapterStructure[] = []
    const averageWordsPerChapter = 1500 // Target chapter size

    let currentChapter = {
      title: 'الفصل الأول',
      content: '',
      startIndex: 0,
      paragraphs: [] as string[]
    }
    let chapterNumber = 1
    let currentWordCount = 0
    let currentCharIndex = 0

    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/).length
      const isNewSection = this.isNewSection(paragraph)

      // Check if we should start a new chapter
      if (
        (currentWordCount > averageWordsPerChapter && isNewSection) ||
        currentWordCount > averageWordsPerChapter * 1.5
      ) {
        // Save current chapter
        if (currentChapter.content.length > 100) {
          chapters.push({
            title: currentChapter.title,
            content: currentChapter.content,
            startIndex: currentChapter.startIndex,
            endIndex: currentCharIndex,
            wordCount: currentWordCount,
            paragraphCount: currentChapter.paragraphs.length
          })
        }

        // Start new chapter
        chapterNumber++
        currentChapter = {
          title: `الفصل ${this.numberToArabic(chapterNumber)}`,
          content: '',
          startIndex: currentCharIndex,
          paragraphs: []
        }
        currentWordCount = 0
      }

      currentChapter.content += paragraph + '\n\n'
      currentChapter.paragraphs.push(paragraph)
      currentWordCount += words
      currentCharIndex += paragraph.length + 2
    }

    // Add final chapter
    if (currentChapter.content.length > 100) {
      chapters.push({
        title: currentChapter.title,
        content: currentChapter.content,
        startIndex: currentChapter.startIndex,
        endIndex: currentCharIndex,
        wordCount: currentWordCount,
        paragraphCount: currentChapter.paragraphs.length
      })
    }

    const averageSize =
      chapters.reduce((sum, c) => sum + c.wordCount, 0) / Math.max(chapters.length, 1)

    return {
      chapters,
      totalChapters: chapters.length,
      averageChapterSize: averageSize,
      suggestedBreaks: chapters.map(c => c.startIndex)
    }
  }

  /**
   * Detect if paragraph is a new section/chapter start
   */
  private static isNewSection(paragraph: string): boolean {
    const firstLine = paragraph.split('\n')[0]
    const lineLength = firstLine.length

    // Indicators of a new section
    const indicators = [
      firstLine.match(/^#+\s/) !== null, // Markdown headers
      firstLine.match(/^[*-]{3,}$/) !== null, // Separators
      lineLength < 100 && lineLength > 10, // Short title-like lines
      firstLine.match(/^(الفصل|فصل|chapter|الباب|section)/i) !== null,
      firstLine.match(/^\d+\.\s+/) !== null // Numbered sections
    ]

    return indicators.filter(i => i).length > 0
  }

  /**
   * Convert numbers to Arabic numerals
   */
  private static numberToArabic(num: number): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
    const str = num.toString()
    return str
      .split('')
      .map(digit => arabicNumerals[parseInt(digit)])
      .join('')
  }

  /**
   * Suggest chapter titles based on content
   */
  static generateChapterTitles(chapters: ChapterStructure[]): string[] {
    return chapters.map((chapter, index) => {
      // If title is generic, try to generate from content
      if (chapter.title.match(/الفصل|chapter|فصل/i)) {
        const title = this.extractTitleFromContent(chapter.content)
        return title || chapter.title
      }
      return chapter.title
    })
  }

  /**
   * Extract potential title from chapter content
   */
  private static extractTitleFromContent(content: string): string | null {
    const lines = content.split('\n').filter(l => l.trim().length > 0)

    // First line might be title
    const firstLine = lines[0]
    if (firstLine && firstLine.length < 80 && firstLine.length > 5) {
      // Check if it looks like a title
      const words = firstLine.split(/\s+/)
      if (words.length <= 8) {
        return firstLine.trim()
      }
    }

    // Look for short, standalone paragraphs
    for (const line of lines.slice(1, 5)) {
      const trimmed = line.trim()
      if (trimmed.length < 100 && trimmed.length > 5) {
        const words = trimmed.split(/\s+/)
        if (words.length <= 6 && !trimmed.match(/^(في|على|من|بـ|و)/)) {
          return trimmed
        }
      }
    }

    return null
  }

  /**
   * Merge small chapters
   */
  static mergeSmallChapters(
    chapters: ChapterStructure[],
    minWordCount: number = 300
  ): ChapterStructure[] {
    const merged: ChapterStructure[] = []
    let buffer: ChapterStructure | null = null

    for (const chapter of chapters) {
      if (chapter.wordCount < minWordCount) {
        // Merge with buffer or previous chapter
        if (buffer) {
          buffer.content += '\n\n' + chapter.content
          buffer.wordCount += chapter.wordCount
          buffer.paragraphCount += chapter.paragraphCount
          buffer.endIndex = chapter.endIndex
        } else if (merged.length > 0) {
          const lastChapter = merged[merged.length - 1]
          lastChapter.content += '\n\n' + chapter.content
          lastChapter.wordCount += chapter.wordCount
          lastChapter.paragraphCount += chapter.paragraphCount
          lastChapter.endIndex = chapter.endIndex
        } else {
          buffer = { ...chapter }
        }
      } else {
        if (buffer) {
          merged.push(buffer)
          buffer = null
        }
        merged.push(chapter)
      }
    }

    if (buffer) {
      merged.push(buffer)
    }

    return merged
  }

  /**
   * Split large chapters
   */
  static splitLargeChapters(
    chapters: ChapterStructure[],
    maxWordCount: number = 5000
  ): ChapterStructure[] {
    const split: ChapterStructure[] = []

    for (const chapter of chapters) {
      if (chapter.wordCount <= maxWordCount) {
        split.push(chapter)
      } else {
        // Split into sections
        const paragraphs = chapter.content.split(/\n\n+/).filter(p => p.trim().length > 0)
        let currentSection = {
          ...chapter,
          content: '',
          wordCount: 0,
          paragraphCount: 0
        }
        let sectionIndex = 1

        for (const paragraph of paragraphs) {
          const words = paragraph.split(/\s+/).length

          if (currentSection.wordCount + words > maxWordCount && currentSection.wordCount > 0) {
            split.push(currentSection)
            sectionIndex++
            currentSection = {
              ...chapter,
              title: `${chapter.title} - جزء ${sectionIndex}`,
              content: '',
              wordCount: 0,
              paragraphCount: 0
            }
          }

          currentSection.content += paragraph + '\n\n'
          currentSection.wordCount += words
          currentSection.paragraphCount += 1
        }

        if (currentSection.wordCount > 0) {
          split.push(currentSection)
        }
      }
    }

    return split
  }
}
