import express, { Router, Request, Response } from 'express'
import { ChapterIntelligence } from '../services/chapterIntelligence'
import { StyleDetectionService } from '../services/styleDetectionService'
import { TextAnalyzer } from '../services/textAnalyzer'
import { WritingMemoryService } from '../services/writingMemoryService'

const router = express.Router()

/**
 * Analyze text for intelligent book creation
 * POST /api/analyze
 * {
 *   text: string,
 *   authorId?: string
 * }
 */
router.post('/analyze', (req: Request, res: Response) => {
  try {
    const { text, authorId = 'user-default' } = req.body

    if (!text || text.length < 100) {
      return res.status(400).json({ error: 'Text too short. Minimum 100 characters.' })
    }

    // 1. Detect chapters
    const chapterAnalysis = ChapterIntelligence.analyzeForChapterBreaks(text)

    // 2. Detect style
    const styleProfile = StyleDetectionService.detectStyle(text)

    // 3. Analyze text metrics
    const textAnalysis = TextAnalyzer.analyze(text)

    // 4. Get author recommendations
    const authorRecommendations = WritingMemoryService.getRecommendations(authorId)

    // 5. Suggest final formatting
    const formattingRecommendations = StyleDetectionService.getStyleRecommendations(
      styleProfile.style
    )

    res.json({
      success: true,
      data: {
        analysis: {
          text: {
            wordCount: textAnalysis.wordCount,
            paragraphCount: textAnalysis.paragraphCount,
            sentenceCount: textAnalysis.sentenceCount,
            readabilityScore: textAnalysis.readabilityScore,
            averageWordLength: textAnalysis.averageWordLength
          },
          style: {
            detected: styleProfile.style,
            confidence: styleProfile.confidence,
            indicators: styleProfile.indicators,
            metrics: styleProfile.metrics
          },
          chapters: {
            detected: chapterAnalysis.totalChapters,
            averageSize: Math.round(chapterAnalysis.averageChapterSize),
            chapters: chapterAnalysis.chapters.map(c => ({
              title: c.title,
              wordCount: c.wordCount,
              paragraphCount: c.paragraphCount
            }))
          }
        },
        recommendations: {
          style: styleProfile.style,
          formatting: formattingRecommendations,
          authorPreferences: authorRecommendations
        }
      }
    })
  } catch (error: any) {
    console.error('Analysis error:', error)
    res.status(500).json({ error: 'Analysis failed: ' + error.message })
  }
})

/**
 * Process text and create intelligent book structure
 * POST /api/process
 * {
 *   text: string,
 *   style?: string,
 *   authorId?: string
 * }
 */
router.post('/process', (req: Request, res: Response) => {
  try {
    const { text, style, authorId = 'user-default' } = req.body

    // Analyze chapters
    let chapters = ChapterIntelligence.analyzeForChapterBreaks(text).chapters

    // Normalize chapters
    const minWords = 300
    const maxWords = 5000
    chapters = ChapterIntelligence.mergeSmallChapters(chapters, minWords)
    chapters = ChapterIntelligence.splitLargeChapters(chapters, maxWords)

    // Get chapter titles
    const titles = ChapterIntelligence.generateChapterTitles(chapters)
    chapters = chapters.map((c, i) => ({ ...c, title: titles[i] }))

    // Detect or use provided style
    const detectedStyle =
      style || StyleDetectionService.detectStyle(text).style

    // Get formatting
    const formatting = StyleDetectionService.getStyleRecommendations(detectedStyle)

    // Learn from this book if authorId provided
    WritingMemoryService.learnFromBook(authorId, {
      id: `book-${Date.now()}`,
      title: 'كتاب جديد',
      content: text,
      style: detectedStyle,
      chapters: chapters.map(c => ({ title: c.title, content: c.content })),
      readabilityScore: TextAnalyzer.analyze(text).readabilityScore
    })

    res.json({
      success: true,
      data: {
        chapters: chapters.map((c, i) => ({
          number: i + 1,
          title: c.title,
          wordCount: c.wordCount,
          paragraphCount: c.paragraphCount,
          preview: c.content.substring(0, 200) + '...'
        })),
        style: detectedStyle,
        formatting,
        totalChapters: chapters.length,
        estimatedPages: Math.ceil(chapters.reduce((s, c) => s + c.wordCount, 0) / 250)
      }
    })
  } catch (error: any) {
    console.error('Processing error:', error)
    res.status(500).json({ error: 'Processing failed: ' + error.message })
  }
})

/**
 * Get author writing profile
 * GET /api/author/:authorId/profile
 */
router.get('/author/:authorId/profile', (req: Request, res: Response) => {
  try {
    const { authorId } = req.params

    const statistics = WritingMemoryService.getWritingStatistics(authorId)
    const recommendations = WritingMemoryService.getRecommendations(authorId)
    const prediction = WritingMemoryService.predictNextStyle(authorId)

    res.json({
      success: true,
      data: {
        statistics,
        recommendations,
        prediction
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get profile: ' + error.message })
  }
})

/**
 * Get author writing memory summary
 * GET /api/author/:authorId/summary
 */
router.get('/author/:authorId/summary', (req: Request, res: Response) => {
  try {
    const { authorId } = req.params
    const summary = WritingMemoryService.getProfileSummary(authorId)

    res.json({
      success: true,
      data: { summary }
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get summary: ' + error.message })
  }
})

/**
 * Detect chapters only
 * POST /api/detect-chapters
 */
router.post('/detect-chapters', (req: Request, res: Response) => {
  try {
    const { text } = req.body

    if (!text || text.length < 100) {
      return res.status(400).json({ error: 'Text too short' })
    }

    const analysis = ChapterIntelligence.analyzeForChapterBreaks(text)

    res.json({
      success: true,
      data: {
        chapters: analysis.chapters.map(c => ({
          title: c.title,
          wordCount: c.wordCount,
          paragraphCount: c.paragraphCount,
          startIndex: c.startIndex,
          endIndex: c.endIndex
        })),
        totalChapters: analysis.totalChapters,
        averageChapterSize: Math.round(analysis.averageChapterSize)
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Chapter detection failed: ' + error.message })
  }
})

/**
 * Detect style only
 * POST /api/detect-style
 */
router.post('/detect-style', (req: Request, res: Response) => {
  try {
    const { text } = req.body

    if (!text || text.length < 100) {
      return res.status(400).json({ error: 'Text too short' })
    }

    const styleProfile = StyleDetectionService.detectStyle(text)
    const formatting = StyleDetectionService.getStyleRecommendations(styleProfile.style)

    res.json({
      success: true,
      data: {
        style: styleProfile.style,
        confidence: styleProfile.confidence,
        indicators: styleProfile.indicators,
        metrics: styleProfile.metrics,
        formatting
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Style detection failed: ' + error.message })
  }
})

export default router
