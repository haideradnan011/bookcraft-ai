import Head from 'next/head'
import { useState } from 'react'
import { Zap, BookOpen, FileText } from 'lucide-react'
import { useAnalysis } from '@/hooks/useAnalysis'

export default function Analysis() {
  const [text, setText] = useState('')
  const [activeTab, setActiveTab] = useState<'analyze' | 'chapters' | 'style'>('analyze')
  const { loading, error, result, analyzeText, detectChapters, detectStyle } = useAnalysis()

  const handleAnalyze = async () => {
    if (text.length < 100) {
      alert('الرجاء إدخال نص بطول 100 حرف على الأقل')
      return
    }

    try {
      if (activeTab === 'analyze') {
        await analyzeText(text)
      } else if (activeTab === 'chapters') {
        await detectChapters(text)
      } else if (activeTab === 'style') {
        await detectStyle(text)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <Head>
        <title>تحليل النص - BookCraft AI</title>
      </Head>

      <main className="min-h-screen bg-primary-50 text-right" dir="rtl">
        {/* Header */}
        <header className="bg-white border-b border-primary-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-primary-900">تحليل النص الذكي</h1>
            <p className="text-primary-700 mt-2">
              دع BookCraft يحلل نصك ويقسمه لفصول تلقائياً
            </p>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-6">
                <label className="block text-sm font-bold text-primary-900 mb-2">
                  النص المراد تحليله
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="الصق نصك هنا... (يجب أن يكون 100 حرف على الأقل)"
                  className="w-full h-64 p-4 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 resize-none"
                  dir="rtl"
                />
                <div className="mt-4 text-sm text-primary-700">
                  عدد الأحرف: {text.length} | عدد الكلمات: {text.split(/\s+/).length - 1}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-4">
                <h3 className="font-bold text-primary-900 mb-4">نوع التحليل</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('analyze')}
                    className={`w-full p-3 rounded-lg text-right flex items-center gap-2 transition ${
                      activeTab === 'analyze'
                        ? 'bg-primary-700 text-white'
                        : 'bg-primary-50 text-primary-900 hover:bg-primary-100'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    تحليل شامل
                  </button>
                  <button
                    onClick={() => setActiveTab('chapters')}
                    className={`w-full p-3 rounded-lg text-right flex items-center gap-2 transition ${
                      activeTab === 'chapters'
                        ? 'bg-primary-700 text-white'
                        : 'bg-primary-50 text-primary-900 hover:bg-primary-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    تقسيم الفصول
                  </button>
                  <button
                    onClick={() => setActiveTab('style')}
                    className={`w-full p-3 rounded-lg text-right flex items-center gap-2 transition ${
                      activeTab === 'style'
                        ? 'bg-primary-700 text-white'
                        : 'bg-primary-50 text-primary-900 hover:bg-primary-100'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    كشف الأسلوب
                  </button>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || text.length < 100}
                className="w-full p-4 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:bg-primary-300 transition font-bold"
              >
                {loading ? 'جاري التحليل...' : 'تحليل النص'}
              </button>
            </div>
          </div>

          {/* Results */}
          {error && (
            <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-primary-200 p-6">
              {activeTab === 'analyze' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-primary-900 mb-4">إحصائيات النص</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {result.analysis.text && (
                        <>
                          <div className="p-4 bg-primary-50 rounded-lg">
                            <p className="text-primary-700 text-sm">الكلمات</p>
                            <p className="text-2xl font-bold text-primary-900">
                              {result.analysis.text.wordCount}
                            </p>
                          </div>
                          <div className="p-4 bg-primary-50 rounded-lg">
                            <p className="text-primary-700 text-sm">الفقرات</p>
                            <p className="text-2xl font-bold text-primary-900">
                              {result.analysis.text.paragraphCount}
                            </p>
                          </div>
                          <div className="p-4 bg-primary-50 rounded-lg">
                            <p className="text-primary-700 text-sm">الجمل</p>
                            <p className="text-2xl font-bold text-primary-900">
                              {result.analysis.text.sentenceCount}
                            </p>
                          </div>
                          <div className="p-4 bg-primary-50 rounded-lg">
                            <p className="text-primary-700 text-sm">قابلية القراءة</p>
                            <p className="text-2xl font-bold text-primary-900">
                              {Math.round(result.analysis.text.readabilityScore)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {result.analysis.style && (
                    <div>
                      <h3 className="text-xl font-bold text-primary-900 mb-4">الأسلوب المكتشف</h3>
                      <div className="p-4 bg-primary-50 rounded-lg">
                        <p className="text-lg font-bold text-primary-900 mb-2">
                          {result.analysis.style.detected}
                        </p>
                        <p className="text-primary-700 mb-3">
                          درجة الثقة: {result.analysis.style.confidence}%
                        </p>
                        <div className="space-y-1">
                          {result.analysis.style.indicators.map((ind: string, i: number) => (
                            <p key={i} className="text-primary-700 text-sm">
                              ✓ {ind}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {result.analysis.chapters && (
                    <div>
                      <h3 className="text-xl font-bold text-primary-900 mb-4">الفصول المكتشفة</h3>
                      <p className="text-primary-700 mb-4">
                        تم اكتشاف {result.analysis.chapters.detected} فصول
                      </p>
                      <div className="space-y-3">
                        {result.analysis.chapters.chapters.slice(0, 5).map(
                          (ch: any, i: number) => (
                            <div key={i} className="p-3 bg-primary-50 rounded-lg">
                              <p className="font-bold text-primary-900">{ch.title}</p>
                              <p className="text-sm text-primary-700">
                                {ch.wordCount} كلمة • {ch.paragraphCount} فقرات
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'chapters' && result.chapters && (
                <div>
                  <h3 className="text-xl font-bold text-primary-900 mb-4">
                    تقسيم الفصول ({result.totalChapters})
                  </h3>
                  <div className="space-y-3">
                    {result.chapters.map((ch: any, i: number) => (
                      <div key={i} className="p-4 bg-primary-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-primary-900 mb-1">{ch.title}</p>
                            <p className="text-sm text-primary-700">
                              {ch.wordCount.toLocaleString('ar-SA')} كلمة •{' '}
                              {ch.paragraphCount} فقرات
                            </p>
                          </div>
                          <span className="text-xs bg-primary-700 text-white px-2 py-1 rounded">
                            الفصل {i + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'style' && result.style && (
                <div>
                  <h3 className="text-xl font-bold text-primary-900 mb-4">
                    معلومات الأسلوب
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <p className="text-primary-700 text-sm mb-1">نوع الأسلوب</p>
                      <p className="text-2xl font-bold text-primary-900">{result.style}</p>
                    </div>
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <p className="text-primary-700 text-sm mb-1">درجة الثقة</p>
                      <p className="text-2xl font-bold text-primary-900">
                        {result.confidence}%
                      </p>
                    </div>
                  </div>
                  {result.formatting && (
                    <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                      <p className="font-bold text-primary-900 mb-2">التنسيق الموصى به</p>
                      <ul className="space-y-1 text-sm text-primary-700">
                        <li>حجم الخط: {result.formatting.fontSize}pt</li>
                        <li>ارتفاع السطر: {result.formatting.lineHeight}</li>
                        <li>المسافة بين الفقرات: {result.formatting.spacing}px</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
