import Head from 'next/head'
import { useState, useRef } from 'react'
import { Save, Download, Eye } from 'lucide-react'
import { useRouter } from 'next/router'

export default function Editor() {
  const router = useRouter()
  const [title, setTitle] = useState('كتابي الجديد')
  const [content, setContent] = useState('')
  const [style, setStyle] = useState('minimal')
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const handleSave = async () => {
    console.log('Saving...', { title, content, style })
  }

  const handleExport = async () => {
    console.log('Exporting...')
  }

  return (
    <>
      <Head>
        <title>{title} - محرر الكتب</title>
      </Head>

      <main className="min-h-screen bg-primary-50 text-right" dir="rtl">
        {/* Toolbar */}
        <div className="bg-white border-b border-primary-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold text-primary-900 bg-transparent border-none focus:outline-none"
              placeholder="عنوان الكتاب"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="p-2 hover:bg-primary-100 rounded-lg transition"
                title="حفظ"
              >
                <Save className="w-5 h-5 text-primary-700" />
              </button>
              <button
                className="p-2 hover:bg-primary-100 rounded-lg transition"
                title="معاينة"
              >
                <Eye className="w-5 h-5 text-primary-700" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 hover:bg-primary-100 rounded-lg transition"
                title="تحميل"
              >
                <Download className="w-5 h-5 text-primary-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-primary-200">
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 p-6 border-none focus:outline-none resize-none font-serif text-primary-900 placeholder-primary-400"
                placeholder="ابدأ بكتابة نصك هنا..."
                style={{ fontFamily: 'var(--font-arabic)' }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Style Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-4">
              <h3 className="font-bold text-primary-900 mb-3">نمط الكتاب</h3>
              <div className="space-y-2">
                {[
                  { value: 'minimal', label: 'Minimal' },
                  { value: 'philosophical', label: 'فلسفي' },
                  { value: 'literary', label: 'أدبي' },
                  { value: 'academic', label: 'أكاديمي' },
                  { value: 'novel', label: 'روائي' },
                  { value: 'reflective', label: 'تأملي' }
                ].map((s) => (
                  <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="style"
                      value={s.value}
                      checked={style === s.value}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-primary-700">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-4">
              <h3 className="font-bold text-primary-900 mb-3">الإحصائيات</h3>
              <div className="space-y-2 text-sm text-primary-700">
                <p>الكلمات: {content.split(/\s+/).length - 1}</p>
                <p>الأحرف: {content.length}</p>
                <p>الفقرات: {content.split('\n\n').length}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
