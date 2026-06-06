/**
 * API Client
 * Centralized API calls
 */

import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const api = {
  // Books
  getBooks: () => client.get('/books'),
  createBook: (data: any) => client.post('/books', data),
  getBook: (id: string) => client.get(`/books/${id}`),
  updateBook: (id: string, data: any) => client.put(`/books/${id}`, data),
  deleteBook: (id: string) => client.delete(`/books/${id}`),

  // Chapters
  getChapters: (bookId: string) => client.get(`/chapters/${bookId}`),
  createChapter: (bookId: string, data: any) => client.post(`/chapters/${bookId}`, data),
  updateChapter: (bookId: string, chapterId: string, data: any) =>
    client.put(`/chapters/${bookId}/${chapterId}`, data),
  deleteChapter: (bookId: string, chapterId: string) =>
    client.delete(`/chapters/${bookId}/${chapterId}`),

  // Export
  exportBook: (bookId: string, format: string) =>
    client.post(`/export/${bookId}`, { format })
}

export default api
